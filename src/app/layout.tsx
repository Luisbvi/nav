import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { CartProvider } from '@/contexts/cart-context';
import './globals.css';
import { LanguageProvider } from '@/contexts/language-context';
import { createClient } from '@/utils/supabase/server';
import { ThemeProvider } from 'next-themes';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | CCH ',
    default: 'CCH Logistics Services Group',
  },
  description: 'Your premium online shopping destination',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider user={user}>
            <CartProvider>
              <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
                <main className="flex-1">{children}</main>
              </div>
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
