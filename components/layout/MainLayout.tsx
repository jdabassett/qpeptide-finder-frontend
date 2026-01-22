'use client';

import { useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import DirectionsModal from '../modals/DirectionsModal';
import Logo from '../logo'

interface MainLayoutProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

export default function MainLayout({ children, isAuthenticated = false }: MainLayoutProps) {
  const [isDirectionsModalOpen, setIsDirectionsModalOpen] = useState(false);

  const handleFileClick = (fileName: string) => {
    if (fileName === 'directions.mdx') {
      setIsDirectionsModalOpen(true);
    }
    // Handle other files when authenticated
  };

  return (
    <div className="flex min-h-screen">
      <TopBar isAuthenticated={isAuthenticated} />
      <Sidebar 
        isAuthenticated={isAuthenticated} 
        onFileClick={handleFileClick}
      />
      
      <main className="ml-64 pt-16 flex-1 bg-transparent">
        <div className="p-8">
          {children}
        </div>
      </main>

      <div className="fixed bottom-8 right-8 w-[40vw] h-[40vh] pointer-events-none z-20">
        <Logo className="w-full h-full object-contain" />
      </div>

      <DirectionsModal 
        isOpen={isDirectionsModalOpen}
        onClose={() => setIsDirectionsModalOpen(false)}
      />
    </div>
  );
}