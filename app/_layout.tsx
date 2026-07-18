import '@/global.css';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useGlobalSearchParams, usePathname } from 'expo-router';
import { PostHogProvider } from 'posthog-react-native';
import { useEffect, useRef } from 'react';

import { posthog } from '@/lib/posthog';
import { SubscriptionProvider } from '@/context/SubscriptionContext';

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

export default function RootLayout() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);
  const [fontsLoaded] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
  });

  useEffect(() => {
    console.log('RootLayout: fontsLoaded =', fontsLoaded);
    if (fontsLoaded) {
      console.log('RootLayout: dismissing splash screen');
      SplashScreen.hideAsync().catch((err) => {
        console.error('RootLayout: failed to hide splash screen', err);
      });
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  if (!fontsLoaded) return null;

  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
      }}
    >
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <SubscriptionProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff9e3' } }} />
        </SubscriptionProvider>
      </ClerkProvider>
    </PostHogProvider>
  );
}
