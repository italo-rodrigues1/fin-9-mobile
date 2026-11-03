export const googleAuth = {
  async signIn(): Promise<string | null> {
    throw new Error('Use o botão do Google para escolher sua conta.');
  },

  async signOut(): Promise<void> {
    if (typeof window !== 'undefined') {
      const { getLoadedGoogleIdentity } = await import('./googleIdentity.web');
      getLoadedGoogleIdentity()?.disableAutoSelect();
    }
  },
};
