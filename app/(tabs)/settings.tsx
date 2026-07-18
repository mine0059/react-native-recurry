import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { styled } from 'nativewind';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useClerk, useUser } from '@clerk/expo';
import images from '@/constants/images';
import dayjs from 'dayjs';
import '@/global.css';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const userAvatar = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;
  const userName = user?.fullName || user?.primaryEmailAddress?.emailAddress.split('@')[0] || 'User';
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'No email associated';
  const userJoined = user?.createdAt ? dayjs(user.createdAt).format('MMMM YYYY') : 'Unknown';

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Failed to sign out:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5 pb-32">
      <Text className="text-3xl font-sans-bold text-primary mb-6">Settings</Text>

      {/* Profile Card */}
      <View className="sub-card bg-card mb-6 items-center py-6">
        <Image source={userAvatar} className="w-24 h-24 rounded-full mb-4 border-2 border-accent" />
        <Text className="text-2xl font-sans-bold text-primary text-center px-4" numberOfLines={1}>
          {userName}
        </Text>
        <Text className="text-sm font-sans-medium text-muted-foreground mt-1 text-center px-4" numberOfLines={1}>
          {userEmail}
        </Text>
        <Text className="text-[11px] font-sans-semibold uppercase tracking-[1px] text-accent mt-4 bg-accent/15 px-3 py-1 rounded-full">
          Joined {userJoined}
        </Text>
      </View>

      {/* Preferences Section */}
      <View className="sub-card bg-card mb-6 gap-4">
        <Text className="text-xs font-sans-bold text-primary uppercase tracking-[0.5px]">Preferences</Text>

        <View className="flex-row justify-between items-center py-2 border-b border-black/5">
          <Text className="text-base font-sans-medium text-primary">Default Currency</Text>
          <Text className="text-base font-sans-bold text-accent">USD ($)</Text>
        </View>

        <View className="flex-row justify-between items-center py-2 border-b border-black/5">
          <Text className="text-base font-sans-medium text-primary">Notifications</Text>
          <Text className="text-base font-sans-bold text-accent">Enabled</Text>
        </View>

        <View className="flex-row justify-between items-center py-2">
          <Text className="text-base font-sans-medium text-primary">App Version</Text>
          <Text className="text-base font-sans-medium text-muted-foreground">1.0.0</Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <View style={{ marginTop: 'auto' }}>
        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut}
          className="w-full bg-accent items-center justify-center py-4 rounded-full flex-row"
          style={isSigningOut ? { opacity: 0.7 } : undefined}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#081126" />
          ) : (
            <Text className="font-sans-bold text-primary text-base">Sign Out</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
