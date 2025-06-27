import { Metadata } from 'next';
import { initializeLiff } from '@/lib/liff';
import './globals.css';

export const metadata: Metadata = {
  title: '写真眼鏡',
  description: '高齢者向けAI搭載写真・テキスト認識アプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // クライアントサイドでLIFFを初期化
  if (typeof window !== 'undefined') {
    initializeLiff().catch(console.error);
  }

  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
} 