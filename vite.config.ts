// vite.config.ts

import { defineConfig, loadEnv } from "vite"; // <-- Tambahkan loadEnv
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { ngrok } from "vite-plugin-ngrok";

// Gunakan fungsi agar bisa mengakses environment variable
export default defineConfig(({ mode }) => {
  // Baris ini akan memuat variabel dari .env.local
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      ngrok({
        authtoken: env.NGROK_AUTHTOKEN,
      }),
    ],
    server: {
      host: true, // <-- Tambahkan ini untuk mengizinkan akses dari IP lain
      port: 5173, // Port default Vite
    },
  };
});
