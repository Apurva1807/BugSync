import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    allowedHosts: [
      "localhost",
      "frontend-production-3a446.up.railway.app",
    ],
  },
});