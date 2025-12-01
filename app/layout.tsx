import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'OmniDev v3.0',
  description: 'Agentic multimodal workspace built with VASEY/AI palette.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
