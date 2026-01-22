"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import HeaderAuth from "@/components/auth/HeaderAuth";
import Footer from "@/components/Footer";
import config from "@/config";
import ContactBox from "@/components/contact/ContactBox";
import { baseOpenGraph } from "../shared-metadata";
import Script from "next/script";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import ChatWidget from "@/components/chat/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col w-full`}
      >
        <div className=" w-full relative bg-black">
          {/* Arctic Lights Background with Top Glow */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34, 197, 94, 0.25), transparent 70%), #000000",
            }}
          />
          <SessionProvider>
            <HeaderAuth />
            <Toaster position="top-center" richColors />
            <main className="relative flex-grow w-full"> {children}</main>
          </SessionProvider>
        </div>
        {/* <ContactBox /> */}
        <ChatWidget />
        <Footer />
      </body>
    </html>
  );
}
