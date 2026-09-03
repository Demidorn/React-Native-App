import { View, Text, FlatList, ActivityIndicator } from 'react-native'
import React, { useCallback, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@clerk/expo';
import { useSupabase } from '@/hooks/useSupabase';
import { useRouter } from 'expo-router';
import { Property } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PropertyCard from '@/components/PropertyCard';

interface SavedProperty {
  id: string;
  property_id: string;
  properties: Property;
}

export default function Saved() {
  const { userId } = useAuth();
  const authSupabase = useSupabase();
  const router = useRouter();

  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data, error } = await authSupabase
      .from('saved_properties')
      .select('id, property_id, properties(*)')
      .eq('user_clerk_id', userId)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching saved properties:', error);
    } else {
      //normalize supabase result to match SavedProperty type
      const normalize = (data ?? []).map((item: any) => ({
        id: item.id,
        property_id: item.property_id,
        properties: item.properties,
      }));
      setSaved(normalize as SavedProperty[]);
      // setSaved(data as unknown as SavedProperty[]);
    }
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchSaved();
    }, [fetchSaved])
  );

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <View className='px-5 pt-4 pb-3'>
        <Text className='text-2xl font-bold text-gray-900'>saved</Text>
        {!loading && (
          <Text className='text-sm text-gray-400 mt-1'>
            {saved.length} {saved.length === 1 ? 'property' : 'properties'}
            {''}
            saved
          </Text>
        )}
      </View>
      {loading ? (
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size='large' color='#2563EB' />
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item.properties}
              onUnsave={() => 
                setSaved((prev) => prev.filter((savedItem) => savedItem.id !== item.id))
              }
              showSave
            />
          )}
          ListEmptyComponent={
            <View className='flex-1 items-center justify-center py-24'>
              <View className='w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-4'>
                <Ionicons name='heart-outline' size={36} color='#EF4444' />
                <Text className='text-gray-700 text-lg font-bold mb-1'>No saved properties</Text>
                <Text className='text-gray400 text-sm text-center px-8'>Tap the heart icon on any property to save it here</Text>
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView >
  )
}