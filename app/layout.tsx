import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}