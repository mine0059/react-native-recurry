import { View, Text, Image, Pressable, ScrollView, FlatList, Dimensions } from 'react-native';
import React from 'react';
import { styled } from 'nativewind';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { icons } from '@/constants/icons';
import dayjs from 'dayjs';
import '@/global.css';

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const { subscriptions } = useSubscriptions();

  // Dynamic monthly expense sum calculation:
  // - active monthly subscriptions: 100% price
  // - active yearly subscriptions: price / 12
  const activeSubscriptions = subscriptions.filter((sub) => sub.status === 'active');
  const monthlyExpensesTotal = activeSubscriptions.reduce((acc, sub) => {
    const cost = sub.billing?.toLowerCase() === 'yearly' ? sub.price / 12 : sub.price;
    return acc + cost;
  }, 0);

  // Dynamic bar chart calculation based on subscription renewal dates:
  // Days of week mapping (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayIndexMap = [1, 2, 3, 4, 5, 6, 0]; // Mon, Tue, Wed, Thr, Fri, Sat, Sun
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat', 'Sun'];

  const chartData = daysOfWeek.map((dayName, idx) => {
    const dayValue = dayIndexMap[idx]; // Day value in dayjs (0-6)
    
    // Sum prices of active subscriptions renewing on this day of the week
    const amount = activeSubscriptions
      .filter((sub) => {
        if (!sub.renewalDate) return false;
        const renewalDay = dayjs(sub.renewalDate).day();
        return renewalDay === dayValue;
      })
      .reduce((sum, sub) => sum + sub.price, 0);

    return {
      day: dayName,
      amount,
      highlighted: false,
      tooltip: `$${amount.toFixed(0)}`,
    };
  });

  // Highlight the day with the highest spending
  let maxAmount = 0;
  let maxIndex = -1;
  chartData.forEach((item, index) => {
    if (item.amount > maxAmount) {
      maxAmount = item.amount;
      maxIndex = index;
    }
  });

  if (maxIndex !== -1) {
    chartData[maxIndex].highlighted = true;
  } else {
    // Default highlight Thursday if all are 0
    chartData[3].highlighted = true;
  }

  // Find maximum scale (at least 50 for layout scaling)
  const chartMaxScale = Math.max(...chartData.map((d) => d.amount), 50);

  // Custom History Card mapping data
  const historyData = activeSubscriptions.slice(0, 3); // Display top 3 active subscriptions in history

  const renderBar = (bar: typeof chartData[0], index: number) => {
    const maxHeight = 110;
    const barHeight = chartMaxScale > 0 ? (bar.amount / chartMaxScale) * maxHeight : 0;

    return (
      <View key={bar.day} className="items-center justify-end flex-1" style={{ height: 140 }}>
        {bar.amount > 0 && bar.highlighted && (
          <View
            style={{ backgroundColor: '#ffffff', bottom: barHeight + 25 }}
            className="absolute z-10 px-2 py-0.5 rounded-lg border border-border shadow-sm items-center justify-center"
          >
            <Text className="text-[10px] font-sans-bold text-accent">{bar.tooltip}</Text>
          </View>
        )}
        <View
          style={{
            height: Math.max(barHeight, 6),
            backgroundColor: bar.highlighted && bar.amount > 0 ? '#ea7a53' : '#081126',
            width: 14,
            opacity: bar.amount > 0 ? 1 : 0.1,
          }}
          className="rounded-full"
        />
        <Text className="text-[11px] font-sans-semibold text-muted-foreground mt-3">
          {bar.day}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5 pb-32">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Custom Header */}
        <View className="mb-6">
          <Text className="text-3xl font-sans-bold text-primary">Monthly Insights</Text>
          <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
            Visual summaries of your active expenses
          </Text>
        </View>

        {/* Upcoming Section */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-sans-bold text-primary">Upcoming</Text>
          <Pressable>
            <Text className="text-xs font-sans-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-full">
              View all
            </Text>
          </Pressable>
        </View>

        {/* Custom Bar Chart Card */}
        <View className="sub-card bg-card border border-border p-4 mb-6 rounded-3xl flex-row items-end gap-3 relative">
          {/* Y Axis Grid Labels */}
          <View className="h-[110px] justify-between pb-6 mr-1">
            <Text className="text-[10px] font-sans-semibold text-muted-foreground">{Math.round(chartMaxScale)}</Text>
            <Text className="text-[10px] font-sans-semibold text-muted-foreground">{Math.round(chartMaxScale * 0.75)}</Text>
            <Text className="text-[10px] font-sans-semibold text-muted-foreground">{Math.round(chartMaxScale * 0.5)}</Text>
            <Text className="text-[10px] font-sans-semibold text-muted-foreground">{Math.round(chartMaxScale * 0.1)}</Text>
            <Text className="text-[10px] font-sans-semibold text-muted-foreground">0</Text>
          </View>

          {/* Grid Lines (Overlay) */}
          <View className="absolute left-[24px] right-[16px] top-6 bottom-[40px] justify-between pointer-events-none">
            <View className="border-t border-dashed border-black/5 w-full" />
            <View className="border-t border-dashed border-black/5 w-full" />
            <View className="border-t border-dashed border-black/5 w-full" />
            <View className="border-t border-dashed border-black/5 w-full" />
            <View className="border-t border-dashed border-black/5 w-full" />
          </View>

          {/* Bars */}
          <View className="flex-1 flex-row justify-between items-end h-[140px] z-10 pl-1">
            {chartData.map((bar, idx) => renderBar(bar, idx))}
          </View>
        </View>

        {/* Expenses Card */}
        <View className="sub-card bg-card border border-border p-5 mb-6 rounded-3xl flex-row justify-between items-center">
          <View>
            <Text className="text-base font-sans-bold text-primary">Expenses</Text>
            <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5">
              {dayjs().format('MMMM YYYY')}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xl font-sans-bold text-primary">
              -${monthlyExpensesTotal.toFixed(2)}
            </Text>
            <Text className="text-xs font-sans-semibold text-accent mt-0.5">+12%</Text>
          </View>
        </View>

        {/* History Section */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-sans-bold text-primary">History</Text>
          <Pressable>
            <Text className="text-xs font-sans-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-full">
              View all
            </Text>
          </Pressable>
        </View>

        {/* History Cards List */}
        <View className="mb-4">
          {historyData.length === 0 ? (
            <Text className="text-sm font-sans-medium text-muted-foreground text-center py-6">
              No active subscriptions yet.
            </Text>
          ) : (
            historyData.map((item) => {
              const formattedDate = item.renewalDate
                ? dayjs(item.renewalDate).format('MMMM DD, HH:mm')
                : dayjs().format('MMMM DD, HH:mm');

              return (
                <View
                  key={item.id}
                  style={{ backgroundColor: item.color || '#fff8e7' }}
                  className="sub-card flex-row items-center justify-between p-4 mb-3 rounded-2xl border border-black/5"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-white/25 rounded-xl items-center justify-center border border-black/5">
                      <Image source={item.icon} className="w-6 h-6" resizeMode="contain" />
                    </View>
                    <View className="justify-center">
                      <Text className="text-base font-sans-bold text-primary">{item.name}</Text>
                      <Text className="text-[11px] font-sans-semibold text-black/50 mt-0.5">
                        {formattedDate}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end justify-center">
                    <Text className="text-base font-sans-bold text-primary">
                      ${item.price.toFixed(2)}
                    </Text>
                    <Text className="text-[10px] font-sans-semibold text-black/50 mt-0.5 uppercase tracking-[0.5px]">
                      {item.billing === 'Yearly' ? 'per year' : 'per month'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
