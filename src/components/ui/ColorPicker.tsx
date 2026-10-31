import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, Text, TouchableOpacity, View } from 'react-native';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  colors: string[];
}

const EXTRA_COLORS = [
  '#DC2626', '#EA580C', '#CA8A04', '#65A30D', '#16A34A', '#0D9488',
  '#0891B2', '#2563EB', '#4F46E5', '#7C3AED', '#C026D3', '#DB2777',
  '#475569', '#171717', '#92400E', '#0369A1', '#4338CA', '#BE123C',
];

export function ColorPicker({ label, value, onChange, colors }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const allColors = [...new Set([...colors, ...EXTRA_COLORS])];

  const webInput = Platform.OS === 'web'
    ? React.createElement('input' as never, {
        type: 'color',
        value,
        onChange: (event: { target: { value: string } }) => onChange(event.target.value.toUpperCase()),
        'aria-label': label,
        style: {
          width: 56,
          height: 48,
          padding: 2,
          border: '1px solid #D0D5DD',
          borderRadius: 14,
          backgroundColor: '#FFFFFF',
          cursor: 'pointer',
        },
      } as never)
    : null;

  return (
    <View className="mb-6">
      <Text className="mb-3 ml-1 text-sm font-medium text-[#667085]">{label}</Text>
      <View className="flex-row flex-wrap items-center gap-3">
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => onChange(color)}
            className={`h-11 w-11 items-center justify-center rounded-full ${value === color ? 'border-4 border-white' : ''}`}
            style={{ backgroundColor: color, elevation: value === color ? 3 : 0 }}
            accessibilityLabel={`Selecionar cor ${color}`}
          >
            {value === color ? <MaterialCommunityIcons name="check" size={19} color="#FFFFFF" /> : null}
          </TouchableOpacity>
        ))}

        {webInput ?? (
          <TouchableOpacity
            onPress={() => setIsOpen(true)}
            className="h-12 w-12 items-center justify-center rounded-[14px] border border-[#D0D5DD]"
            style={{ backgroundColor: value }}
            accessibilityLabel="Escolher outra cor"
          >
            <MaterialCommunityIcons name="palette-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable className="flex-1 items-center justify-center bg-black/40 p-4" onPress={() => setIsOpen(false)}>
          <Pressable className="w-full max-w-[380px] rounded-[24px] bg-white p-5" onPress={(event) => event.stopPropagation()}>
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-[#344054]">Escolha uma cor</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} className="h-9 w-9 items-center justify-center">
                <MaterialCommunityIcons name="close" size={22} color="#667085" />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap justify-center gap-4">
              {allColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => {
                    onChange(color);
                    setIsOpen(false);
                  }}
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: color }}
                >
                  {value === color ? <MaterialCommunityIcons name="check" size={21} color="#FFFFFF" /> : null}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
