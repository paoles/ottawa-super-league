import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Super League",
    short_name: "Super League",
    description:
      "The official app for the Ottawa Super League golf league at The Meadows Golf & Country Club.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#186732",
    icons: [
      {
        src: "/logo-icon.png",
        sizes: "500x500",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
