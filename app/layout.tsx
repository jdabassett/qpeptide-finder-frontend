import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google";
import AuthProvider  from '@/components/providers/AuthProvider';
import DeviceProvider from '@/components/providers/DeviceProvider';
import ErrorProvider from '@/components/providers/ErrorProvider';
import "./globals.css";
import DeleteProvider from '@/components/providers/DeleteProvider';
import DigestProvider from '@/components/providers/DigestProvider';

const courier = Courier_Prime({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-courier", 
});

export const metadata: Metadata = {
  title: "QPeptide Finder",
  description: "Protein digestion analysis tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${courier.variable} font-mono antialiased`}
      >
        <ErrorProvider>
          <AuthProvider>
            <DeleteProvider>
              <DigestProvider>
                <DeviceProvider>
                    {children}
                </DeviceProvider>
              </DigestProvider>
            </DeleteProvider>
          </AuthProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}