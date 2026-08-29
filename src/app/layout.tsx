import type { Metadata } from "next";
import { Inter, Frank_Ruhl_Libre, Inika, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--f-inter",
  display: "swap",
});

const frank = Frank_Ruhl_Libre({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--f-frank",
  display: "swap",
});

const inika = Inika({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--f-inika",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  // 400 and 700 are the walkthrough's body copy and step titles.
  weight: ["400", "500", "700"],
  variable: "--f-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "iGEM IIT Bombay — Turn bacteria into tiny protein factories",
  description:
    "Making proteins in a lab isn't magic—it's smart science. Follow Vera through plasmids, E. coli and IPTG to see how bacteria are turned into tiny protein factories.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${frank.variable} ${inika.variable} ${outfit.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
