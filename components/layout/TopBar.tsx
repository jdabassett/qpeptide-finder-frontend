'use client';

import { User } from 'lucide-react';
import { useState } from 'react';
import { useUserContext } from '@/components/providers/AuthProvider';

interface TopBarProps {
  onLoginClick?: () => void;
}

export default function TopBar({onLoginClick}: TopBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { user, isAuthenticated } = useUserContext();
  const displayName = user?.name || user?.email || 'No User';

  const handleAuthClick = () => {
    onLoginClick?.();
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
        <h1 className="text-2xl sm:text-3xl font-semibold bg-red"
        style={{color: 'var(--black)'}}>
          QPeptide Finder
        </h1>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
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
        <div className="relative"
         onMouseEnter={() => setShowTooltip(true)}
         onMouseLeave={() => setShowTooltip(false)}>
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
          {showTooltip && (
            <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-none whitespace-nowrap shadow-lg z-50">
              {displayName}
              <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}