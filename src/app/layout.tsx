import type { Metadata } from "next";
import localFont from "next/font/local";
import Footer from "@/components/footer";
import Header from "@/components/header";
import "./globals.css";

const slight = localFont({
  src: "../../public/Slight-Regular.ttf",
  variable: "--font-heading",
  display: "swap",
});

const libreBaskerville = localFont({
  src: "../../public/LibreBaskerville-VariableFont_wght.ttf",
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Little c co.",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${slight.variable} ${libreBaskerville.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
