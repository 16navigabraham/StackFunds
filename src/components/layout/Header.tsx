"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { WalletConnect } from "@/components/WalletConnect";

const navLinks = [
  { href: "/create", label: "Create Link" },
  { href: "/wallet", label: "My Wallet" },
];

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isAuthPage = pathname.startsWith("/auth");
  const isLandingPage = pathname === "/";
  const showNav = mounted && !isAuthPage && !isLandingPage;
  const showWalletConnect = mounted && !isAuthPage;


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          {showNav && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname.startsWith(href) ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {showWalletConnect && (
          <>
            <div className="hidden md:block">
              <WalletConnect />
            </div>

            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col gap-6 p-6">
                    <Logo />
                    <nav className="flex flex-col gap-4">
                      {navLinks.map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          className={cn(
                            "font-medium transition-colors hover:text-foreground/80",
                            pathname.startsWith(href)
                              ? "text-foreground"
                              : "text-foreground/60"
                          )}
                        >
                          {label}
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-auto">
                      <WalletConnect />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
