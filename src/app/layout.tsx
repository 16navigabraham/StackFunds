import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import '@/app/globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FirebaseClientProvider } from '@/firebase';
import { TurnkeyProvider } from "@turnkey/sdk-react";

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'StackFund: Bitcoin powered payment link',
  description: 'Empower Businesss Payment with Bitcoin network.',
  icons: {
    icon: '/stack.png',
    shortcut: '/stack.png',
    apple: '/stack.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          inter.variable,
          spaceGrotesk.variable,
          jetbrainsMono.variable
        )}
      >
        <TurnkeyProvider
          config={{
            apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
            defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
            serverSignUrl: "/api/turnkey/sign",
          }}
        >
          <FirebaseClientProvider>
            <div className="relative flex min-h-dvh flex-col bg-background">
              <Header />
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </FirebaseClientProvider>
        </TurnkeyProvider>
      </body>
    </html>
  );
}
