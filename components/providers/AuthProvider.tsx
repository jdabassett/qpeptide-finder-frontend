'use client';

import { Auth0Provider, useUser } from '@auth0/nextjs-auth0/client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useError } from '@/components/providers/ErrorProvider';
import { parseErrorDetail } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface BackendUser {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface UserContextType {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  } | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  deleteAccountAndLogout: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function AuthProviderInner({ children }: { children: ReactNode }) {
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  const { setError } = useError();
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [backendLoading, setBackendLoading] = useState(false);
  const [backendSynced, setBackendSynced] = useState(false);

  // When Auth0 gives us a user, sync with the backend
  useEffect(() => {
    if (auth0Loading || !auth0User || backendSynced) return;

    const syncUser = async () => {
      setBackendLoading(true);
      try {
        const response = await fetch(`${API_URL}/v1/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: auth0User.name || auth0User.email?.split('@')[0] || 'Unknown',
            email: auth0User.email,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message = parseErrorDetail(body, `Failed to sync user (${response.status})`);
          setError(response.status, message);
          setBackendUser(null);
        } else {
          const data: BackendUser = await response.json();
          setBackendUser(data);
        }
      } catch (err) {
        setError(0, 'Unable to reach the server. Please check your connection.');
        setBackendUser(null);
      } finally {
        setBackendLoading(false);
        setBackendSynced(true);
      }
    };

    syncUser();
  }, [auth0User, auth0Loading, backendSynced, setError]);

  // Reset sync state when user logs out
  useEffect(() => {
    if (!auth0User && !auth0Loading) {
      setBackendUser(null);
      setBackendSynced(false);
    }
  }, [auth0User, auth0Loading]);

  const isLoading = auth0Loading || backendLoading;
  const isAuthenticated = !!auth0User && !!backendUser;

  const deleteAccountAndLogout = useCallback(async (): Promise<boolean> => {
    if (!backendUser) return false;

    try {
      const response = await fetch(`${API_URL}/v1/users/id/${backendUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = parseErrorDetail(body, `Failed to delete account (${response.status})`);
        setError(response.status, message);
        return false;
      }

      // Success — clear local state and log out of Auth0
      setBackendUser(null);
      setBackendSynced(false);
      window.location.href = `/auth/logout?returnTo=${encodeURIComponent(window.location.origin)}`;
      return true;
    } catch {
      setError(0, 'Unable to reach the server. Please check your connection.');
      return false;
    }
  }, [backendUser, setError]);

  const value: UserContextType = {
    user: isAuthenticated ? {
      id: backendUser.id,
      name: auth0User!.name || null,
      email: auth0User!.email || null,
      picture: auth0User!.picture || null,
    } : null,
    isLoading,
    isAuthenticated,
    deleteAccountAndLogout,
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