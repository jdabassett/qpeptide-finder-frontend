'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import { LogOut, User, Mail } from 'lucide-react';

export default function LoginContent() {
  const { user, isLoading, error } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Listen for auth completion from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'AUTH_SUCCESS') {
        // Reload to get updated user state
        window.location.reload();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSocialLogin = async (connection: string) => {
    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || 'dev-sr7n7fae2p4m7hpx.us.auth0.com';
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || 'B6BmX4cDjVz5RBi51JzmwQIyw9xIDoI4';
    const redirectUri = `${window.location.origin}/api/auth/callback`;
    const state = Math.random().toString(36).substring(7);
    
    // Store state for verification
    sessionStorage.setItem('auth0_state', state);
    
    const authUrl = `https://${domain}/authorize?` + new URLSearchParams({
      client_id: clientId,
      connection: connection,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state: state,
    }).toString();

    // Open popup window
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      authUrl,
      'auth0',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no`
    );

    // Poll for popup closure (indicates auth completion)
    const pollTimer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(pollTimer);
        // Check if we got a callback
        window.location.reload();
      }
    }, 500);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    window.location.href = '/api/auth/logout';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p style={{ color: 'var(--dark-gray)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ backgroundColor: 'var(--light-blue)' }}>
            {user.picture ? (
              <img 
                src={user.picture} 
                alt={user.name || 'User'} 
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <User className="w-10 h-10" style={{ color: 'var(--blue)' }} />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--black)' }}>
            You're logged in!
          </h2>
          <div className="space-y-2 mb-6">
            <p className="text-lg font-medium" style={{ color: 'var(--black)' }}>
              {user.name || 'User'}
            </p>
            {user.email && (
              <p className="text-sm flex items-center justify-center gap-2" 
                style={{ color: 'var(--dark-gray)' }}>
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            )}
          </div>
        </div>

        <div className="border-t pt-6" style={{ borderColor: 'var(--dark-gray)' }}>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full px-6 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: isLoggingOut ? 'var(--gray)' : 'var(--rainbow-red)',
              color: 'var(--cream)',
              border: '1px ridge var(--dark-gray)',
              borderBottom: '4px ridge var(--dark-gray)',
              opacity: isLoggingOut ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.backgroundColor = 'var(--red)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.backgroundColor = 'var(--rainbow-red)';
              }
            }}
          >
            <LogOut className="w-5 h-5" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--black)' }}>
          Welcome to QPeptide Finder
        </h2>
        <p style={{ color: 'var(--dark-gray)' }}>
          Sign in to access all features
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleSocialLogin('google-oauth2')}
          className="w-full px-6 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-3 border-2"
          style={{
            backgroundColor: 'var(--white)',
            color: 'var(--black)',
            borderColor: 'var(--dark-gray)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--light-gray)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--cream)';
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <button
          onClick={() => handleSocialLogin('apple')}
          className="w-full px-6 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-3 border-2"
          style={{
            backgroundColor: 'var(--black)',
            color: 'var(--white)',
            borderColor: 'var(--dark-gray)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--dark-gray)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--black)';
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Apple
        </button>

        <button
          onClick={() => handleSocialLogin('github')}
          className="w-full px-6 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-3 border-2"
          style={{
            backgroundColor: 'var(--white)',
            color: 'var(--black)',
            borderColor: 'var(--dark-gray)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--light-gray)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--white)';
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </button>
        <button
          onClick={() => handleSocialLogin('windowslive')}
          className="w-full px-6 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-3 border-2"
          style={{
            backgroundColor: '#0078D4',
            color: 'var(--white)',
            borderColor: '#0078D4',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#106EBE';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0078D4';
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.628h11.377V24H0zm12.623 0H24V24H12.623z"/>
          </svg>
          Microsoft
        </button>

        <button
          onClick={() => handleSocialLogin('facebook')}
          className="w-full px-6 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-3 border-2"
          style={{
            backgroundColor: '#1877F2',
            color: 'var(--white)',
            borderColor: '#1877F2',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#166FE5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1877F2';
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>

        <button
          onClick={() => handleSocialLogin('twitter')}
          className="w-full px-6 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-3 border-2"
          style={{
            backgroundColor: 'var(--black)',
            color: 'var(--white)',
            borderColor: 'var(--dark-gray)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1DA1F2';
            e.currentTarget.style.borderColor = '#1DA1F2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--black)';
            e.currentTarget.style.borderColor = 'var(--dark-gray)';
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X (Twitter)
        </button>

        <button
          onClick={() => handleSocialLogin('linkedin')}
          className="w-full px-6 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-3 border-2"
          style={{
            backgroundColor: '#0A66C2',
            color: 'var(--white)',
            borderColor: '#0A66C2',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#084D94';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0A66C2';
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--dark-gray)' }}></div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-100 text-red-700 text-sm">
          {error.message || 'An error occurred during authentication'}
        </div>
      )}
    </div>
  );
}