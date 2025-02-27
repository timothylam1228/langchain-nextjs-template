import "./globals.css";
import { Geist, Geist_Mono, Public_Sans } from "next/font/google";
import { ActiveLink } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { ReactQueryClientProvider } from "@/components/wallet/ReactQueryClientProvider";
import { AutoConnectProvider } from "@/components/wallet/AutoConnectProvider";
import { WalletConnectionHandler } from "@/components/wallet/User_store";
import Wallet from "@/components/wallet/client_wallet";
import Image from "next/image";
import { ThemeToggle } from "@/components/wallet/ThemeToggle";
import { ThemeProvider } from "@/components/wallet/ThemeProvider";

const publicSans = Public_Sans({ subsets: ["latin"] });
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AutoConnectProvider>
      <ReactQueryClientProvider>
        <WalletProvider>
          <html lang="en">
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              <WalletConnectionHandler>{children}</WalletConnectionHandler>
            </body>
          </html>
        </WalletProvider>
      </ReactQueryClientProvider>
    </AutoConnectProvider>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AutoConnectProvider>
      <ReactQueryClientProvider>
        <WalletProvider>
          <html lang="en" suppressHydrationWarning>
            <head>
              <title>2Tag x MetaMove</title>
              <link rel="shortcut icon" href="/images/favicon.ico" />
              <meta name="description" content="2Tag x MetaMove" />
              <meta property="og:title" content="2Tag x MetaMove" />
              <meta property="og:description" content="2Tag x MetaMove" />
              <meta property="og:image" content="/images/og-image.png" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content="2Tag x MetaMove" />
              <meta name="twitter:description" content="2Tag x MetaMove" />
              <meta name="twitter:image" content="/images/og-image.png" />
            </head>
            <body className={publicSans.className}>
              <ThemeProvider attribute="class">
                <WalletConnectionHandler>
                  <NuqsAdapter>
                    <div className="grid grid-rows-[auto,1fr] h-[100dvh]">
                      <div className="grid grid-cols-[1fr,auto] gap-2 p-4">
                        <div className="flex gap-4 flex-col md:flex-row md:items-center justify-between">
                          <a
                            href="https://www.2tag.ai"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="flex items-center gap-2"
                          >
                            {/* <Logo /> */}
                            <div className="flex h-full items-center">
                              <Image
                                src="/images/2tag-logo.png"
                                alt="Logo"
                                className="h-10"
                                width={100}
                                height={100}
                              />
                            </div>
                          </a>
                          <nav className="flex gap-1 flex-col md:flex-row">
                            <ThemeToggle />
                            <Wallet />
                          </nav>
                        </div>
                      </div>
                      <div className="mx-4 relative grid rounded-t-2xl border border-input border-b-0">
                        <div className="absolute inset-0">{children}</div>
                      </div>
                    </div>
                    <Toaster />
                  </NuqsAdapter>
                </WalletConnectionHandler>
              </ThemeProvider>
            </body>
          </html>
        </WalletProvider>
      </ReactQueryClientProvider>
    </AutoConnectProvider>
  );
}
