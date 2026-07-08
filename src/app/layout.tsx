import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LazyKiwi",
  description: "AI image and video creation workspace"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
