import type { Metadata } from "next";
import { Roboto, Dancing_Script } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Ottawa Super League",
    template: "%s | Ottawa Super League",
  },
  description:
    "The official app for the Ottawa Super League golf league at The Meadows Golf & Country Club.",
  appleWebApp: {
    capable: true,
    title: "Super League",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/logo-app.png",
    apple: "/logo-app.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${dancingScript.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
