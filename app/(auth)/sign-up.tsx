import { useAuth, useSignUp } from '@clerk/expo';
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

export default function SignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');

  const isFetching = fetchStatus === 'fetching';

  const handleSubmit = async () => {
    if (!signUp || isFetching) return;

    try {
      const { error } = await signUp.password({
        emailAddress,
        password,
      });

      if (error) {
        console.error('Password sign-up error:', JSON.stringify(error, null, 2));
        return;
      }

      await signUp.verifications.sendEmailCode();
    } catch (err) {
      posthog.captureException(err instanceof Error ? err : new Error(String(err)));
      console.error('Sign-up submit error:', err);
    }
  };

  const handleVerify = async () => {
    if (!signUp || isFetching) return;

    try {
      await signUp.verifications.verifyEmailCode({
        code,
      });

      if (signUp.status === 'complete') {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log('Session current task:', session.currentTask);
              return;
            }
            if (session?.user?.id) {
              posthog.identify(session.user.id);
              posthog.capture('sign_up_completed', {
                verification_method: 'email_code',
              });
            }
            const url = decorateUrl('/');
            router.replace(url as any);
          },
        });
      }
    } catch (err) {
      posthog.captureException(err instanceof Error ? err : new Error(String(err)));
      console.error('Sign-up verify error:', err);
    }
  };

  const handleResend = async () => {
    if (!signUp) return;
    try {
      await signUp.verifications.sendEmailCode();
    } catch (err) {
      posthog.captureException(err instanceof Error ? err : new Error(String(err)));
      console.error('Resend failed:', err);
    }
  };

  const pendingVerification =
    signUp?.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0;

  if (pendingVerification) {
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
                <Text style={styles.title}>Verify your email</Text>
                <Text style={styles.subtitle}>
                  We sent a 6-digit code to{'\n'}
                  <Text style={styles.emailHighlight}>{emailAddress}</Text>
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.form}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Verification code</Text>
                    <TextInput
                      style={[styles.input, errors?.fields?.code && styles.inputError]}
                      value={code}
                      placeholder="6-digit code"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      onChangeText={setCode}
                      keyboardType="numeric"
                      autoFocus
                      maxLength={6}
                    />
                    {errors?.fields?.code && <Text style={styles.error}>{errors.fields.code.message}</Text>}
                  </View>

                  <Pressable
                    style={[styles.button, (isFetching || code.length < 6) && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={isFetching || code.length < 6}
                  >
                    {isFetching
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.buttonText}>Verify & continue</Text>
                    }
                  </Pressable>

                  <Pressable style={styles.secondaryButton} onPress={handleResend}>
                    <Text style={styles.secondaryButtonText}>Resend code</Text>
                  </Pressable>

                  <Pressable
                    style={styles.secondaryButton}
                    onPress={async () => {
                      if (signUp) {
                        // Resets state by navigation or manually
                      }
                      setCode('');
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Change email</Text>
                  </Pressable>
                </View>
              </View>

              {/* Required for Clerk bot protection */}
              <View nativeID="clerk-captcha" />
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
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>Track all your subscriptions in one beautiful place.</Text>
            </View>

            {/* Form card */}
            <View style={styles.card}>
              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.label}>Email address</Text>
                  <TextInput
                    style={[styles.input, errors?.fields?.emailAddress && styles.inputError]}
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    onChangeText={setEmailAddress}
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                  {errors?.fields?.emailAddress && <Text style={styles.error}>{errors.fields.emailAddress.message}</Text>}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={[styles.input, errors?.fields?.password && styles.inputError]}
                    value={password}
                    placeholder="Create a password"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    secureTextEntry
                    onChangeText={setPassword}
                    autoComplete="new-password"
                  />
                  {errors?.fields?.password && <Text style={styles.error}>{errors.fields.password.message}</Text>}
                  <Text style={styles.helper}>Must be at least 8 characters.</Text>
                </View>

                <Pressable
                  style={[styles.button, (!emailAddress || !password || isFetching) && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={!emailAddress || !password || isFetching}
                >
                  {isFetching
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Create account</Text>
                  }
                </Pressable>
              </View>
            </View>

            <View style={styles.linkRow}>
              <Text style={styles.linkCopy}>Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text style={styles.link}>Sign in</Text>
                </Pressable>
              </Link>
            </View>

            {/* Required for Clerk bot protection */}
            <View nativeID="clerk-captcha" />
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
  emailHighlight: {
    fontFamily: 'sans-bold',
    color: '#081126',
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
  helper: {
    fontSize: 12,
    fontFamily: 'sans-medium',
    color: 'rgba(0, 0, 0, 0.6)',
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
