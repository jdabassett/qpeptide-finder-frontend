'use client';

import { useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import UniversalModal from '../modals/UniversalModal';
import Logo from '../logo';
import LoginContent from '../modals/content/Login';
import LogoutContent from '../modals/content/Logout';
import { useUserContext } from '@/components/providers/AuthProvider';
import type { ModalType } from '../modals/modalTypes';
import ScienceContent from '../modals/content/Science';
import ErrorModal from '../modals/ErrorModal';
import NewDigestContent from '../modals/content/NewDigest';
import DeleteModal from '../modals/DeleteModal';



interface MainLayoutProps {
  children: React.ReactNode;
}

const modalContentMap: Record<string, React.ComponentType<any>> = {
  'login': LoginContent,
  'logout': LogoutContent,
  'science': ScienceContent,
  'new-digest': NewDigestContent,
};
const modalTitleMap: Record<string, string> = {
  'login': 'Login',
  'logout': 'Logout',
  'science': 'Science behind QPeptides',
  'new-digest': 'New Digest',
};

export default function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useUserContext();
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
    setActiveModal(isAuthenticated ? 'logout' : 'login');
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const ModalContent = activeModal ? modalContentMap[activeModal] : null;
  const modalTitle = activeModal ? modalTitleMap[activeModal] || '' : '';


  return (
    <div className="flex min-h-screen">
      <TopBar
        onLoginClick={handleLoginClick}
      />
      <Sidebar
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
          {activeModal === 'logout' ? (
            <ModalContent onClose={closeModal} />
          ) : (
            <ModalContent />
          )}
        </UniversalModal>
      )}
      <DeleteModal />
      <ErrorModal />
    </div>
  );
}