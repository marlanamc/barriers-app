import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CheckInProvider } from "@/lib/checkin-context";
import { PlanningProvider } from "@/lib/planning-context";
import { ThemeProvider } from "@/lib/theme-context";
import { OnboardingProvider } from "@/lib/onboarding-context";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeColorUpdater } from "@/components/ThemeColorUpdater";
import { GlobalNavigation } from "@/components/GlobalNavigation";
import { BottomTabBar } from "@/components/BottomTabBar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAStatus } from "@/components/PWAStatus";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "ADHD Barrier Tracker",
  description: "A gentle companion to help you track daily barriers and find supportive guidance",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Barrier Tracker",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Light mode: soft purple from gradient start (#f5f3ff)
  // Dark mode: dark purple from gradient start (#1e1b3d)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ff" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1b3d" },
  ],
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-app-gradient text-slate-900 dark:text-slate-100`}>
        <ErrorBoundary>
          <ThemeProvider>
            <ThemeColorUpdater />
            <AuthProvider>
              <OnboardingProvider>
                <CheckInProvider>
                  <PlanningProvider>
                    <GlobalNavigation />
                    {children}
                    <BottomTabBar />
                    <PWAInstallPrompt />
                    <PWAStatus />
                    <ServiceWorkerRegister />
                  </PlanningProvider>
                </CheckInProvider>
              </OnboardingProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
