import MainLayout from '@/components/layout/MainLayout';

export default function Home() {
  const isAuthenticated = true;

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
      <div/>
    </MainLayout>
  );
}