import type { Metadata, Viewport } from "next";
import { Noto_Sans_Mono } from "next/font/google";
import { PwaRegistration } from "@/components/PwaRegistration";
import { isScmoProductMode, scmoFaviconUrl, scmoProductLabel, scmoProductName } from "@/lib/scmo-product-mode";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./settings.css";

const notoSansMono = Noto_Sans_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-noto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: isScmoProductMode ? scmoProductLabel : "Pi Web",
  description: isScmoProductMode ? "SimplicityCMO product-mode interface" : "Pi Web interface for the pi coding agent",
  applicationName: isScmoProductMode ? scmoProductName : "Pi Web",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: isScmoProductMode ? scmoFaviconUrl : "/icons/icon-192.png",
        sizes: isScmoProductMode ? "150x150" : "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: isScmoProductMode ? scmoFaviconUrl : "/icons/apple-touch-icon.png",
        sizes: isScmoProductMode ? "150x150" : "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: isScmoProductMode ? scmoProductName : "Pi Web",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" translate="no" className={`${notoSansMono.variable} notranslate`} suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("pi-theme");var dark=t==="dark"||((t==null||t===""||t==="auto")&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(dark)document.documentElement.classList.add("dark")}catch(e){}})();`,
          }}
        />
      </head>
      <body translate="no" className="notranslate" suppressHydrationWarning>
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
