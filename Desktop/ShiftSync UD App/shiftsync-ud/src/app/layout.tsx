import type { Metadata } from 'next';
import { Merriweather, Roboto } from 'next/font/google';
import './globals.css';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: "ShiftSync UD",
  description: "Shift management for UD Catering servers and managers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${merriweather.variable} antialiased bg-zinc-50 text-zinc-900`}>
        {children}
      </body>
    </html>
  );
}
