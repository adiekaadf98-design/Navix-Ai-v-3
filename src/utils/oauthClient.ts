// Helper for Real Google, GitHub, and Apple OAuth integration

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (response: { access_token?: string; error?: any }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: any) => void;
          };
        };
      };
    };
  }
}

export function decodeJwtPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('Failed to parse JWT payload:', e);
    return null;
  }
}

/**
 * Trigger Real Google Sign In
 */
export async function initiateRealGoogleAuth(
  onSuccess: (userData: { email: string; name: string; avatar?: string; idToken?: string; accessToken?: string }) => Promise<void>,
  onError: (err: string) => void
) {
  const GOOGLE_CLIENT_ID = '1088225133288-31jbcs9r8bsobr43fg568ki7fvjt5bgi.apps.googleusercontent.com';

  // 1. Try Google Identity Services (GSI) Token Client if available in browser
  if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        prompt: 'select_account',
        callback: async (resp) => {
          if (resp.error) {
            console.warn('Google GSI error:', resp.error);
            fallbackGoogleOAuthPopup(onSuccess, onError);
            return;
          }
          if (resp.access_token) {
            try {
              const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${resp.access_token}` }
              });
              if (profileRes.ok) {
                const profile = await profileRes.json();
                if (profile && profile.email) {
                  await onSuccess({
                    email: profile.email,
                    name: profile.name || profile.given_name || profile.email.split('@')[0],
                    avatar: profile.picture,
                    accessToken: resp.access_token
                  });
                  return;
                }
              }
            } catch (e: any) {
              console.error('Failed to fetch userinfo from Google API:', e);
            }
            onError('Gagal mendapatkan profil pengguna dari Google API.');
            return;
          }
          onError('Tidak ada access token dari Google OAuth.');
        }
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
      return;
    } catch (err) {
      console.warn('Google GSI init failed, falling back to popup:', err);
    }
  }

  // 2. Fallback to Google OAuth popup
  fallbackGoogleOAuthPopup(onSuccess, onError);
}

function fallbackGoogleOAuthPopup(
  onSuccess: (userData: { email: string; name: string; avatar?: string; idToken?: string; accessToken?: string }) => Promise<void>,
  onError: (err: string) => void
) {
  const reqOrigin = window.location.origin;
  const redirectUri = `${reqOrigin}/auth/callback`;
  const GOOGLE_CLIENT_ID = '1088225133288-31jbcs9r8bsobr43fg568ki7fvjt5bgi.apps.googleusercontent.com';

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'token id_token',
    scope: 'email profile openid',
    prompt: 'select_account',
    nonce: Math.random().toString(36).substring(2)
  }).toString();

  const popup = window.open(
    authUrl,
    'google_oauth_popup',
    'width=500,height=650,menubar=no,toolbar=no,location=no,status=no'
  );

  if (!popup) {
    onError('Pop-up terblokir oleh browser. Izinkan pop-up untuk memilih akun Google.');
    return;
  }

  const messageHandler = async (event: MessageEvent) => {
    if (event.data?.type === 'OAUTH_AUTH_SUCCESS' || event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
      window.removeEventListener('message', messageHandler);
      const { idToken, accessToken, profile } = event.data;

      if (profile && profile.email) {
        await onSuccess({
          email: profile.email,
          name: profile.name || profile.given_name || profile.email.split('@')[0],
          avatar: profile.picture,
          idToken,
          accessToken
        });
        return;
      }

      if (idToken) {
        const decoded = decodeJwtPayload(idToken);
        if (decoded && decoded.email) {
          await onSuccess({
            email: decoded.email,
            name: decoded.name || decoded.given_name || decoded.email.split('@')[0],
            avatar: decoded.picture,
            idToken,
            accessToken
          });
          return;
        }
      }

      if (accessToken) {
        try {
          const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (profileRes.ok) {
            const fetchedProfile = await profileRes.json();
            if (fetchedProfile?.email) {
              await onSuccess({
                email: fetchedProfile.email,
                name: fetchedProfile.name || fetchedProfile.email.split('@')[0],
                avatar: fetchedProfile.picture,
                accessToken
              });
              return;
            }
          }
        } catch (e) {}
      }

      onError('Autentikasi Google gagal: data profil tidak valid.');
    } else if (event.data?.type === 'GOOGLE_OAUTH_ERROR' || event.data?.type === 'OAUTH_AUTH_ERROR') {
      window.removeEventListener('message', messageHandler);
      onError(event.data?.error || 'Autentikasi OAuth gagal atau dibatalkan.');
    }
  };

  window.addEventListener('message', messageHandler);
}

/**
 * Trigger Real GitHub OAuth Popup
 */
export async function initiateRealGitHubAuth(
  onSuccess: (userData: { email: string; name: string; avatar?: string; code?: string }) => Promise<void>,
  onError: (err: string) => void
) {
  const reqOrigin = window.location.origin;
  const redirectUri = `${reqOrigin}/auth/callback`;
  const GITHUB_CLIENT_ID = 'Iv1.navix_demo_github';

  const authUrl = `https://github.com/login/oauth/authorize?` + new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'user:email read:user',
    allow_signup: 'true'
  }).toString();

  const popup = window.open(
    authUrl,
    'github_oauth_popup',
    'width=500,height=650,menubar=no,toolbar=no,location=no,status=no'
  );

  if (!popup) {
    onError('Pop-up terblokir oleh browser. Izinkan pop-up untuk autentikasi GitHub.');
    return;
  }

  const messageHandler = async (event: MessageEvent) => {
    if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
      window.removeEventListener('message', messageHandler);
      const { email, name, avatar, code } = event.data;
      if (email) {
        await onSuccess({ email, name: name || email.split('@')[0], avatar, code });
      } else {
        onError('Autentikasi GitHub gagal menerima profil.');
      }
    } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
      window.removeEventListener('message', messageHandler);
      onError(event.data?.error || 'Autentikasi GitHub dibatalkan.');
    }
  };

  window.addEventListener('message', messageHandler);
}

/**
 * Trigger Real Apple Sign-In Popup
 */
export async function initiateRealAppleAuth(
  onSuccess: (userData: { email: string; name: string; avatar?: string; idToken?: string }) => Promise<void>,
  onError: (err: string) => void
) {
  const reqOrigin = window.location.origin;
  const redirectUri = `${reqOrigin}/auth/callback`;
  const APPLE_CLIENT_ID = 'com.navix.ai.auth';

  const authUrl = `https://appleid.apple.com/auth/authorize?` + new URLSearchParams({
    client_id: APPLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code id_token',
    response_mode: 'fragment',
    scope: 'name email'
  }).toString();

  const popup = window.open(
    authUrl,
    'apple_oauth_popup',
    'width=500,height=650,menubar=no,toolbar=no,location=no,status=no'
  );

  if (!popup) {
    onError('Pop-up terblokir oleh browser. Izinkan pop-up untuk autentikasi Apple ID.');
    return;
  }

  const messageHandler = async (event: MessageEvent) => {
    if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
      window.removeEventListener('message', messageHandler);
      const { email, name, avatar, idToken } = event.data;
      if (email) {
        await onSuccess({ email, name: name || email.split('@')[0], avatar, idToken });
      } else {
        onError('Autentikasi Apple gagal menerima email.');
      }
    } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
      window.removeEventListener('message', messageHandler);
      onError(event.data?.error || 'Autentikasi Apple dibatalkan.');
    }
  };

  window.addEventListener('message', messageHandler);
}
