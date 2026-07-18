import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import '@/global.css';

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  console.log('AuthRoutesLayout: isLoaded =', isLoaded, 'isSignedIn =', isSignedIn);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff9e3', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ea7a53" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff9e3' } }} />;
}
