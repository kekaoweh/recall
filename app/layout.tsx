import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Recall — Turn anything into flashcards",
  description: "Paste your notes, articles, or chapters. Recall turns them into beautiful flashcards in seconds, then helps you remember.",
  openGraph: {
    title: "Recall — Turn anything into flashcards",
    description: "AI-powered flashcards from any text. Study smarter.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="font-sans antialiased min-h-full bg-[#fafaf7] text-zinc-900">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
