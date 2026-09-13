// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RegistrationTeam - Event Admin Panel",
  description: "Event management admin panel by OnsiteWala Studio",
  applicationName: "RegistrationTeam",
  authors: [{ name: "OnsiteWala Studio" }],
  keywords: ["event management", "registration", "badge printing"],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#1a0a00",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen antialiased overscroll-none`}
      >
        {children}
      </body>
    </html>
  );
}
