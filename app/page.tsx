'use client';

import { useUserContext } from '@/components/providers/AuthProvider';
import MainLayout from '@/components/layout/MainLayout';

export default function Home() {
  const { isLoading } = useUserContext();

  if (isLoading) {
    return (
      <MainLayout>
        <div>Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div/>
    </MainLayout>
  );
}