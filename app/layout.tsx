import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "../context/SidebarContext";
import { DarkModeProvider } from "@/context/DarkModeContext";
import { GeistSans } from 'geist/font/sans';

export const metadata: Metadata = {
  title: "TripKode",
  description: "Development by TripKode",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.className}`}
      data-scroll-behavior="smooth"
    >
      <head>
      </head>
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <DarkModeProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </DarkModeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
