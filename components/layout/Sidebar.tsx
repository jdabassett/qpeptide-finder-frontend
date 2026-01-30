'use client';

import { useState } from 'react';
import { FileText, Lock, Search, Slice, ChartColumnIncreasing, Microscope} from 'lucide-react';

interface SidebarProps {
  isAuthenticated?: boolean;
  onFileClick: (fileName: string) => void;
}

export default function Sidebar({ isAuthenticated = false, onFileClick }: SidebarProps) {
  const publicFiles = [
    { name: 'Directions', icon: FileText, color: 'var(--blue)' },
    { name: 'Science', icon: Microscope, color: 'var(--light-red)' },
  ];

  const authenticatedFiles = [
    { name: 'New Digest', icon: Slice, color: 'var(--dark-orange)' },
    { name: 'Digests', icon: Search, color: 'var(--dark-yellow)' },
    { name: 'Analysis', icon: ChartColumnIncreasing, color: 'var(--rainbow-green)' },
  ];

  const files = isAuthenticated 
    ? [...authenticatedFiles, ...publicFiles]
    : publicFiles;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-48 sm:w-64 bg-transparent overflow-y-auto z-10">
      <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
        {files.map((file) => {
          const Icon = file.icon;

          return (
            <button
              key={file.name}
              onClick={() => onFileClick(file.name)}
              className="w-full flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg transition-all relative z-20 active:scale-95"
            >
              {/* Responsive icon container */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 mb-1 sm:mb-2 flex items-center justify-center rounded-md border-1 border-gray-900 bg-white shadow-sm transition-colors"
                style={{
                                backgroundColor: 'var(--cream)',
                                borderColor: 'var(--dark-gray)'
                              }}
                              >
                <Icon 
                  className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer" 
                  style={{
                    color: file.color
                  }}
                />
              </div>
              
              {/* Responsive text size with cream background */}
              <span className="text-fluid-xs sm:text-fluid-sm font-medium text-center max-w-full truncate px-2 py-1 rounded border sidebar-label cursor-pointer"
                style={{
                  backgroundColor: 'var(--cream)',
                  color: 'var(--black)',
                  borderColor: 'var(--dark-gray)'
                }}
              >
                {file.name}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}