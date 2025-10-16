// Components
import AppHeader from "@/components/layout/header/header";
import AppSidebar from "@/components/layout/sidebar/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";

// Styles and Metadata
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";


// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata
export const metadata: Metadata = {
  title: {
    template: "%s | BaseApp",
    default: "BaseApp",
  },
  description: "BaseApp - Sistema para servir de base para novos projetos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>

          {/* Sidebar */}
          <AppSidebar />

          {/* Conteúdo Principal */}
          <SidebarInset>

            {/* Header */}
            <AppHeader />

            {/* Conteúdo da página */}
            <div className="h-full px-4 pt-6 pb-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </SidebarInset>

          {/* Toaster para notificações */}
          <Toaster position="top-center" theme="light" richColors />
        </Providers>
      </body>
    </html>
  );
}