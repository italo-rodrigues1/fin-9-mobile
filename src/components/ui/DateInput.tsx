import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function toDateValue(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getLocalDateValue(date = new Date()) {
  return toDateValue(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  return date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
    ? date
    : null;
}

export function isValidDateValue(value: string) {
  return parseDateValue(value) !== null;
}

function sanitizeDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export function DateInput({ label, value, onChange }: DateInputProps) {
  const selectedDate = parseDateValue(value) ?? new Date();
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return [
      ...Array(firstWeekDay).fill(null),
      ...Array.from({ length: totalDays }, (_, index) => index + 1),
    ];
  }, [visibleMonth]);

  const openCalendar = () => {
    const current = parseDateValue(value) ?? new Date();
    setVisibleMonth(new Date(current.getFullYear(), current.getMonth(), 1));
    setIsOpen(true);
  };

  const changeMonth = (offset: number) => {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  const chooseDay = (day: number) => {
    onChange(
      toDateValue(visibleMonth.getFullYear(), visibleMonth.getMonth(), day),
    );
    setIsOpen(false);
  };

  return (
    <View className="mb-4">
      <Text className="mb-2 ml-1 text-sm font-medium text-[#667085]">
        {label}
      </Text>
      <View className="flex-row items-center rounded-lg border border-[#D0D5DD] bg-white">
        <TextInput
          className="flex-1 px-4 py-4 text-base text-[#344054]"
          value={value}
          onChangeText={(text) => onChange(sanitizeDateInput(text))}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="numeric"
          maxLength={10}
        />
        <TouchableOpacity
          onPress={openCalendar}
          className="h-14 w-14 items-center justify-center"
          accessibilityLabel="Abrir calendário"
        >
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={23}
            color="#169670"
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 p-4"
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            className="w-full max-w-[380px] rounded-lg bg-white p-5"
            onPress={(event) => event.stopPropagation()}
          >
            <View className="mb-5 flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => changeMonth(-1)}
                className="h-10 w-10 items-center justify-center"
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={26}
                  color="#344054"
                />
              </TouchableOpacity>
              <Text className="text-base font-bold capitalize text-[#344054]">
                {new Intl.DateTimeFormat('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                }).format(visibleMonth)}
              </Text>
              <TouchableOpacity
                onPress={() => changeMonth(1)}
                className="h-10 w-10 items-center justify-center"
              >
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={26}
                  color="#344054"
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap">
              {WEEK_DAYS.map((day, index) => (
                <View
                  key={`${day}-${index}`}
                  className="items-center py-2"
                  style={{ width: '14.2857%' }}
                >
                  <Text className="text-xs font-semibold text-[#667085]">
                    {day}
                  </Text>
                </View>
              ))}
              {days.map((day, index) => {
                if (day === null)
                  return (
                    <View
                      key={`empty-${index}`}
                      style={{ width: '14.2857%' }}
                    />
                  );

                const dayValue = toDateValue(
                  visibleMonth.getFullYear(),
                  visibleMonth.getMonth(),
                  day,
                );
                const isSelected = dayValue === value;
                return (
                  <TouchableOpacity
                    key={dayValue}
                    onPress={() => chooseDay(day)}
                    className="items-center py-1"
                    style={{ width: '14.2857%' }}
                  >
                    <View
                      className={`h-10 w-10 items-center justify-center rounded-full ${isSelected ? 'bg-[#169670]' : ''}`}
                    >
                      <Text
                        className={
                          isSelected
                            ? 'font-semibold text-white'
                            : 'text-[#344054]'
                        }
                      >
                        {day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
