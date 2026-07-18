import PostHog from 'posthog-react-native';

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;

if (!projectToken) {
  throw new Error('Add EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN to the .env file');
}

if (!host) {
  throw new Error('Add EXPO_PUBLIC_POSTHOG_HOST to the .env file');
}

export const posthog = new PostHog(projectToken, {
  host,
  captureAppLifecycleEvents: true,
});
