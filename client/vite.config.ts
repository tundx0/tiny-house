import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows Vite to be accessed by custom domains
    port: 5173, // The port for mydomain.com
    proxy: {
      "/api": {
        target: "http://api.domain.com:9000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
