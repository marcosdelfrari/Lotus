import {
  Barlow_Condensed,
  Geist_Mono,
  Roboto_Flex,
  Saira_Condensed,
  Sora,
} from "next/font/google";
import type { Metadata } from "next";
import Script from "next/script";
import { WebMcpProvider } from "@/app/components/webmcp-provider";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-barlow-condensed",
  preload: false,
});

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "XOPQ", "XTRA", "YOPQ", "YTDE", "YTFI", "YTLC", "YTUC"],
  variable: "--font-roboto-flex",
  preload: false,
});

const sairaCondensed = Saira_Condensed({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-saira-condensed",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lótus — Gestão de tráfego pago",
  description:
    "Gestão de Google Ads e Meta Ads para empresas que querem vender mais com método.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} ${barlowCondensed.variable} ${robotoFlex.variable} ${sairaCondensed.variable} ${geistMono.variable} bg-background antialiased`}
      style={{ backgroundColor: "#0c0c0c", colorScheme: "dark" }}
    >
      <head>
        <link
          rel="describedby"
          href="/.well-known/ai-catalog.json"
          type="application/json"
          title="ARD AI Catalog"
        />
        <link
          rel="describedby"
          href="/.well-known/poppy.json"
          type="application/json"
          title="Personal Agent Protocol"
        />
      </head>
      <body className="min-h-dvh overflow-x-clip bg-background text-foreground">
        <Script src="/webmcp.js" strategy="beforeInteractive" />
        <WebMcpProvider />
        {children}
      </body>
    </html>
  );
}
