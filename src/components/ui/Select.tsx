import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, INPUT_LIMITS } from '../../constants';

export interface SelectOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  modalTitle?: string;
  editable?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecione uma opção',
  modalTitle,
  editable = false,
  disabled = false,
  maxLength = INPUT_LIMITS.defaultText,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const chooseOption = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <View className="mb-4">
      {label ? (
        <Text className="mb-2 ml-1 text-sm font-medium text-[#667085]">
          {label}
        </Text>
      ) : null}

      {editable ? (
        <View className="flex-row items-center rounded-lg border border-[#D0D5DD] bg-white">
          <TextInput
            className="flex-1 px-4 py-4 text-base text-[#344054]"
            accessibilityLabel={label || placeholder}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
            maxLength={maxLength}
          />
          <TouchableOpacity
            onPress={() => setIsOpen(true)}
            className="h-14 w-14 items-center justify-center"
            accessibilityLabel={`Abrir opções de ${label}`}
          >
            <MaterialCommunityIcons
              name="chevron-down"
              size={24}
              color="#667085"
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={modalTitle || label || placeholder}
          accessibilityState={{ expanded: isOpen, disabled }}
          onPress={() => setIsOpen(true)}
          disabled={disabled}
          className={`flex-row items-center rounded-lg border border-[#D0D5DD] bg-white px-4 py-4 ${
            disabled ? 'opacity-60' : ''
          }`}
          activeOpacity={0.75}
        >
          <View className="flex-1">
            <Text
              className={`text-base ${selected ? 'text-[#344054]' : 'text-[#667085]'}`}
            >
              {selected?.label ?? placeholder}
            </Text>
            {selected?.subtitle ? (
              <Text className="mt-1 text-xs text-[#667085]">
                {selected.subtitle}
              </Text>
            ) : null}
          </View>
          <MaterialCommunityIcons
            name="chevron-down"
            size={24}
            color="#667085"
          />
        </TouchableOpacity>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40 p-4"
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            className="max-h-[70%] rounded-lg bg-white p-5"
            onPress={(event) => event.stopPropagation()}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-[#344054]">
                {modalTitle ?? label}
              </Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                className="h-9 w-9 items-center justify-center"
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => chooseOption(option)}
                    className={`mb-2 flex-row items-center rounded-lg px-4 py-3 ${
                      isSelected ? 'bg-[#EAFBF0]' : 'bg-[#F9FAFB]'
                    }`}
                  >
                    <View className="flex-1">
                      <Text
                        className={`font-medium ${isSelected ? 'text-[#169670]' : 'text-[#344054]'}`}
                      >
                        {option.label}
                      </Text>
                      {option.subtitle ? (
                        <Text className="mt-1 text-xs text-[#667085]">
                          {option.subtitle}
                        </Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color="#169670"
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
