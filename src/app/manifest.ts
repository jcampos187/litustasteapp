import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Litus Taste — Comida Preparada Fresca y Deliciosa",
    short_name: "Litus Taste",
    description:
      "Menú semanal de comida preparada fresca, saludable y deliciosa. Recibe en tu casa.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FDFBF7",
    theme_color: "#15803D",
    categories: ["food", "lifestyle"],
    lang: "es-CR",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/ScreenShot2.png",
        sizes: "1179x2556",
        type: "image/png",
        form_factor: "narrow",
        label: "Menú Semanal de Litus Taste",
      },
    ],
  };
}
