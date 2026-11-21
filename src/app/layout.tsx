import type { Metadata, Viewport } from 'next';
import { Newsreader, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';
import { ThemeProgressProvider } from '@/components/ThemeProgressProvider';

const serif = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'AI Mastery Studio — Zero to AI Engineer & Data Scientist',
  description:
    'A complete, self-contained interactive course taking frontend developers from zero to job-ready AI Engineer & Data Scientist with live Python labs, 18 visual simulators, spaced-repetition flashcards, and cross-device sync.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        <ThemeProgressProvider>{children}</ThemeProgressProvider>
      </body>
    </html>
  );
}
