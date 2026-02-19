'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useError } from '@/components/providers/ErrorProvider';
import { useUserContext } from '@/components/providers/AuthProvider';
import { parseErrorDetail } from '@/lib/api';
import { useDigest } from '@/components/providers/DigestProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export type DeleteType = 'digest' | 'user';

export interface DeleteRequest {
  ids: string[];
  type: DeleteType;
}

interface DeleteContextType {
  deleteRequest: DeleteRequest | null;
  isVisible: boolean;
  isDeleting: boolean;
  requestDelete: (ids: string[], type: DeleteType) => void;
  cancelDelete: () => void;
  confirmDelete: () => Promise<boolean>;
}

const DeleteContext = createContext<DeleteContextType | undefined>(undefined);

export default function DeleteProvider({ children }: { children: ReactNode }) {
  const { setError } = useError();
  const { user, deleteAccountAndLogout } = useUserContext();
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { digestId: currentDigestId, reset } = useDigest();

  const isVisible = deleteRequest !== null;

  const requestDelete = useCallback((ids: string[], type: DeleteType) => {
    setDeleteRequest({ ids, type });
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteRequest(null);
  }, []);

  const confirmDelete = useCallback(async (): Promise<boolean> => {
    if (!deleteRequest || deleteRequest.ids.length === 0) return false;

    setIsDeleting(true);

    try {
      // User deletion is handled entirely by AuthProvider
      if (deleteRequest.type === 'user') {
        const success = await deleteAccountAndLogout();
        if (success) setDeleteRequest(null);
        setIsDeleting(false);
        return success;
      }

      // Digest deletion — requires authenticated user
      if (!user?.id) {
        setError(401, 'You must be logged in to delete digests.');
        setIsDeleting(false);
        return false;
      }

      const failed: string[] = [];

      for (const digestId of deleteRequest.ids) {
        const response = await fetch(
          `${API_URL}/v1/digest/delete/${user.id}/${digestId}`,
          { method: 'DELETE' },
        );

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message = parseErrorDetail(body, `Failed to delete digest ${digestId} (${response.status})`);
          failed.push(message);
        } else if (currentDigestId != null && deleteRequest.ids.includes(currentDigestId)) {
          reset();
        };
      }

      if (failed.length > 0) {
        setError(400, failed.join('\n'));
        setIsDeleting(false);
        return false;
      }

      setDeleteRequest(null);
      setIsDeleting(false);
      return true;
    } catch {
      setError(0, 'Unable to reach the server. Please check your connection.');
      setIsDeleting(false);
      return false;
    }
  }, [deleteRequest, user, setError, deleteAccountAndLogout, currentDigestId, reset]);

  return (
    <DeleteContext.Provider value={{ deleteRequest, isVisible, isDeleting, requestDelete, cancelDelete, confirmDelete }}>
      {children}
    </DeleteContext.Provider>
  );
}

export function useDelete() {
  const context = useContext(DeleteContext);
  if (context === undefined) {
    throw new Error('useDelete must be used within a DeleteProvider');
  }
  return context;
}