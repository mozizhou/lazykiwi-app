import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LazyKiwi",
  description: "AI image and video creation workspace",
  icons: {
    icon: [{ url: "/kiwi-logo.svg", type: "image/svg+xml" }],
    shortcut: "/kiwi-logo.svg",
    apple: "/kiwi-logo.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
