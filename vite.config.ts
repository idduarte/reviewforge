import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version } = require("./package.json") as { version: string };

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
});
