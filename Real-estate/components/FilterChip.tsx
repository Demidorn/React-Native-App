import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FilterChipProps = {
  label: string;
  onRemove: () => void;
};

export default function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <View className='flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1'>
      <Text className='text-blue-700 text-xs font-semibold capitalize'>{label}</Text>
      <TouchableOpacity onPress={onRemove}>
        <Ionicons name='close' size={12} color='#1D4ED8' />
      </TouchableOpacity>
    </View>
  );
}