'use client';

import { useState } from 'react';
import { FileText, Lock, Search, Slice, ChartColumnIncreasing, Microscope} from 'lucide-react';

interface SidebarProps {
  isAuthenticated?: boolean;
  onFileClick: (fileName: string) => void;
}

export default function Sidebar({ isAuthenticated = false, onFileClick }: SidebarProps) {
  const publicFiles = [
    { name: 'Directions', icon: FileText },
    { name: 'Science', icon: Microscope },
  ];

  const authenticatedFiles = [
    { name: 'New Digest', icon: Slice },
    { name: 'Digests', icon: Search },
    { name: 'Analysis', icon: ChartColumnIncreasing },
  ];

  const files = isAuthenticated 
    ? [...authenticatedFiles, ...publicFiles]
    : publicFiles;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-48 sm:w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto z-10">
      <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
        {files.map((file) => {
          const Icon = file.icon;

          return (
            <button
              key={file.name}
              onClick={() => onFileClick(file.name)}
              className="w-full flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg transition-all relative z-20 hover:bg-gray-100 cursor-pointer active:scale-95"
            >
              {/* Responsive icon container */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 mb-1 sm:mb-2 flex items-center justify-center rounded-md border-2 border-gray-300 bg-white shadow-sm hover:border-blue-400 hover:shadow-md transition-colors">
                <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900" />
              </div>
              
              {/* Responsive text size */}
              <span className="text-fluid-xs sm:text-fluid-sm font-medium text-center max-w-full truncate text-gray-900">
                {file.name}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}