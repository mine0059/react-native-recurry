import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  console.log('Index Route: isLoaded =', isLoaded, 'isSignedIn =', isSignedIn);

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

  return <Redirect href="/(auth)/sign-in" />;
}
