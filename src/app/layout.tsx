import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mehrabani.org — Free Education Materials for Every Dreamer",
  description:
    "Mehrabani provides high-quality, open-source educational resources absolutely free. Explore science, technology, literature, history, and more.",
  keywords: [
    "free education",
    "open-source learning",
    "online courses",
    "study materials",
    "mehrabani",
  ],
  openGraph: {
    title: "mehrabani.org — Knowledge For All",
    description:
      "Free, open-source educational resources for primary students, college learners, and self-paced autodidacts.",
    type: "website",
    url: "https://mehrabani.org",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}