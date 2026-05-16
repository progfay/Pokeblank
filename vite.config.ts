import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [svelte()],
  base: "/Pokeblank/",
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
        plugins: [svelte()],
        test: {
          name: "browser",
          include: ["src/**/*.svelte.test.ts"],
          browser: {
            enabled: true,
            provider: "playwright",
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
