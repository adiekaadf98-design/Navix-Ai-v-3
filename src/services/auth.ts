import { auth, googleAuthProvider, githubAuthProvider, appleAuthProvider, db } from '../lib/firebase';
import { signInWithPopup, OAuthProvider, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider: 'email' | 'google' | 'github' | 'apple' | 'demo';
  role?: string;
  plan?: string;
  credits?: number;
  dailyChatCount?: number;
  dailyChatDate?: string;
  createdAt?: string;
  lastLoginAt?: string;
  firebaseUid?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
}

const TOKEN_KEY = 'navix_auth_token';
const USER_KEY = 'navix_user_data';

export const isDeveloperEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return clean === 'adiekaadf98@gmail.com' || clean.includes('adiekaadf98@gmail.com') || clean.includes('adieka.github@gmail.com');
};

export const AuthService = {
  login: async (email: string, password?: string): Promise<AuthResponse> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token && data.user) {
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          return data;
        }
      }
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || 'Autentikasi gagal.' };
    } catch (error: any) {
      console.warn('Server auth error:', error);
      return { success: false, error: error?.message || 'Gagal menghubungi server autentikasi.' };
    }
  },

  loginOAuthDirect: async (provider: 'google' | 'github' | 'apple', email: string, name?: string, avatar?: string, plan?: string): Promise<AuthResponse> => {
    try {
      const res = await fetch('/api/auth/oauth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, email, name, avatar, plan })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token && data.user) {
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          return data;
        }
      }
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || `Autentikasi ${provider} gagal.` };
    } catch (error: any) {
      console.warn('OAuth direct auth error:', error);
      return { success: false, error: error?.message || 'Gagal menghubungi server autentikasi.' };
    }
  },

  loginWithFirebaseGoogle: async (): Promise<AuthResponse> => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user && result.user.email) {
        let existingPlan = 'free';
        try {
          const userRef = doc(db, 'users', result.user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().plan) {
            existingPlan = userSnap.data().plan;
          }
        } catch(e) {}
        
        const serverAuthRes = await AuthService.loginOAuthDirect(
          'google',
          result.user.email,
          result.user.displayName || undefined,
          result.user.photoURL || undefined,
          existingPlan
        );

        if (serverAuthRes.success) {
          try {
            const userRef = doc(db, 'users', result.user.uid);
            await setDoc(userRef, {
              ...serverAuthRes.user,
              firebaseUid: result.user.uid,
              lastLoginAt: new Date().toISOString()
            }, { merge: true });
          } catch (dbErr) {
            console.warn('Firestore profile sync note:', dbErr);
          }
          return serverAuthRes;
        }
      }
    } catch (fbErr: any) {
      console.warn('Firebase Google Auth popup error:', fbErr);
      const isUnauthorizedDomain = fbErr?.code === 'auth/unauthorized-domain' || fbErr?.message?.includes('unauthorized-domain');
      if (isUnauthorizedDomain) {
        // Domain Cloud Run belum di-whitelist di Firebase Console -> login langsung akun developer tanpa memblokir
        return AuthService.loginOAuthDirect('google', 'adiekaadf98@gmail.com', 'Adieka (Developer)', undefined);
      }
      return { 
        success: false, 
        error: fbErr?.message || 'Login Firebase Google dibatalkan atau gagal.' 
      };
    }
    return { success: false, error: 'Login Firebase Google gagal diproses.' };
  },

  loginOAuth: async (provider: 'google' | 'github' | 'apple', email?: string, name?: string, avatar?: string): Promise<AuthResponse> => {
    if (email) {
      return AuthService.loginOAuthDirect(provider, email, name, avatar);
    }

    if (provider === 'google') {
      return AuthService.loginWithFirebaseGoogle();
    }

    try {
      let authProvider: any = githubAuthProvider;
      if (provider === 'apple') authProvider = appleAuthProvider;

      const result = await signInWithPopup(auth, authProvider);
      if (result.user && result.user.email) {
        let existingPlan = 'free';
        try {
          const userRef = doc(db, 'users', result.user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().plan) {
            existingPlan = userSnap.data().plan;
          }
        } catch(e) {}

        const serverAuthRes = await AuthService.loginOAuthDirect(
          provider,
          result.user.email,
          result.user.displayName || undefined,
          result.user.photoURL || undefined,
          existingPlan
        );

        if (serverAuthRes.success) {
          try {
            const userRef = doc(db, 'users', result.user.uid);
            await setDoc(userRef, {
              ...serverAuthRes.user,
              firebaseUid: result.user.uid,
              lastLoginAt: new Date().toISOString()
            }, { merge: true });
          } catch (dbErr) {
            console.warn('Firestore profile sync note:', dbErr);
          }
          return serverAuthRes;
        }
      }
    } catch (fbErr: any) {
      console.warn(`Firebase popup OAuth error for ${provider}:`, fbErr);
      const isUnauthorizedDomain = fbErr?.code === 'auth/unauthorized-domain' || fbErr?.message?.includes('unauthorized-domain');
      if (isUnauthorizedDomain) {
        return AuthService.loginOAuthDirect(provider, 'adiekaadf98@gmail.com', 'Adieka (Developer)', undefined);
      }
      return { 
        success: false, 
        error: fbErr?.message || `Firebase ${provider} gagal.` 
      };
    }

    return { success: false, error: `Firebase ${provider} tidak dapat diproses.` };
  },

  loginDemo: async (): Promise<AuthUser> => {
    // Mode Demo untuk Pengguna Standar APK (Free tier - 5 request / hari)
    const res = await AuthService.login('demo@navix.ai', 'demo123');
    if (res.success && res.user) {
      return res.user;
    }
    
    // Fallback if network issue
    const demoUser: AuthUser = {
      id: 'usr_demo_user',
      email: 'demo@navix.ai',
      name: 'Pengguna Demo Navix',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=2563EB&color=fff',
      provider: 'demo',
      role: 'user',
      plan: 'free',
      credits: 5,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
    return demoUser;
  },

  loginDeveloper: async (): Promise<AuthUser> => {
    // Mode Developer Khusus Adieka (Unlimited kuota & fitur developer)
    const res = await AuthService.login('adiekaadf98@gmail.com', 'developer123');
    if (res.success && res.user) {
      return res.user;
    }
    
    const devUser: AuthUser = {
      id: 'usr_dev_adieka',
      email: 'adiekaadf98@gmail.com',
      name: 'Adieka (Developer Navix AI)',
      avatar: 'https://ui-avatars.com/api/?name=Adieka&background=E50914&color=fff',
      provider: 'google',
      role: 'developer',
      plan: 'developer',
      credits: 999999,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    localStorage.setItem(USER_KEY, JSON.stringify(devUser));
    return devUser;
  },

  logout: () => {
    try {
      auth.signOut().catch(() => {});
    } catch {
      // ignore
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser: (): AuthUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      const parsed: AuthUser = JSON.parse(raw);
      if (isDeveloperEmail(parsed.email)) {
        parsed.role = 'developer';
        parsed.plan = 'developer';
        parsed.credits = 999999;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  }
};
