'use client';

import { useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import UniversalModal from '../modals/UniversalModal';
import Logo from '../logo';
import LoginContent from '../modals/content/Login';
import type { ModalType } from '../modals/modalTypes';

interface MainLayoutProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

const modalContentMap: Record<string, React.ComponentType> = {
  'login': LoginContent,
};
const modalTitleMap: Record<string, string> = {
  'login': 'Login',
};

export default function MainLayout({ children, isAuthenticated = false }: MainLayoutProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleFileClick = (fileName: string) => {
    const modalMap: Record<string, ModalType> = {
      'New Digest': 'new-digest',
      'Digests': 'digests',
      'Analysis': 'analysis',
      'Directions': 'directions',
      'Science': 'science',
    };
    setActiveModal(modalMap[fileName] || null);
  };

  const handleLoginClick = () => {
    setActiveModal('login');
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const ModalContent = activeModal ? modalContentMap[activeModal] : null;
  const modalTitle = activeModal ? modalTitleMap[activeModal] : '';

  return (
    <div className="flex min-h-screen">
      <TopBar 
        isAuthenticated={isAuthenticated} 
        onLoginClick={handleLoginClick}
      />
      <Sidebar 
        isAuthenticated={isAuthenticated} 
        onFileClick={handleFileClick}
      />
      
      <main className="ml-64 pt-16 flex-1 bg-transparent">
        <div className="p-8">
          {children}
        </div>
      </main>

      <div className="fixed bottom-6 right-0 w-[50vw] h-[50vh] pointer-events-none z-20">
        <Logo className="w-full h-full object-contain" />
      </div>

      {ModalContent && (
        <UniversalModal
          isOpen={!!activeModal}
          onClose={closeModal}
          title={modalTitle}
        >
          <ModalContent />
        </UniversalModal>
      )}
    </div>
  );
}