import type { Metadata, Viewport } from "next";
import { Bungee, Manrope, Space_Mono } from "next/font/google";
import "./globals.css";

const bungee = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-bungee" });
const manrope = Manrope({ weight: ["400", "600", "700", "800"], subsets: ["latin"], variable: "--font-manrope" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: "Canta Aí 🎤",
  description: "Karaokê com fila ao vivo — escolha sua música e solta a voz!",
};

export const viewport: Viewport = {
  themeColor: "#170e2b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bungee.variable} ${manrope.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
