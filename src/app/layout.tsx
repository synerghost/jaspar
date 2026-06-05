import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  // Ship the weights we actually use: 400 body, 700 display headlines
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://j4spar.com"),
  title: {
    default: "JASPÄR",
    template: "%s — JASPÄR",
  },
  description:
    "Mode contemporaine avant-gardiste, Paris. Denim brut, pièces art, made-to-order.",
  icons: {
    icon: "/favicon.png",
    apple: "/brand/cropped-FAV-Jaspar-180x180.png",
  },
  openGraph: {
    title: "JASPÄR",
    description: "Mode contemporaine avant-gardiste, Paris. Made to order.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
