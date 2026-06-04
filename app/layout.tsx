// app/layout.tsx
import type { Metadata } from 'next';
import { inter, notoSansSC } from '@/lib/fonts';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'GoSarwar | Digital Business Growth',
  description: 'We blend creativity and data to achieve success.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="auto">
      <head>
      </head>
      <body className={`${inter.className} ${notoSansSC.className} overflow-x-hidden antialiased`}>
        {children}
      </body>
    </html>
  );
}