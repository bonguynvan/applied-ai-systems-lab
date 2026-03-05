import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { Metadata, Viewport } from 'next'
import '@/app/globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Applied AI Playground',
  description:
    'A developer\'s sandbox for exploring practical AI integration patterns with cost tracking and observability',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.svg',
    apple: '/logo.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <NextIntlClientProvider messages={messages}>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <Toaster theme="dark" position="bottom-right" richColors />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
