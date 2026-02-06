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

// DEV ONLY: Uncomment to mock a logged-in user. Comment out to use real Auth0.
// const MOCK_USER = { name: 'John Doe', email: 'john@example.com', picture: 'https://cdn.auth0.com/avatars/jd.png' };


function AuthProviderInner({ children }: { children: ReactNode }) {
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  
  // const user = typeof MOCK_USER !== 'undefined' ? MOCK_USER : auth0User;
  const user = auth0User;
  // const isLoading = typeof MOCK_USER !== 'undefined' ? false : auth0Loading;
  const isLoading = auth0Loading
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