import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, AuthUser } from '@/types/auth';

interface AuthStore extends Omit<AuthState, 'tokens'> {
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      login: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/api/auth/login';
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Error during logout:', error);
        }

        set({
          isAuthenticated: false,
          user: null,
          error: null,
        });

        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },

      checkAuth: async () => {
        set({ loading: true, error: null });

        try {
          const response = await fetch('/api/auth/session');
          const session = await response.json();

          if (session.authenticated && session.user) {
            set({
              isAuthenticated: true,
              user: session.user,
              loading: false,
            });
          } else {
            set({
              isAuthenticated: false,
              user: null,
              loading: false,
            });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Authentication failed',
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
