import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

import { cn } from '@/lib/utils';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'DeMeta: Your Privacy Protector',
  description:
    'Remove metadata from files to protect your privacy. Protect your privacy and control what you share!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        {children}
        <footer className="w-full text-center py-8 px-4">
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Your privacy is our priority:</strong> Most files are
            processed locally in your browser. For video files, we temporarily
            process them on our servers using ExifTool, but files are
            automatically deleted immediately after processing and are never
            stored permanently.
          </p>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
