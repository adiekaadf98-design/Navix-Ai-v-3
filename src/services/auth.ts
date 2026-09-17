import { auth, googleAuthProvider, githubAuthProvider, appleAuthProvider, db } from '../lib/firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously 
} from 'firebase/auth';
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
    if (!email || !email.trim()) {
      return { success: false, error: 'Email wajib diisi.' };
    }
    if (!password || !password.trim()) {
      return { success: false, error: 'Password wajib diisi. Silakan masukkan password akun Anda.' };
    }

    try {
      // 1. Authenticate with Firebase Email/Password
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch (fbErr: any) {
        // If user not found, attempt creation if valid format
        if (fbErr?.code === 'auth/user-not-found') {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
          } catch (createErr: any) {
            return { success: false, error: createErr?.message || 'Gagal mendaftarkan akun baru.' };
          }
        } else if (fbErr?.code === 'auth/wrong-password' || fbErr?.code === 'auth/invalid-credential') {
          return { success: false, error: 'Password salah. Periksa kembali kredensial Anda.' };
        } else {
          return { success: false, error: fbErr?.message || 'Gagal login via Firebase Authentication.' };
        }
      }

      if (!userCredential?.user) {
        return { success: false, error: 'Kredensial Firebase tidak valid.' };
      }

      // 2. Obtain verified Firebase ID Token
      const idToken = await userCredential.user.getIdToken();

      // 3. Send ID Token to backend to verify and mint session JWT
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, email: email.trim() })
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
      return { success: false, error: errData.error || 'Autentikasi server gagal.' };
    } catch (error: any) {
      console.warn('Server auth error:', error);
      return { success: false, error: error?.message || 'Gagal menghubungi server autentikasi.' };
    }
  },

  loginOAuthDirect: async (idToken: string, provider: 'google' | 'github' | 'apple'): Promise<AuthResponse> => {
    try {
      const res = await fetch('/api/auth/oauth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, provider })
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
      return { success: false, error: errData.error || `Autentikasi ${provider} gagal di server.` };
    } catch (error: any) {
      console.warn('OAuth direct auth error:', error);
      return { success: false, error: error?.message || 'Gagal menghubungi server autentikasi.' };
    }
  },

  loginWithFirebaseGoogle: async (): Promise<AuthResponse> => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        const idToken = await result.user.getIdToken();
        const serverAuthRes = await AuthService.loginOAuthDirect(idToken, 'google');

        if (serverAuthRes.success && serverAuthRes.user) {
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
        return serverAuthRes;
      }
    } catch (fbErr: any) {
      console.warn('Firebase Google Auth popup error:', fbErr);
      const isUnauthorizedDomain = fbErr?.code === 'auth/unauthorized-domain' || fbErr?.message?.includes('unauthorized-domain');
      if (isUnauthorizedDomain) {
        // Honest error - NEVER fake developer session
        return { 
          success: false, 
          error: 'Domain Cloud Run ini belum terdaftar di Firebase Authorized Domains. Tambahkan domain ini di Firebase Console (Authentication > Settings > Authorized domains).' 
        };
      }
      return { 
        success: false, 
        error: fbErr?.message || 'Login Firebase Google dibatalkan atau gagal.' 
      };
    }
    return { success: false, error: 'Login Firebase Google gagal diproses.' };
  },

  loginOAuth: async (provider: 'google' | 'github' | 'apple'): Promise<AuthResponse> => {
    if (provider === 'google') {
      return AuthService.loginWithFirebaseGoogle();
    }

    try {
      let authProvider: any = githubAuthProvider;
      if (provider === 'apple') authProvider = appleAuthProvider;

      const result = await signInWithPopup(auth, authProvider);
      if (result.user) {
        const idToken = await result.user.getIdToken();
        const serverAuthRes = await AuthService.loginOAuthDirect(idToken, provider);

        if (serverAuthRes.success && serverAuthRes.user) {
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
        return serverAuthRes;
      }
    } catch (fbErr: any) {
      console.warn(`Firebase popup OAuth error for ${provider}:`, fbErr);
      return { 
        success: false, 
        error: fbErr?.message || `Firebase ${provider} gagal.` 
      };
    }

    return { success: false, error: `Firebase ${provider} tidak dapat diproses.` };
  },

  loginDemo: async (): Promise<AuthUser> => {
    // Mode Demo untuk Pengguna Standar APK (Free tier - 5 request / hari)
    try {
      const userCredential = await signInAnonymously(auth);
      const idToken = await userCredential.user.getIdToken();
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch (_e) {}

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
      return JSON.parse(raw) as AuthUser;
    } catch (e) {
      return null;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  }
};
