import { View, ScrollView , Image, Text, TextInput, TouchableOpacity, ActivityIndicator} from 'react-native'
import React, { useState } from 'react'
import { useAuth, useSignUp } from '@clerk/expo'
import { Link, useRouter } from 'expo-router';

export default function SignUp() {

  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();

  const router = useRouter();

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  const isLoading = fetchStatus === 'fetching';

  if (signUp.status === 'complete' || isSignedIn) {
    return null;
  }

  const onSignUpPress = async () => {
    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName,
      lastName
    });

    if (error) {
      // console.error(JSON.stringify(error, null, 2));
      alert(error.message);
      return;
    }

    if (!error) await signUp.verifications.sendEmailCode();
  };

  const onVerifyPress = async () => {
    await signUp.verifications.verifyEmailCode({
      code
    });
    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl('/');
          router.replace(url as any);
        },
      });
    }
  };

  if (signUp.status === 'missing_requirements' && signUp.unverifiedFields.includes('email_address') && signUp.missingFields.length === 0) {
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
          {errors.fields.code && (
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
          onPress={() => signUp.verifications.sendEmailCode()}
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
          Create account</Text>
        <Text className='text-gray-500 mb-8'> Find your dream home today</Text>

        <View className='flex-row gap-3 mb-4'>
          <TextInput
            placeholder='First Name'
            className='flex-1 border border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholderTextColor='#9CA3AF'
            autoCapitalize='words'
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            placeholder='Last Name'
            className='flex-1 border border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholderTextColor='#9CA3AF'
            autoCapitalize='words'
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        <TextInput
            placeholder='Email address'
            className='w-full border border-gray-300 rounded-xl py-2 px-4 mb-4  focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholderTextColor='#9CA3AF'
            autoCapitalize='none'
            value={email}
            onChangeText={setEmail}
        />
        {errors.fields.emailAddress && (
          <Text className='text-red-500 mb-2'>
            {errors.fields.emailAddress.message}
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
          onPress={onSignUpPress}
          disabled={isLoading}
          className='w-full bg-blue-500 py-4 rounded-xl items-center mb-4'
        >
          {isLoading ? (
            <ActivityIndicator color='white' />
          ) : (
              <Text className='text-white font-bold text-base'> Sign Up</Text>
          )}
        </TouchableOpacity>
        <View className='flex-row justify-center'>
          <Text>Already have an accout?</Text>
          <Link href='/sign-in'>
            <Text className='text-blue-600 font-semibold'> Sign In</Text>
          </Link>
        </View>
        <View nativeID='clerk-captcha'/>
      </View>
    </ScrollView>
  );
}