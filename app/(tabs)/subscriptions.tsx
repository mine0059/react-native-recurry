import { View, Text, TextInput, Pressable, ScrollView, FlatList } from 'react-native';
import React, { useState } from 'react';
import { styled } from 'nativewind';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import SubscriptionCard from '@/components/SubscriptionCard';
import { useSubscriptions } from '@/context/SubscriptionContext';
import clsx from 'clsx';
import '@/global.css';

const SafeAreaView = styled(RNSafeAreaView);

const CATEGORIES = ['All', 'Design', 'AI Tools', 'Developer Tools'];

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const { subscriptions } = useSubscriptions();

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.category && sub.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.plan && sub.plan.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || sub.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const EmptyState = () => (
    <View className="items-center justify-center py-12">
      <Text className="text-5xl mb-4">🔍</Text>
      <Text className="text-lg font-sans-bold text-primary">No subscriptions found</Text>
      <Text className="text-sm font-sans-medium text-muted-foreground text-center mt-2 px-6">
        We couldn't find any subscriptions matching your filters. Try checking your spelling or selecting another category.
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background p-5 pb-32">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-sans-bold text-primary">Subscriptions</Text>
        <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
          {filteredSubscriptions.length} {filteredSubscriptions.length === 1 ? 'subscription' : 'subscriptions'} active
        </Text>
      </View>

      {/* Search Input */}
      <View className="flex-row items-center bg-card border border-border px-4 py-3 rounded-2xl mb-5">
        <Text className="text-lg mr-2">🔍</Text>
        <TextInput
          className="flex-1 text-base font-sans-medium text-primary"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search subscriptions..."
          placeholderTextColor="rgba(8, 17, 38, 0.4)"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Text className="text-xs font-sans-semibold text-accent px-2">Clear</Text>
          </Pressable>
        )}
      </View>

      {/* Category Filter Horizontal Scroll */}
      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={clsx(
                  'px-4 py-2 rounded-full border',
                  isActive ? 'bg-accent border-accent' : 'bg-card border-border'
                )}
              >
                <Text
                  className={clsx(
                    'text-sm font-sans-semibold',
                    isActive ? 'text-background' : 'text-muted-foreground'
                  )}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Subscription List */}
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => setExpandedSubscriptionId(expandedSubscriptionId === item.id ? null : item.id)}
          />
        )}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
