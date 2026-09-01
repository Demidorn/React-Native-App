import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFilterStore } from '@/store/filterStore'
import { Property } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FilterModal from '@/components/FilterModal';
import FilterChip from '@/components/FilterChip';
import { formatPrice } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import PropertyCard from '@/components/PropertyCard';

export default function Search() {
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { openFilters } = useLocalSearchParams<{ openFilters?: string }>();

  useEffect(() => {
    if (openFilters === 'true') {
      setShowFilters(true);
    }
  }, [openFilters]);

  const { search, type, bedrooms, minPrice, maxPrice, setSearch, setType, setBedrooms, setMinPrice, setMaxPrice } = useFilterStore();

  const activeFilterCount = [
    type !== null,
    bedrooms !== null,
    minPrice !== null,
    maxPrice !== null,
  ].filter(Boolean).length;

  const fetchResults = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('properties').select('*');
    if (search) {
      query = query.or(`title.ilike.%${search}%,city.ilike%${search}%`);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (bedrooms && bedrooms !== undefined) {
      query = query.eq('bedrooms', bedrooms);
    }
    if (minPrice && minPrice !== undefined) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice && maxPrice !== undefined) {
      query = query.lte('price', maxPrice)
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setResults([]);
    } else {
      setResults(data ?? []);
    }
    setLoading(false);
  }, [search, type, bedrooms, minPrice, maxPrice])


  useEffect(() => {
    fetchResults();
  }, [fetchResults])

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <View className='px-5 pt-4 pb-3'>
        <Text className='text-2xl font-bold text-gray-900 mb-4'>Find Property</Text>
        <View className='flex-row items-center gap-3'>
          <View className='flex-1 flex-row items-center  bg-white rounded-2xl px-4 gap-3'
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons name='search-outline' size={18} color='#9CA3AF' />
            <TextInput
              className='flex-1 py-3 text-gray-800'
              placeholder='search by title or city...'
              placeholderTextColor='#9CA3AF'
              value={search}
              onChangeText={setSearch}
              autoCapitalize='none'
            />

            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name='close-circle' size={18} color='#9CA3AF' />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            className={`w-12 h-12 rounded-2xl items-center justify-center ${activeFilterCount > 0 ? 'bg-blue-600' : 'bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons name='options-outline' size={20} color={activeFilterCount > 0 ? '#fff' : '#374151'} />
            {activeFilterCount > 0 && (
              <View className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center'>
                <Text className='text-white text-[9px] font-bold'>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {/* Filter chips - modals */}
        {/* {activeFilterCount > 0 && (
          <View className='flew-raw flex-wrap gap-2 mt-3'>
            {type && (
              <View className='flex-raw items-center bg-blue-500 border border-blue-200 rounded-full px-3 py-1  gap-1'>
                <Text className='text-blue-700 text-xs  font-semibold capitalize'>
                  {type }
                </Text>
                <TouchableOpacity onPress={() => setType(null)}>
                  <Ionicons name='close' size={18} color='#1D4ED8'  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )} */}

        {activeFilterCount > 0 && (
          <View className='flex-row flex-wrap gap-2 mt-3'>
            {type && <FilterChip label={type} onRemove={() => setType(null)} />}

            {bedrooms !== null && (
              <FilterChip
                label={bedrooms === 4 ? '4+ beds' : `${bedrooms} bed${bedrooms > 1 ? 's' : ''}`}
                onRemove={() => setBedrooms(null)}
              />
            )}
            {/* combined chip, tapping remove should clear both minPrice and maxPrice together: */}
            {(minPrice !== null && maxPrice !== null) ? (
              <FilterChip
                label={`$${formatPrice(minPrice)} - $${formatPrice(maxPrice)}`}
                onRemove={() => {
                  setMinPrice(null);
                  setMaxPrice(null);
                }}
              />
            ) : (
              <>
                {minPrice !== null && (
                  <FilterChip label={`From $${formatPrice(minPrice)}`} onRemove={() => setMinPrice(null)} />
                )}
                {maxPrice !== null && (
                  <FilterChip label={`Up to $${formatPrice(maxPrice)}`} onRemove={() => setMaxPrice(null)} />
                )}
              </>
            )}
          </View>
        )}
      </View>
      {/* Results -  all search results  after applying filters*/}
      
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          // <View className='px-5'>
          //   {loading ? 'searching...' : `${results.length} properties found`}(
          //     <Text className='text-gray-500'>Loading...</Text>
          //   ) : (
          //     <Text className='text-gray-700'>Found {results.length} result{results.length !== 1 ? 's' : ''}</Text>
          //   )}
          //   {results.map((r) => (
          //     <View key={r.id} className='mt-3 p-3 bg-white rounded-lg'>
          //       <Text className='text-base font-semibold'>{r.title}</Text>
          //       <Text className='text-sm text-gray-500'>{r.city} • {r.bedrooms} bed{r.bedrooms > 1 ? 's' : ''}</Text>
          //       <Text className='text-sm text-gray-800'>${formatPrice(r.price)}</Text>
          //     </View>
          //   ))}
          // </View>
          <Text className='text-sm text-gray-400 mb-4'>{loading ? 'searching...' : `${results.length} properties found`}
          </Text>
        }
        renderItem={({ item }) => (
            <PropertyCard property={item} />
        )}
        ListEmptyComponent={
          !loading ? (
            <View className='items-center py-10'>
              <Text>No property found</Text>
              <Text className='text-gray-300 text-sm mt-1'>Try a different search or adjust filters</Text>
            </View>
          // ) : null
          ) : (
              <ActivityIndicator size='large' color='#2563EB' className='py-20'/>
          )
        }
      />



      {/* filter modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />



    </SafeAreaView>
  )
}