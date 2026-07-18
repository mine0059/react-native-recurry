import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { posthog } from '@/lib/posthog';

export default function SignInPage() {
  console.log('SignInPage: Rendering!');
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');

  const isFetching = fetchStatus === 'fetching';

  const handleSubmit = async () => {
    if (!signIn || isFetching) return;

    try {
      const { error } = await signIn.password({
        emailAddress,
        password,
      });

      if (error) {
        console.error('Password sign-in error:', JSON.stringify(error, null, 2));
        return;
      }

      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log('Session current task:', session.currentTask);
              return;
            }
            if (session?.userId) {
              posthog.identify(session.userId);
              posthog.capture('sign_in_completed', {
                authentication_method: 'password',
              });
            }
            const url = decorateUrl('/');
            router.replace(url as any);
          },
        });
      } else if (signIn.status === 'needs_client_trust') {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === 'email_code',
        );
        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode();
        }
      }
    } catch (err) {
      posthog.captureException(err instanceof Error ? err : new Error(String(err)));
      console.error('Submit error:', err);
    }
  };

  const handleVerify = async () => {
    if (!signIn || isFetching) return;

    try {
      await signIn.mfa.verifyEmailCode({ code });

      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log('Session current task:', session.currentTask);
              return;
            }
            if (session?.userId) {
              posthog.identify(session.userId);
              posthog.capture('sign_in_completed', {
                authentication_method: 'email_code',
              });
            }
            const url = decorateUrl('/');
            router.replace(url as any);
          },
        });
      }
    } catch (err) {
      posthog.captureException(err instanceof Error ? err : new Error(String(err)));
      console.error('Verify error:', err);
    }
  };

  const needsVerification = signIn?.status === 'needs_client_trust';

  if (needsVerification) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.flex}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
            <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              {/* Brand */}
              <View style={styles.brandBlock}>
                <View style={styles.logoWrap}>
                  <View style={styles.logoMark}>
                    <Text style={styles.logoText}>R</Text>
                  </View>
                  <View>
                    <Text style={styles.wordmark}>Recurrly</Text>
                    <Text style={styles.wordmarkSub}>Subscriptions</Text>
                  </View>
                </View>
                <Text style={styles.title}>Check your email</Text>
                <Text style={styles.subtitle}>We sent a verification code to your email address.</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.form}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Verification code</Text>
                    <TextInput
                      style={[styles.input, errors?.fields?.code && styles.inputError]}
                      value={code}
                      placeholder="Enter code"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      onChangeText={setCode}
                      keyboardType="numeric"
                      autoFocus
                    />
                    {errors?.fields?.code && <Text style={styles.error}>{errors.fields.code.message}</Text>}
                  </View>

                  <Pressable
                    style={[styles.button, (!code || isFetching) && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={isFetching || !code}
                  >
                    {isFetching
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.buttonText}>Verify code</Text>
                    }
                  </Pressable>

                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => {
                      if (signIn) {
                        signIn.reset();
                      }
                      setCode('');
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Start over</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* Brand */}
            <View style={styles.brandBlock}>
              <View style={styles.logoWrap}>
                <View style={styles.logoMark}>
                  <Text style={styles.logoText}>R</Text>
                </View>
                <View>
                  <Text style={styles.wordmark}>Recurrly</Text>
                  <Text style={styles.wordmarkSub}>Subscriptions</Text>
                </View>
              </View>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to continue managing your subscriptions.</Text>
            </View>

            {/* Form card */}
            <View style={styles.card}>
              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.label}>Email address</Text>
                  <TextInput
                    style={[styles.input, errors?.fields?.identifier && styles.inputError]}
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    onChangeText={setEmailAddress}
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                  {errors?.fields?.identifier && <Text style={styles.error}>{errors.fields.identifier.message}</Text>}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={[styles.input, errors?.fields?.password && styles.inputError]}
                    value={password}
                    placeholder="Your password"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    secureTextEntry
                    onChangeText={setPassword}
                    autoComplete="password"
                  />
                  {errors?.fields?.password && <Text style={styles.error}>{errors.fields.password.message}</Text>}
                </View>

                <Pressable
                  style={[styles.button, (!emailAddress || !password || isFetching) && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={!emailAddress || !password || isFetching}
                >
                  {isFetching
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Sign in</Text>
                  }
                </Pressable>
              </View>
            </View>

            <View style={styles.linkRow}>
              <Text style={styles.linkCopy}>Don't have an account?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text style={styles.link}>Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9e3',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 32,
  },
  brandBlock: {
    marginTop: 8,
    alignItems: 'center',
  },
  logoWrap: {
    marginBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoMark: {
    position: 'relative',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#ea7a53',
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'sans-extrabold',
    color: '#fff9e3',
  },
  wordmark: {
    fontSize: 30,
    fontFamily: 'sans-extrabold',
    color: '#081126',
  },
  wordmarkSub: {
    marginTop: -4,
    fontSize: 12,
    fontFamily: 'sans-semibold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  title: {
    fontSize: 30,
    fontFamily: 'sans-bold',
    color: '#081126',
  },
  subtitle: {
    marginTop: 8,
    maxWidth: 320,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'sans-medium',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  card: {
    marginTop: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff8e7',
    padding: 20,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'sans-semibold',
    color: '#081126',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff9e3',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'sans-medium',
    color: '#081126',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  error: {
    fontSize: 12,
    fontFamily: 'sans-medium',
    color: '#dc2626',
  },
  button: {
    marginTop: 4,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#ea7a53',
    paddingVertical: 16,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(234, 122, 83, 0.45)',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'sans-bold',
    color: '#081126',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(234, 122, 83, 0.3)',
    backgroundColor: 'rgba(234, 122, 83, 0.1)',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'sans-semibold',
    color: '#ea7a53',
  },
  linkRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  linkCopy: {
    fontSize: 14,
    fontFamily: 'sans-medium',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  link: {
    fontSize: 14,
    fontFamily: 'sans-bold',
    color: '#ea7a53',
  },
});
