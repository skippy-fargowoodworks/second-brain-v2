import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PageShell } from "@/components/shell/page-shell";
import { prisma } from "@/lib/prisma";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetBrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Second Brain",
  description: "Skippy's task tracker + knowledge base",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const status = await prisma.status.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <html lang="en" className="dark">
      <body
        className={`${grotesk.variable} ${jetBrains.variable} font-sans antialiased`}
      >
        <Providers>
          <PageShell status={status?.status ?? "idle"}>{children}</PageShell>
        </Providers>
      </body>
    </html>
  );
}
