import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/MIACC_Score/",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        score: "score.html",
      },
    },
  },
});
