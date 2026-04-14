import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import "./globals.css";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Footer } from "@/components/layout/Footer";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mundo Emma - Tienda de Ropa para Niños",
  description: "Adorable ropa para tus pequeños. Colecciones exclusivas para bebés, niños y niñas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${outfit.className} antialiased flex flex-col min-h-screen`}>
        <CartProvider>
          <FavoritesProvider>
            <div className="flex-1 flex flex-col w-full relative">
              {children}
            </div>
          </FavoritesProvider>
          <Footer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
