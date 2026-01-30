'use client';

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
  maxWidth = '90vw',
  maxHeight = '85vh',
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl flex flex-col"
        style={{
          backgroundColor: 'var(--cream)',
          border: '2px solid var(--dark-gray)',
          width: maxWidth,
          maxWidth: maxWidth,
          height: maxHeight,
          maxHeight: maxHeight,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ 
            backgroundColor: 'var(--dark-orange)',
            borderBottomColor: 'var(--dark-gray)' 
          }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span 
              className="ml-4 text-sm font-medium"
              style={{ color: 'var(--cream)' }}
            >
              {title}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: 'var(--cream)' }}>
          {children}
        </div>

        {footer && (
          <div 
            className="px-4 py-2 border-t flex items-center justify-between flex-shrink-0"
            style={{ borderTopColor: 'var(--dark-gray)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}