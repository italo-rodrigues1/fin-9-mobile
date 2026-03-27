import { isRunningInExpoGo } from 'expo';
import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
const tracesSampleRate = Number.parseFloat(
  process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.2'
);
const environment = process.env.EXPO_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? 'development';

export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

if (dsn) {
  Sentry.init({
    dsn,
    debug: __DEV__,
    environment,
    tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0.2,
    integrations: [navigationIntegration],
    enableNativeFramesTracking: !isRunningInExpoGo(),
  });
}

export { Sentry };
