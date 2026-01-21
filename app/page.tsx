import MainLayout from '@/components/layout/MainLayout';

export default function Home() {
  const isAuthenticated = true;

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to QPeptide Finder
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Click on "directions.mdx" in the sidebar to get started
          </p>
        </div>
      </div>
    </MainLayout>
  );
}