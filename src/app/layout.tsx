import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://jiyu-han-portfolio.vercel.app"),
  title: "Jiyu Han | Portfolio",
  description: "Jiyu Han — creative developer building AI music, generative art, media art, and virtual brand experiences.",
  openGraph: {
    title: "Jiyu Han | Portfolio",
    description: "Jiyu Han — creative developer building AI music, generative art, media art, and virtual brand experiences.",
    images: [{ url: "/images/Thumbnail.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jiyu Han | Portfolio",
    description: "Jiyu Han — creative developer building AI music, generative art, media art, and virtual brand experiences.",
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
