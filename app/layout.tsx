import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OmniDev V3.0 - AI Chat Workspace',
  description: 'A modern, mobile-first multimodal AI chat workspace with support for multiple LLM providers',
  manifest: '/manifest.json',
  themeColor: '#2B3E47',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OmniDev',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body data-theme="dark">
        {children}
      </body>
    </html>
  );
}
