import type { MetadataRoute } from "next";
import { isScmoProductMode, scmoFaviconUrl, scmoProductLabel, scmoProductName } from "@/lib/scmo-product-mode";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: isScmoProductMode ? scmoProductName : "Pi Web",
    short_name: isScmoProductMode ? scmoProductLabel : "Pi Web",
    description: isScmoProductMode ? "SimplicityCMO product-mode interface" : "Local web interface for the pi coding agent",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#1a1a1a",
    theme_color: "#1a1a1a",
    categories: ["developer", "productivity"],
    lang: "en",
    icons: [
      {
        src: isScmoProductMode ? scmoFaviconUrl : "/icons/icon-192.png",
        sizes: isScmoProductMode ? "150x150" : "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: isScmoProductMode ? scmoFaviconUrl : "/icons/icon-512.png",
        sizes: isScmoProductMode ? "150x150" : "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
