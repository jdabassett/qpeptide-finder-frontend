'use client';

import { useUserContext } from '@/components/providers/AuthProvider';
import { useState } from 'react';
import { LogOut, User, Mail, X } from 'lucide-react';

interface LogoutContentProps {
  onClose?: () => void;
}

export default function LogoutContent({ onClose }: LogoutContentProps) {
  const { user } = useUserContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    window.location.href = `/auth/logout?returnTo=${encodeURIComponent(window.location.origin)}`;
  };

  const handleCancel = () => {
    onClose?.();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
          style={{ backgroundColor: 'var(--light-blue)' }}>
          {user?.picture ? (
            <img 
              src={user.picture} 
              alt={user?.name || 'User'} 
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <User className="w-10 h-10" style={{ color: 'var(--blue)' }} />
          )}
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--black)' }}>
          Are you sure you want to logout?
        </h2>
        <div className="space-y-2 mb-6">
          <p className="text-lg font-medium" style={{ color: 'var(--black)' }}>
            {user?.name || 'User'}
          </p>
          {user?.email && (
            <p className="text-sm flex items-center justify-center gap-2" 
              style={{ color: 'var(--dark-gray)' }}>
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
          )}
        </div>
        <p className="text-sm" style={{ color: 'var(--dark-gray)' }}>
          You'll need to sign in again to access your account.
        </p>
      </div>

      <div className="border-t pt-6" style={{ borderColor: 'var(--dark-gray)' }}>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoggingOut}
            className="flex-1 px-6 py-3 font-medium transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: isLoggingOut ? 'var(--gray)' : 'var(--cream)',
              color: 'var(--black)',
              border: '1px ridge var(--dark-gray)',
              borderBottom: '4px ridge var(--dark-gray)',
              opacity: isLoggingOut ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.backgroundColor = 'var(--light-gray)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.backgroundColor = 'var(--cream)';
              }
            }}
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 px-6 py-3 font-medium transition-all flex items-center justify-center gap-2"
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
    </div>
  );
}