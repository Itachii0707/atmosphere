import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#facc15" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: "Atmosphere — Neubrutalist Weather App",
  description: "A portfolio-grade weather dashboard built with Next.js and FastAPI using Neubrutalism UI style.",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Atmosphere",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  openGraph: {
    title: "Atmosphere — Neubrutalist Weather",
    description: "Live weather dashboard with neubrutalist design, world clock, smart packing suggestions, and more.",
    type: "website",
  },
};

import { Space_Grotesk, Archivo } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});




export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${archivo.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('atmosphere_theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-amber-50 dark:bg-zinc-950 text-black dark:text-white transition-colors duration-200"
      >

        {children}
      </body>
    </html>
  );
}
