import "./globals.css";
import Footer from "./components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
