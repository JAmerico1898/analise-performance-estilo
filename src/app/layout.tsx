import type { Metadata } from "next";
import { Barlow_Condensed, Fraunces, DM_Mono, Inter } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-display" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-serif" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Brasileirão Série A · Análise de Clubes",
  description: "Análise honesta, editorial e direta do Brasileirão Série A 2026. Por José Américo Antunes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${barlow.variable} ${fraunces.variable} ${dmMono.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
