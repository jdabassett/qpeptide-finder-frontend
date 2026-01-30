'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import MainLayout from '@/components/layout/MainLayout';

export default function Home() {
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;

  if (isLoading) {
    return (
      <MainLayout isAuthenticated={false}>
        <div>Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
      <div/>
    </MainLayout>
  );
}