import { svelte } from "@sveltejs/vite-plugin-svelte";
import { playwright } from "vite-plus/test/browser-playwright";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [svelte({ configFile: false })],
  base: "/Pokeblank/",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        endless: "endless/index.html",
        timeattack: "timeattack/index.html",
      },
    },
  },
  fmt: {
    ignorePatterns: ["src/data/**"],
  },
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.svelte.test.ts", "node_modules"],
          environment: "node",
        },
      },
      {
        plugins: [svelte({ configFile: false })],
        test: {
          name: "browser",
          include: ["src/**/*.svelte.test.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
            screenshotFailures: false,
          },
        },
      },
    ],
  },
});
