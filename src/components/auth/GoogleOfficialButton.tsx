import React, { useEffect, useRef } from 'react';

interface Props {
  onAuthSuccess: (profile: { email: string; name?: string; picture?: string }) => void;
  onError?: (err: string) => void;
}

export function GoogleOfficialButton({ onAuthSuccess, onError }: Props) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const GOOGLE_CLIENT_ID = '1088225133288-31jbcs9r8bsobr43fg568ki7fvjt5bgi.apps.googleusercontent.com';
    const w = window as any;

    const handleCredential = (response: any) => {
      if (response?.credential) {
        try {
          const base64Url = response.credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const profile = JSON.parse(jsonPayload);
          if (profile?.email) {
            onAuthSuccess({
              email: profile.email,
              name: profile.name || profile.given_name,
              picture: profile.picture,
            });
          }
        } catch (err: any) {
          console.error('Failed to parse Google credential:', err);
          onError?.(err?.message || 'Gagal memproses token Google');
        }
      }
    };

    const initGsi = () => {
      if (!w.google?.accounts?.id || !buttonRef.current) return;
      try {
        w.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        buttonRef.current.innerHTML = '';
        w.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'filled_black',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          logo_alignment: 'left',
          width: '320',
        });
      } catch (err) {
        console.warn('GSI render error:', err);
      }
    };

    if (w.google?.accounts?.id) {
      initGsi();
    } else {
      const interval = setInterval(() => {
        if (w.google?.accounts?.id) {
          clearInterval(interval);
          initGsi();
        }
      }, 250);
      return () => clearInterval(interval);
    }
  }, [onAuthSuccess, onError]);

  return (
    <div className="w-full flex justify-center py-1">
      <div ref={buttonRef} className="w-full flex justify-center min-h-[44px]" />
    </div>
  );
}
