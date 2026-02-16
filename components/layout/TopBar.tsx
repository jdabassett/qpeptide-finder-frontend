'use client';

import { User, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useUserContext } from '@/components/providers/AuthProvider';
import { useDelete } from '@/components/providers/DeleteProvider';

interface TopBarProps {
  onLoginClick?: () => void;
}

export default function TopBar({ onLoginClick }: TopBarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { user, isAuthenticated } = useUserContext();
  const { requestDelete } = useDelete();
  const displayName = user?.name || user?.email || 'No User';

  const handleAuthClick = () => {
    onLoginClick?.();
  };

  const handleDeleteProfile = () => {
    if (!user?.id) return;
    setShowMenu(false);
    requestDelete([user.id], 'user');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 sm:px-6 z-50"
    style={{
      backgroundColor: 'var(--orange)',
      borderTop: '2px solid #F8A876',
      borderLeft: '2px solid #F8A876',
      borderRight: '2px solid var(--dark-orange)',
      borderBottom: '3px solid var(--black)',
      boxShadow: `
        inset 0 1px 0 rgba(255,255,255,0.25),
        0 2px 0 #7D8388,
        0 4px 6px rgba(0, 0, 0, 0.12)
      `,
    }}>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <h1 className="text-2xl sm:text-3xl font-semibold"
        style={{ color: 'var(--black)' }}>
          QPeptide Finder
        </h1>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Profile picture + hover menu (to the right) */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setShowMenu(true)}
          onMouseLeave={() => setShowMenu(false)}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 border border-gray-900 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer overflow-hidden">
            {user?.picture ? (
              <img 
                src={user.picture} 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            )}
          </div>

          {showMenu && isAuthenticated && (
            <div
              className="absolute right-full top-1/2 -translate-y-1/2 pr-3"
            >
              <div
                className="shadow-lg flex items-center whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--cream)',
                  border: '2px solid var(--black)',
                  borderTop: '2px solid var(--white)',
                  borderLeft: '2px solid var(--white)',
                  boxShadow: `
                    inset -1px -1px 0 var(--dark-gray),
                    inset 1px 1px 0 var(--white),
                    3px 3px 0 rgba(0, 0, 0, 0.2)
                  `,
                }}
              >

                {/* Delete Profile button — only shown when authenticated */}
                {isAuthenticated && (
                  <button
                    onClick={handleDeleteProfile}
                    className="px-3 py-2 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                    style={{
                      color: 'var(--red)',
                      backgroundColor: 'var(--cream)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--pink)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--cream)';
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete Profile
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleAuthClick}
          className="px-4 py-1 font-medium rounded-none transition-all text-sm sm:text-base relative"
          style={{
            backgroundColor: 'var(--rainbow-red)',
            color: 'var(--white)',
            border: '1px ridge var(--dark-gray)',
            borderBottom: '4px ridge var(--dark-gray)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--red)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--rainbow-red)';
          }}
        >
          {isAuthenticated ? 'Logout' : 'Login'}
        </button>
      </div>
    </header>
  );
}