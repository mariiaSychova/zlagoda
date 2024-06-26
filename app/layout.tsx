import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { FilterProvider } from "@/context/FilterContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'магазин "Злагода"',
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DataProvider>
            <FilterProvider>{children}</FilterProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
