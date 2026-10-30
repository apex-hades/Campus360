import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Campus360 | AI-Powered Campus Operations & Intelligence Platform',
  description: 'Enterprise operations, smart ticketing, NLP incident extraction, room scheduling, workforce optimization, and disruption resolution.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}

