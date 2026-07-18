import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { icons } from '@/constants/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { posthog } from '@/lib/posthog';
import dayjs from 'dayjs';
import clsx from 'clsx';
import '@/global.css';

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: any) => void;
}

const CATEGORIES = [
  'Entertainment',
  'AI Tools',
  'Developer Tools',
  'Design',
  'Productivity',
  'Cloud',
  'Music',
  'Other',
];

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: '#ffb3ba',
  'AI Tools': '#b8d4e3',
  'Developer Tools': '#e8def8',
  Design: '#b8e8d0',
  Productivity: '#ffdfba',
  Cloud: '#baffc9',
  Music: '#bae1ff',
  Other: '#f6eecf',
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [category, setCategory] = useState('Other');

  // Reset form when modal becomes visible or invisible
  useEffect(() => {
    if (visible) {
      setName('');
      setPrice('');
      setFrequency('Monthly');
      setCategory('Other');
    }
  }, [visible]);

  const parsedPrice = parseFloat(price);
  const isValid = name.trim().length > 0 && !isNaN(parsedPrice) && parsedPrice > 0;

  const handleSubmit = () => {
    if (!isValid) return;

    const startDate = dayjs().toISOString();
    const renewalDate =
      frequency === 'Monthly'
        ? dayjs().add(1, 'month').toISOString()
        : dayjs().add(1, 'year').toISOString();

    const newSubscription = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      price: parsedPrice,
      currency: 'USD',
      frequency,
      category,
      status: 'active',
      startDate,
      renewalDate,
      icon: icons.plus,
      billing: frequency,
      color: CATEGORY_COLORS[category] || '#f6eecf',
    };

    posthog.capture('subscription_created', {
      subscription_name: name.trim(),
      subscription_price: parsedPrice,
      subscription_frequency: frequency,
      subscription_category: category,
    });

    onCreate(newSubscription);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#fff9e3' }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            {/* Header */}
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable onPress={onClose} className="modal-close">
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            {/* Form Content */}
            <ScrollView
              style={{ flex: 1 }}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 40 : 20 }}
            >
            <View className="modal-body">
              {/* Name Field */}
              <View className="gap-2">
                <Text className="auth-label">Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Netflix, Spotify"
                  placeholderTextColor="rgba(8, 17, 38, 0.35)"
                  className="auth-input"
                />
              </View>

              {/* Price Field */}
              <View className="gap-2">
                <Text className="auth-label">Price</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor="rgba(8, 17, 38, 0.35)"
                  keyboardType="decimal-pad"
                  className="auth-input"
                />
              </View>

              {/* Frequency Picker */}
              <View className="gap-2">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  <Pressable
                    onPress={() => setFrequency('Monthly')}
                    className={clsx(
                      'picker-option',
                      frequency === 'Monthly' && 'picker-option-active'
                    )}
                  >
                    <Text
                      className={clsx(
                        'picker-option-text',
                        frequency === 'Monthly' && 'picker-option-text-active'
                      )}
                    >
                      Monthly
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setFrequency('Yearly')}
                    className={clsx(
                      'picker-option',
                      frequency === 'Yearly' && 'picker-option-active'
                    )}
                  >
                    <Text
                      className={clsx(
                        'picker-option-text',
                        frequency === 'Yearly' && 'picker-option-text-active'
                      )}
                    >
                      Yearly
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Category Chips */}
              <View className="gap-2">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((cat) => {
                    const isActive = category === cat;
                    return (
                      <Pressable
                        key={cat}
                        onPress={() => setCategory(cat)}
                        className={clsx(
                          'category-chip',
                          isActive && 'category-chip-active'
                        )}
                      >
                        <Text
                          className={clsx(
                            'category-chip-text',
                            isActive && 'category-chip-text-active'
                          )}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={!isValid}
                className={clsx(
                  'auth-button items-center justify-center',
                  !isValid && 'auth-button-disabled'
                )}
              >
                <Text className="auth-button-text">Create Subscription</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  </Modal>
  );
}
