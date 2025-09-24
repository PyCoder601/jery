import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Window from "./Window";
import RobotGuide from "@/app/RobotGuide";
import ReduxProvider from "@/redux/Provider";

export const metadata: Metadata = {
  title: "Jery",
  description: "Server monitoring app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#111b21] to-[#202c33] text-white">
        <ReduxProvider>
          <Window>{children}</Window>
          <RobotGuide />
        </ReduxProvider>
      </body>
    </html>
  );
}
