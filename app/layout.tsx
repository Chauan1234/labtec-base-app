// Components
import AppHeader from "@/app/(main)/_components/header/header";
import AppSidebar from "@/app/(main)/_components/sidebar/app-sidebar";
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
  icons: {
    icon: "/dev/apps/favicon.ico",
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
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){} })();` }} />
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