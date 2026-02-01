'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface UniversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
}

export default function UniversalModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'calc(100vw - 20rem)',
  maxHeight = 'calc(100vh - 8rem)',
}: UniversalModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-40 flex flex-col"
      style={{
        top: '5rem', // Below header (h-16 = 4rem)
        left: '16rem', // Right of sidebar (w-64 = 16rem)
        width: maxWidth,
        maxWidth: maxWidth,
        height: maxHeight,
        maxHeight: maxHeight,
      }}
    >
      <div 
        className="bg-white flex flex-col shadow-2xl"
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
          width: '100%',
          height: '100%',
        }}
      >
        {/* Window Header */}
        <div 
          className="flex items-center justify-between px-4 py-2 flex-shrink-0 cursor-move"
          style={{ 
            backgroundColor: 'var(--dark-orange)',
            borderBottom: '2px solid var(--black)',
          }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-black"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 border border-black"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 border border-black"></div>
            <span 
              className="ml-4 text-sm font-medium"
              style={{ color: 'var(--cream)' }}
            >
              {title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:opacity-80 transition-opacity"
            aria-label="Close"
            style={{ 
              color: 'var(--cream)',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--black)',
              borderRadius: '2px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div 
          className="flex-1 overflow-auto p-6" 
          style={{ 
            backgroundColor: 'var(--cream)',
          }}
        >
          {children}
        </div>

        {footer && (
          <div 
            className="px-4 py-2 border-t flex items-center justify-between flex-shrink-0"
            style={{ 
              borderTop: '2px solid var(--black)',
              backgroundColor: 'var(--light-gray)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}