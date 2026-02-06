'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import { LogOut, User, Mail } from 'lucide-react';
import LoginButton from './LoginButton';
import { loginOptions } from './loginOptions';

interface LoginContentProps {
  onLoginSuccess?: () => void;
}

export default function LoginContent({ onLoginSuccess }: LoginContentProps) {
  const { user, isLoading, error } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user && onLoginSuccess) {
      const timer = setTimeout(() => {
        onLoginSuccess();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, onLoginSuccess]);

  const handleSocialLogin = async (connection: string) => {
    const loginUrl = `/auth/login?connection=${connection}`;
    window.location.href = loginUrl;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    window.location.href = '/auth/logout';
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
            className="w-full px-6 py-3 font-medium transition-all flex items-center justify-center gap-2"
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
        {loginOptions.map((option) => {
          return (
            <LoginButton
              key={option.connection}
              connection={option.connection}
              text={option.text}
              icon={option.icon}
              onClick={handleSocialLogin}
            />
          );
        })}
      </div>

      {error && error.message !== 'Unauthorized' &&  (
        <div className="p-3 rounded bg-red-100 text-red-700 text-sm">
          {error.message || 'An error occurred during authentication'}
        </div>
      )}
    </div>
  );
}