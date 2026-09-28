import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cool Technologies CRM - Enterprise ERP Platform',
  description: 'Complete enterprise CRM and ERP platform for Cool Technologies with sales, tasks, purchase, marketing, and reports.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <EnterpriseShell>{children}</EnterpriseShell>
      </body>
    </html>
  );
}
