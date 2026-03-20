import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "codeautopsy — Post-mortem analysis of dead GitHub repos",
  description: "Post-mortem analysis of dead GitHub repos",
  openGraph: {
    title: "codeautopsy",
    description: "Post-mortem analysis of dead GitHub repos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "codeautopsy",
    description: "Post-mortem analysis of dead GitHub repos",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
