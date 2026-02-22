import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, AuthUser, AuthTokens } from '@/types/auth';
import { RedditAuth } from '@/lib/auth/reddit-auth';

interface AuthStore extends AuthState {
  setUser: (user: AuthUser | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      tokens: null,
      loading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (tokens) => set({ tokens }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      login: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/api/auth/login';
        }
      },

      logout: async () => {
        const { tokens } = get();
        const auth = RedditAuth.getInstance();
        
        if (tokens?.access_token) {
          try {
            await auth.revokeToken(tokens.access_token);
          } catch (error) {
            console.error('Error revoking token:', error);
          }
        }

        auth.clearTokens();
        set({
          isAuthenticated: false,
          user: null,
          tokens: null,
          error: null,
        });

        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },

      checkAuth: async () => {
        set({ loading: true, error: null });
        
        try {
          const auth = RedditAuth.getInstance();
          const storedTokens = auth.getStoredTokens();
          
          console.log('Checking auth, stored tokens:', storedTokens);
          
          if (!storedTokens) {
            console.log('No stored tokens found');
            set({
              isAuthenticated: false,
              user: null,
              tokens: null,
              loading: false,
            });
            return;
          }

          const validToken = await auth.ensureValidToken();
          console.log('Valid token:', validToken);
          
          if (!validToken) {
            console.log('No valid token available');
            set({
              isAuthenticated: false,
              user: null,
              tokens: null,
              loading: false,
            });
            return;
          }

          console.log('Fetching current user...');
          try {
            const user = await auth.getCurrentUser(validToken);
            console.log('User fetched successfully:', user.name);
            
            set({
              isAuthenticated: true,
              user: {
                id: user.id,
                name: user.name,
                icon_img: user.icon_img,
                created_utc: user.created_utc,
                link_karma: user.link_karma,
                comment_karma: user.comment_karma,
              },
              tokens: auth.getStoredTokens(),
              loading: false,
            });
          } catch (userError) {
            console.error('Failed to fetch user, but token is valid:', userError);
            // Even if we can't fetch the user, we have valid tokens
            // So let's still mark as authenticated
            set({
              isAuthenticated: true,
              user: {
                id: 'unknown',
                name: 'Reddit User',
                icon_img: undefined,
                created_utc: undefined,
                link_karma: undefined,
                comment_karma: undefined,
              },
              tokens: auth.getStoredTokens(),
              loading: false,
            });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({
            isAuthenticated: false,
            user: null,
            tokens: null,
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