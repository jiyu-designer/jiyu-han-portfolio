import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Montserrat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Jiyu Han | Portfoilo",
  description: "Jiyu Han Portfolio",
  openGraph: {
    title: "Jiyu Han | Portfoilo",
    description: "Jiyu Han Portfolio",
    images: [{ url: "/images/Thumbnail.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jiyu Han | Portfoilo",
    description: "Jiyu Han Portfolio",
    images: ["/images/Thumbnail.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${montserrat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
