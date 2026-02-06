'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDevice } from '../providers/DeviceProvider';

type ModalSize = 'small' | 'fullscreen';

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
  const { isMobile } = useDevice();
  const [modalSize, setModalSize] = useState<ModalSize>('small');

  useEffect(() => {
    if (isOpen) {
      setModalSize(isMobile ? 'fullscreen' : 'small');
    }
  }, [isOpen, isMobile]);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getModalStyles = () => {
    if (isMobile || modalSize === 'fullscreen') {
      return {
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
      };
    } else {
      return {
        top: '5rem', 
        left: '16rem', 
        width: maxWidth,
        maxWidth: maxWidth,
        height: maxHeight,
        maxHeight: maxHeight,
      };
    }
  };

  const handleRedClick = () => {
    onClose();
  };

  const handleYellowClick = () => {
    if (!isMobile) {
      setModalSize('small');
    }
  };

  const handleGreenClick = () => {
    if (!isMobile) {
      setModalSize('fullscreen');
    }
  };

  const isFullscreen = isMobile || modalSize === 'fullscreen';

  return (
    <>
      {/* Backdrop overlay - only show in fullscreen mode */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Modal container */}
      <div 
        className="fixed flex flex-col z-[101]"
        style={getModalStyles()}
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
          <div 
            className="flex items-center justify-between px-4 py-2 flex-shrink-0 cursor-move"
            style={{ 
              backgroundColor: 'var(--dark-orange)',
              borderBottom: '2px solid var(--black)',
            }}
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRedClick}
                className="w-3 h-3 rounded-full bg-red-500 border border-black hover:opacity-80 transition-opacity cursor-pointer"
                aria-label="Close modal"
                title="Close"
              />
              <button
                onClick={handleYellowClick}
                disabled={isMobile}
                className={`w-3 h-3 rounded-full bg-yellow-500 border border-black transition-opacity cursor-pointer ${
                  isMobile ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                }`}
                aria-label="Small size"
                title="Small size"
              />
              <button
                onClick={handleGreenClick}
                disabled={isMobile}
                className={`w-3 h-3 rounded-full bg-green-500 border border-black transition-opacity cursor-pointer ${
                  isMobile ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                }`}
                aria-label="Fullscreen"
                title="Fullscreen"
              />
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
    </>
  );
}