import { Link } from 'expo-router'
import { View, Text } from 'react-native'

const SignIn = () => {
  return (
    <View>
      <Text>signIn</Text>
      <Link href="/(auth)/sign-in">Login</Link>
    </View>
  )
}

export default SignIn
