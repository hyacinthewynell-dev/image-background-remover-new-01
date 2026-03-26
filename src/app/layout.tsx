import type { Metadata } from "next";
import "@/styles/globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "BG Remover - Remove Image Backgrounds",
  description: "Upload any image and remove its background automatically with one click.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
