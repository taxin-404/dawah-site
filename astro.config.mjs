import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "hybrid",
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  i18n: {
    defaultLocale: "en",
    locales: ["en", "bn", "ar"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
