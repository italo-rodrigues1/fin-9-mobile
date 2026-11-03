import { useAuthStore } from '../../stores/authStore';
import { notify } from '../../stores/feedbackStore';
import { GoogleAction, GoogleButtonFrame } from './GoogleButtonParts';

export function GoogleButton() {
  const { loginWithGoogle, isLoading } = useAuthStore();
  return (
    <GoogleButtonFrame>
      <GoogleAction
        isLoading={isLoading}
        onPress={() => {
          void loginWithGoogle().catch((error: Error) => notify(error.message));
        }}
      />
    </GoogleButtonFrame>
  );
}
