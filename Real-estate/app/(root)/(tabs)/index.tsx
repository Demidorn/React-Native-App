import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useCallback, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import { Property } from '@/types';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import FeaturedCard from '@/components/FeaturedCard';
import PropertyCard from '@/components/PropertyCard';

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [featured, setFeatured] = useState<Property[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // console.log(featured, recommended)

  const fetchProperties = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [featuredResponse, recommendedResponse] = await Promise.all([
        supabase
          .from('properties')
          .select('*')
          .eq('is_featured', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('properties')
          .select('*')
          .eq('is_featured', false)
          .order('created_at', { ascending: false }),
      ]);

      const { data: featuredData, error: featuredError } = featuredResponse;
      if (featuredError) throw featuredError;

      const { data: recommendedData, error: recommendedError } = recommendedResponse;
      if (recommendedError) throw recommendedError;

      setFeatured(featuredData ?? []);
      setRecommended(recommendedData ?? []);
    } catch (error) {
      const supabaseError = error as {
        code?: string;
        message?: string;
        details?: string;
        hint?: string;
      };
      const message = supabaseError.message ?? 'Failed to load properties.';

      console.error('Error fetching properties:', {
        code: supabaseError.code,
        message,
        details: supabaseError.details,
        hint: supabaseError.hint,
      });
      setErrorMessage(message);
      setFeatured([]);
      setRecommended([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [])
  );

  return (
     <SafeAreaView className="flex-1 p-6 bg-gray-50">
      <FlatList
        data={recommended}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {errorMessage && (
              <View className='mx-5 mb-4 rounded-xl bg-red-50 px-4 py-3'>
                <Text className='text-sm text-red-700'>{errorMessage}</Text>
              </View>
            )}
            {/* Header*/}
            <View className='flex-row items-center justify-between px-5 pt-t pb-5'>
              <Image
                source={require('../../../assets/images/karibuhomes.png')}
                style={{ width: 90, height: 90 }}
                resizeMode='contain'
              />
              <View className='items-end'>
                <Text>Hello 👋</Text>
                <Text>{user?.firstName ?? 'User'}</Text>
              </View>
            </View>

            {/* search bar*/}
            <TouchableOpacity
              onPress={() => router.push('/(root)/(tabs)/search')}
              className='mx-5 mb-6 flex-row items-center bg-white rounded-2xl px-4 py-3 gap-3'
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Ionicons name='search-outline' size={20} color='#9CA3AF' />
              <Text className='text-gray-400 text-sm flex-1'>Search properties, cities...</Text>
              <TouchableOpacity
                onPress={() => router.push('/(root)/(tabs)/search?openfilters=true')}
                className='w-8 h-8 bg-blue-600 rounded-xl items-center justify-center'
              >
                <Ionicons name='options-outline' size={15} color='white' />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Featured section*/}
            <View className='mb-6'>
              <Text className='text-gray-900 text-lg  font-bold  px-5 mb-4'>Featured</Text>
              {loading ? (
                <ActivityIndicator
                  color='#2563EB'
                  className='py-10'
                />
              ) : (
                  <FlatList
                    data={featured}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <FeaturedCard property={item} />}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20}}
                  />
              )}
            </View>

            {/* Recommended Header*/}
            <Text className='text-gray-900 text-lg font-bold px-5 mb-4'>Recommended</Text>

          </View>
        }
        renderItem={({ item }) => (
          <View className='px-5'>
            <PropertyCard property={item} />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className='items-center py-10'>
              <Text>No property found</Text>
            </View>
          ) : null
        }
      />
     </SafeAreaView>
  )
}
