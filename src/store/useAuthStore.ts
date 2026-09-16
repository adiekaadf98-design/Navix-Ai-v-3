import { create } from 'zustand';
import { AuthService, AuthUser } from '../services/auth';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  loginOAuth: (provider: 'google' | 'github' | 'apple', email?: string, name?: string, avatar?: string) => Promise<boolean>;
  loginDemo: () => Promise<void>;
  loginDeveloper: () => Promise<void>;
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

  loginOAuth: async (provider, email, name, avatar) => {
    set({ isLoading: true, error: null });
    const res = await AuthService.loginOAuth(provider, email, name, avatar);
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
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.loginDeveloper();
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
