import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteHost = env.VERCEL_PROJECT_PRODUCTION_URL || env.VITE_VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL || env.VITE_VERCEL_URL;
  const fallbackOrigin = mode === "production" ? "https://real-estate-management-mu.vercel.app" : "http://localhost:5173";
  const siteOrigin = (env.SITE_URL || (siteHost ? `https://${siteHost}` : fallbackOrigin)).replace(/\/$/, "");
  return {
  plugins: [
    {
      name: "share-preview-origin",
      transformIndexHtml: (html) => html.replaceAll("__SITE_ORIGIN__", siteOrigin),
    },
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Real Estate Management Portal",
        short_name: "RealEstate",
        description: "Premium real-estate platform with theme-awareness and offline resilience.",
        theme_color: "#0d6e67",
        background_color: "#f7f7f2",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    exclude: ["node_modules", "dist", ".git", ".cache", "tests"],
  },
  };
});
