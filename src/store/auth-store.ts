import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { getSession, signIn } from 'next-auth/react';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  isTokenExpired: () => boolean;
  getAccessToken: () => Promise<string | null>;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  setTokens: (accessToken, refreshToken) => set({
    accessToken,
    refreshToken,
    isAuthenticated: true
  }),
  clearTokens: () => set({
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false
  }),
  isTokenExpired: () => {
    const token = get().accessToken;
    if (!token) return true;
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      return decoded.exp <= (Date.now() / 1000);
    } catch {
      return true;
    }
  },
  getAccessToken: async () => {
    const { accessToken } = get();
    if (accessToken) return accessToken;

    const session = await getSession();
    if (session?.access_token) {
      set({ accessToken: session.access_token, refreshToken: session.refresh_token });
      return session.access_token;
    }

    return null;
  },
  refreshAccessToken: async () => {
    try {
      const result = await signIn('refresh', { redirect: false });
      if (result?.error) throw new Error(result.error);

      const session = await getSession();
      if (session?.access_token) {
        set({ 
          accessToken: session.access_token, 
          refreshToken: session.refresh_token 
        });
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      set({ accessToken: null, refreshToken: null });
    }
  },
}));