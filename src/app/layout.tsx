import type { Metadata } from "next";
import { DM_Mono, Inter } from "next/font/google";
import "./globals.css";

const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], style: ["normal", "italic"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Brasileirão Série A · Análise",
  description: "Análise honesta, editorial e direta do Brasileirão Série A 2026. Por José Américo Antunes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${dmMono.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
