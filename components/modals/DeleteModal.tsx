'use client';

import { useEffect } from 'react';
import { X, AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useDelete } from '@/components/providers/DeleteProvider';

export default function DeleteModal() {
  const { deleteRequest, isVisible, isDeleting, cancelDelete, confirmDelete } = useDelete();

  // Close on Escape (only when not mid-delete)
  useEffect(() => {
    if (!isVisible) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) cancelDelete();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, isDeleting, cancelDelete]);

  if (!isVisible || !deleteRequest) return null;

  const isUser = deleteRequest.type === 'user';
  const digestCount = deleteRequest.ids.length;

  const title = isUser ? 'Delete Profile' : 'Delete Digest';
  const message = isUser
    ? 'Are you sure you want to permanently delete your profile and all associated records? This action cannot be undone.'
    : digestCount === 1
      ? 'Are you sure you want to permanently delete this digest? This action cannot be undone.'
      : `Are you sure you want to permanently delete ${digestCount} selected digests? This action cannot be undone.`;

  return (
    <>

      {/* Modal — centered, matching UniversalModal window chrome */}
      <div
        className="fixed z-[151] flex items-center justify-center"
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
            borderTop: '3px solid var(--white)',
            borderLeft: '3px solid var(--white)',
            borderRight: '3px solid var(--black)',
            borderBottom: '3px solid var(--black)',
            boxShadow: `
              inset -2px -2px 0 var(--dark-gray),
              inset 2px 2px 0 var(--white),
              4px 4px 0 rgba(0, 0, 0, 0.2)
            `,
            minWidth: '300px',
            maxWidth: '720px',
  
          }}
        >
          {/* Title bar — matches UniversalModal */}
          <div
            className="flex items-center justify-between px-4 py-2 flex-shrink-0"
            style={{
              backgroundColor: 'var(--dark-orange)',
              borderBottom: '2px solid var(--black)',
            }}
          >

            {/* Window title */}
            <span
              className="text-sm font-bold truncate flex-1 text-center px-4 select-none"
              style={{ color: 'var(--dark)' }}
            >
              {title}
            </span>

            {/* X close button */}
            <button
              onClick={() => { if (!isDeleting) cancelDelete(); }}
              disabled={isDeleting}
              className="p-1 hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Close"
              style={{
                color: 'var(--cream)',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                border: '1px solid var(--black)',
                borderRadius: '2px',
                opacity: isDeleting ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body — keep existing content */}
          <div className="p-6 flex items-start space-x-4" style={{ backgroundColor: 'var(--cream)' }}>
            {/* Warning icon */}
            <div
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--yellow)',
                border: '2px solid var(--dark-yellow)',
              }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: 'var(--black)' }} />
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm mt-2 break-words"
                style={{ color: 'var(--black)' }}
              >
                {message}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div
            className="px-6 pb-5 flex gap-3 justify-end"
            style={{ backgroundColor: 'var(--cream)' }}
          >
            <button
              onClick={cancelDelete}
              disabled={isDeleting}
              className="px-5 py-2 text-sm font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: 'var(--cream)',
                color: 'var(--black)',
                border: '1px ridge var(--dark-gray)',
                borderBottom: '3px ridge var(--dark-gray)',
                opacity: isDeleting ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) e.currentTarget.style.backgroundColor = 'var(--light-gray)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cream)';
              }}
            >
              Cancel
            </button>

            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-5 py-2 text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
              style={{
                backgroundColor: 'var(--rainbow-red)',
                color: 'var(--white)',
                border: '1px ridge var(--dark-gray)',
                borderBottom: '3px ridge var(--dark-gray)',
                opacity: isDeleting ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) e.currentTarget.style.backgroundColor = 'var(--red)';
              }}
              onMouseLeave={(e) => {
                if (!isDeleting) e.currentTarget.style.backgroundColor = 'var(--rainbow-red)';
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  {isUser ? 'Delete Profile' : 'Delete'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}