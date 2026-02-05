'use client';

import { Auth0Provider, useUser } from '@auth0/nextjs-auth0/client';
import { createContext, useContext, ReactNode } from 'react';

interface UserContextType {
  user: {
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  } | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// TODO: remove after local testing
function getMockUser() {
  if (process.env.NODE_ENV !== 'development') return null;
  
  if (process.env.NEXT_PUBLIC_MOCK_USER === 'true') {
    return {
      name: process.env.NEXT_PUBLIC_MOCK_USER_NAME || 'Test User',
      email: process.env.NEXT_PUBLIC_MOCK_USER_EMAIL || 'test@example.com',
      picture: process.env.NEXT_PUBLIC_MOCK_USER_PICTURE || null,
    };
  }
  return null;
}

function AuthProviderInner({ children }: { children: ReactNode }) {
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  
  const mockUser = getMockUser();
  const user = mockUser || auth0User;
  const isLoading = auth0Loading && !mockUser;
  const isAuthenticated = !!user;

  const value: UserContextType = {
    user: user ? {
      name: user.name || null,
      email: user.email || null,
      picture: user.picture || null,
    } : null,
    isLoading,
    isAuthenticated,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Auth0Provider>
      <AuthProviderInner>
        {children}
      </AuthProviderInner>
    </Auth0Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within an AuthProvider');
  }
  return context;
}