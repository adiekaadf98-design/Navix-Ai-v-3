import { create } from 'zustand';
import { AuthService, AuthUser } from '../services/auth';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  loginOAuth: (provider: 'google' | 'github' | 'apple') => Promise<boolean>;
  loginDemo: () => Promise<void>;
  loginDeveloper: () => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: AuthService.getCurrentUser(),
  isAuthenticated: AuthService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    const res = await AuthService.login(email, password);
    if (res.success && res.user) {
      set({ 
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      return true;
    }
    set({ isLoading: false, error: res.error || 'Gagal masuk. Periksa email dan password.' });
    return false;
  },

  loginOAuth: async (provider) => {
    set({ isLoading: true, error: null });
    const res = await AuthService.loginOAuth(provider);
    if (res.success && res.user) {
      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      return true;
    }
    set({ isLoading: false, error: res.error || `Autentikasi dengan ${provider} gagal.` });
    return false;
  },

  loginDemo: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.loginDemo();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  },

  loginDeveloper: async () => {
    // Verified Developer login must authenticate through real Google OAuth
    set({ isLoading: true, error: null });
    const res = await AuthService.loginWithFirebaseGoogle();
    if (res.success && res.user) {
      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      return true;
    }
    set({ 
      isLoading: false, 
      error: res.error || 'Akses Developer memerlukan autentikasi nyata akun Google Developer Navix AI.' 
    });
    return false;
  },

  logout: () => {
    AuthService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  checkAuth: () => {
    const isAuth = AuthService.isAuthenticated();
    const user = AuthService.getCurrentUser();
    if (isAuth && user) {
      set({ user, isAuthenticated: true });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null })
}));
