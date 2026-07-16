import { Link } from 'expo-router'
import { View, Text } from 'react-native'

const SignUp = () => {
  return (
    <View>
      <Text>signUp</Text>
      <Link href="/(auth)/sign-in">Create account</Link>
    </View>
  )
}

export default SignUp
