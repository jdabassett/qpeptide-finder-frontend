'use client';

import { ReactNode } from 'react';

interface LoginButtonProps {
  connection: string;
  text: string;
  icon: ReactNode;
  onClick: (connection: string) => void;
}

export default function LoginButton({ connection, text, icon, onClick }: LoginButtonProps) {
  return (
    <button
      onClick={() => onClick(connection)}
      className="w-full px-6 py-3 font-medium transition-all flex items-center justify-center gap-3 relative"
      style={{
        backgroundColor: 'var(--dark-blue)',
        color: 'var(--cream)',
        border: '2px solid var(--dark-gray)',
        borderRight: '2px solid var(--black)',
        borderBottom: '2px solid var(--black)',
        boxShadow: 'inset -1px -1px 0 var(--dark-gray), inset 1px 1px 0 var(--white)',
        borderRadius: '2px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--cream)';
        e.currentTarget.style.color = 'var(--dark-blue)';
        e.currentTarget.style.border = '1px solid var(--dark-gray)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--dark-blue)';
        e.currentTarget.style.color = 'var(--cream)';
      }}
    >
      <span style={{ color: 'inherit' }}>
        {icon}
      </span>
      <span style={{ color: 'inherit' }}>
        {text}
      </span>
    </button>
  );
}