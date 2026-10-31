import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
export default function Entry() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  return <Redirect href={authenticated ? '/(tabs)' : '/(auth)/welcome'} />;
}
