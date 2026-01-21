import type { Metadata } from "next";
import "./globals.css";
import { PrivyProvider } from "@/components/providers/PrivyProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Ethos Talentspace",
  description: "Web3 Talent Talentspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PrivyProvider>
          {children}
          <Toaster />
        </PrivyProvider>
      </body>
    </html>
  );
}
