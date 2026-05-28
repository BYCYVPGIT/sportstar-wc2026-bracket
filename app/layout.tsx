import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: {
    default: 'FIFA World Cup 2026 Bracket Challenge — Sportstar',
    template: '%s | Sportstar WC 2026',
  },
  description:
    'Pick every match. Lock your bracket before kickoff. Climb the Sportstar leaderboard across the 48-team FIFA World Cup 2026.',
  openGraph: {
    siteName: 'Sportstar',
    type: 'website',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  metadataBase: new URL('https://sportstar.thehindu.com'),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#060a14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="flex flex-col min-h-dvh antialiased">
        {children}
      </body>
    </html>
  );
}
