import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FirebaseClientProvider } from '@/firebase';
import {
  TurnkeyProvider,
  TurnkeyProviderConfig,
} from "@turnkey/react-wallet-kit";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const turnkeyConfig: TurnkeyProviderConfig = {
  organizationId:"env 9346084e-abdf-4ff1-98c7-084c40cbba7c!",
  authProxyConfigId:"env ac7f0624-a25a-4f56-9748-b98cdbe3fdb8!",
};
export const metadata: Metadata = {
  title: 'StackFund: Bitcoin Crowdfunding',
  description: 'Fund Ideas. Empower Innovation with Bitcoin.',
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
          inter.variable
        )}
      >
        <FirebaseClientProvider>
          <div className="relative flex min-h-dvh flex-col bg-background">
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
