'use client';

import { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useError } from '@/components/providers/ErrorProvider';

export default function ErrorModal() {
  const { error, clearError } = useError();

  // Close on Escape
  useEffect(() => {
    if (!error) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearError();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [error, clearError]);

  if (!error) return null;

  return (
    <>

      {/* Modal */}
      <div
        className="fixed z-[201] flex items-center justify-center"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className="flex flex-col shadow-2xl"
          style={{
            backgroundColor: 'var(--cream)',
            border: '3px solid var(--black)',
            borderTop: '3px solid var(--light-red)',
            borderLeft: '3px solid var(--light-red)',
            borderRight: '3px solid var(--black)',
            borderBottom: '3px solid var(--black)',
            boxShadow: `
              inset -2px -2px 0 var(--dark-gray),
              inset 2px 2px 0 var(--pink),
              4px 4px 0 rgba(0, 0, 0, 0.3)
            `,
            minWidth: '320px',
            maxWidth: '480px',
          }}
        >
          {/* Title bar - red themed */}
          <div
            className="flex items-center justify-between px-4 py-2 flex-shrink-0"
            style={{
              backgroundColor: 'var(--red)',
              borderBottom: '2px solid var(--black)',
            }}
          >
            <span
              className="text-sm font-bold truncate flex-1 text-center px-4 select-none"
              style={{ color: 'var(--dark)' }}
            >
              Error
            </span>

            <button
              onClick={clearError}
              className="p-1 hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Close"
              style={{
                color: 'var(--white)',
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                border: '1px solid var(--black)',
                borderRadius: '2px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex items-start space-x-4">
            {/* Error icon */}
            <div
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--rainbow-red)',
                border: '2px solid var(--red)',
              }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: 'var(--white)' }} />
            </div>

            {/* Error details */}
            <div className="flex-1 min-w-0">
              <p
                className="text-lg font-bold"
                style={{ color: 'var(--red)' }}
              >
                {error.statusCode > 0 ? error.statusCode : 'Network Error'}
              </p>
              <p
                className="text-sm mt-1 break-words"
                style={{ color: 'var(--black)' }}
              >
                {error.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}