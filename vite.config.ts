import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        backpackCatcher: resolve(
          __dirname,
          "games/backpack-catcher/index.html",
        ),
        campingCross: resolve(__dirname, "games/Camping-Cross/index.html"),
        fishing: resolve(__dirname, "games/fishing/index.html"),
      },
    },
  },
});
