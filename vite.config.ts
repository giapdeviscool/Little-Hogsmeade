import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api/v1": {
          target: env.VITE_API_PROXY_TARGET || "http://localhost:3000",
          changeOrigin: true,
        },
        "/socket.io": {
          target: env.VITE_API_PROXY_TARGET || "http://localhost:3000",
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
