import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Litus Taste — Comida Preparada Fresca y Deliciosa",
  description:
    "Descubre el menú semanal de Litus Taste. Comida preparada fresca, saludable y deliciosa. Ordene hoy para la próxima semana.",
  keywords: [
    "comida preparada",
    "meal prep",
    "Costa Rica",
    "comida saludable",
    "menú semanal",
    "Litus Taste",
  ],
  openGraph: {
    title: "Litus Taste — Comida Preparada Fresca y Deliciosa",
    description:
      "Descubre el menú semanal de Litus Taste. Comida preparada fresca, saludable y deliciosa.",
    locale: "es_CR",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
