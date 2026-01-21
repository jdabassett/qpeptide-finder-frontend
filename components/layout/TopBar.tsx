'use client';

interface TopBarProps {
  isAuthenticated?: boolean;
}

export default function TopBar({ isAuthenticated = false }: TopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-50">
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Logo/Brand - responsive text */}
        <h1 className="text-fluid-lg sm:text-fluid-xl font-semibold text-gray-900">
          QPeptide Finder
        </h1>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button className="px-3 sm:px-4 py-2 text-fluid-sm sm:text-fluid-base font-medium text-gray-700 hover:text-gray-900 transition-colors">
          {isAuthenticated ? 'Logout' : 'Login'}
        </button>
        
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 ${
          isAuthenticated 
            ? 'bg-gray-900 border-gray-900' 
            : 'bg-gray-900 border-gray-900'
        } flex items-center justify-center`}>
          {isAuthenticated ? (
            <span className="text-white text-fluid-xs font-medium">U</span>
          ) : (
            <span className="text-gray-400 text-fluid-xs">?</span>
          )}
        </div>
      </div>
    </header>
  );
}