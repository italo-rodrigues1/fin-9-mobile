import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthStore } from '../../stores/authStore';
import { notify } from '../../stores/feedbackStore';
import { getGoogleConfiguration } from '../../services/googleConfig';
import { mountGoogleIdentityButton } from '../../services/googleIdentity.web';
import { GoogleAction, GoogleButtonFrame } from './GoogleButtonParts';
import { LoadingSkeleton } from '../LoadingSkeleton';

export function GoogleButton() {
  const { isDark } = useTheme();
  const { loginWithGoogle, isLoading } = useAuthStore();
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failure, setFailure] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      let dispose: (() => void) | undefined;
      setReady(false);
      setFailure(null);
      try {
        const { webClientId } = getGoogleConfiguration('web');
        if (host.current) {
          void mountGoogleIdentityButton(host.current, webClientId, isDark, {
            credential: (idToken) => {
              if (active)
                void loginWithGoogle(idToken).catch((error: Error) =>
                  notify(error.message),
                );
            },
            error: (error) => {
              if (active) notify(error.message);
            },
          })
            .then((cleanup) => {
              if (!active) {
                cleanup();
                return;
              }
              dispose = cleanup;
              setReady(true);
            })
            .catch((error: Error) => {
              if (active) setFailure(error);
            });
        }
      } catch (error) {
        setFailure(error as Error);
      }
      return () => {
        active = false;
        dispose?.();
      };
    }, [isDark, loginWithGoogle, attempt]),
  );

  return (
    <GoogleButtonFrame>
      <View style={{ minHeight: 50, justifyContent: 'center' }}>
        <div
          ref={host}
          inert={isLoading || !ready}
          aria-hidden={!ready || isLoading}
          style={{
            minHeight: 44,
            width: '100%',
            display: failure ? 'none' : 'block',
            visibility: ready && !isLoading ? 'visible' : 'hidden',
          }}
        />
        {isLoading || (!ready && !failure) ? (
          <View style={{ position: 'absolute', width: '100%' }}>
            <LoadingSkeleton
              variant="button"
              label="Preparando login com Google"
            />
          </View>
        ) : null}
        {failure ? (
          <GoogleAction
            isLoading={isLoading}
            onPress={() => {
              notify(failure.message);
              setAttempt((value) => value + 1);
            }}
          />
        ) : null}
      </View>
    </GoogleButtonFrame>
  );
}
