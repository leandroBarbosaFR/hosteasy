import type { Metadata } from "next";
import { Geist, Geist_Mono, Gloock } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gloock = Gloock({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "HostEasy — Tablets inteligentes para aluguéis de temporada",
  description:
    "O tablet sempre ligado que transforma cada estadia em mais receita: check-in digital, guia da casa, comunicação com hóspedes e vendas extras. Feito para anfitriões em Florianópolis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${gloock.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
