'use client';

import { X } from 'lucide-react';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DirectionsModal({ isOpen, onClose }: DirectionsModalProps) {
  if (!isOpen) return null;

  const directionsContent = `# Welcome to QPeptide Finder

QPeptide Finder is a powerful tool for protein digestion analysis. This guide will help you get started.

## Getting Started

1. **Create an Account**: Click the "Login" button in the top right corner to create an account or sign in.

2. **Upload Your Protein**: Once logged in, you can upload protein sequences for analysis.

3. **Configure Analysis**: Set your digestion parameters and analysis criteria.

4. **View Results**: Review the generated peptide sequences and their properties.

## Features

- **Protein Digestion**: Analyze protein sequences with customizable enzyme parameters
- **Peptide Filtering**: Filter peptides based on various criteria
- **Export Results**: Download your analysis results in multiple formats

## Need Help?

If you have questions or need assistance, please refer to the documentation or contact support.

---

*Last updated: ${new Date().toLocaleDateString()}*
`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Modal Header - Text Editor Style */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-4 text-sm font-medium text-gray-700">directions.mdx</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Modal Content - Text Editor Style */}
        <div className="flex-1 overflow-auto bg-gray-900 text-gray-100 font-mono text-sm">
          <div className="p-6">
            <pre className="whitespace-pre-wrap font-mono">
              {directionsContent}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">Markdown</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}