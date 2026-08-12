import { View, ScrollView , Image, Text, TextInput, TouchableOpacity, ActivityIndicator} from 'react-native'
import React, { useState } from 'react'
import { useSignIn } from '@clerk/expo'
import { Link, useRouter } from 'expo-router';

export default function SignIn() {

  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  const isLoading = fetchStatus === 'fetching';

  const onSignInPress = async () => {
    const { error } = await signIn.password({
      emailAddress: email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (signIn?.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return; 
          }

          const url = decorateUrl('/');
          router.replace(url as any);
        },
      });
    } else if (signIn.status === 'needs_second_factor') {
      await signIn.mfa.sendPhoneCode();
    } else if (signIn.status === 'needs_client_trust') {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === 'email_code',
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      console.error("Sign-in attempt not complete:", signIn)
    }

  };

  const onVerifyPress = async () => {
     await signIn.mfa.verifyEmailCode({ code });
     
    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return; 
          }

          const url = decorateUrl('/');
          router.replace(url as any);
        },
      });
    }
  };


  if (signIn.status === 'needs_client_trust') {
    return (
     <View className='flex-1 justify-center px-6 py-12'>
        <Image source={require('../../assets/images/karibuhomes.png')}
          className='w-52 h-40 mb-6'
          resizeMode='contain'
        />
        <Text className='text-3xl font-bold text-gray-800 mb-2'>
          Verify your account{""}</Text>
        <Text className='text-gray-500 mb-8'> We sent a code tp {email}</Text>

          <TextInput
            className='w-full  border border-gray-300 rounded-xl py-3 px-4 mb-4'
            placeholder='Enter verification code'
            placeholderTextColor='#9CA3AF'
            value={code}
            onChangeText={setCode}
          />
          {errors?.fields?.code && (
            <Text className='text-red-500 mb-4'>{errors.fields.code.message}</Text>
          )}

          <TouchableOpacity
          onPress={onVerifyPress}
          disabled={isLoading}
          className='w-full bg-blue-500 py-4 rounded-xl items-center mb-4'
        >
          {isLoading ? (
            <ActivityIndicator color='white' />
          ) : (
              <Text className='text-white font-bold text-base'> Verify </Text>
          )}
        </TouchableOpacity>

         <TouchableOpacity
          onPress={() => signIn.mfa.sendEmailCode()}
          className='py-2'
        >
          <Text className='text-blue-600'> I need a new Code</Text>
          
        </TouchableOpacity>
      </View>
    );
  }
   
  return (
    <ScrollView
    contentContainerStyle={{ flexGrow: 1}}
    className=' bg-white'
    keyboardShouldPersistTaps='handled'
    >
      <View className='flex-1 justify-center px-6 py-12'>
        <Image source={require('../../assets/images/karibuhomes.png')}
          className='w-52 h-40 mb-6'
          resizeMode='contain'
        />
        <Text className='text-3xl font-bold text-gray-800 mb-2'>
          Welcome back</Text>
        <Text className='text-gray-500 mb-8'> Sign in to your account</Text>

        <TextInput
            placeholder='Email address'
            className='w-full border border-gray-300 rounded-xl py-2 px-4 mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholderTextColor='#9CA3AF'
            autoCapitalize='none'
            value={email}
            onChangeText={setEmail}
        />
        {errors.fields.identifier && (
          <Text className='text-red-500 mb-2'>
            {errors.fields.identifier.message}
          </Text>
        )}
        <TextInput
            placeholder='Password'
            className='w-full border border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 '
            placeholderTextColor='#9CA3AF'
            autoCapitalize='none'
            secureTextEntry
            value={password}
            onChangeText={setPassword}
        />
        {errors.fields.password && (
          <Text className='text-red-500 mb-2'>
            {errors.fields.password.message}
          </Text>
        )}

        <TouchableOpacity
          onPress={onSignInPress}
          disabled={isLoading}
          className='w-full bg-blue-500 py-4 rounded-xl items-center mb-4'
        >
          {isLoading ? (
            <ActivityIndicator color='white' />
          ) : (
              <Text className='text-white font-bold text-base'> Sign In</Text>
          )}
        </TouchableOpacity>
        <View className='flex-row justify-center'>
          <Text>Don&apos;t have an accout?</Text>
          <Link href='/sign-up'>
            <Text className='text-blue-600 font-semibold'> Sign Up</Text>
          </Link>
        </View>
        <View nativeID='clerk-captcha'/>
      </View>
    </ScrollView>
  );
}