import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'tama-gift',
  description: 'A Tamagotchi-style gift app built with Next.js + Supabase.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-blush text-plum antialiased">{children}</body>
    </html>
  );
}
