import { defineConfig } from "vite";
import { resolve } from "path";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

let firebaseValues = {};
const configPath = resolve(__dirname, "firebase-config.js");

if (existsSync(configPath)) {
  const raw = readFileSync(configPath, "utf-8");
  const extract = (key) => {
    const match = raw.match(new RegExp(`${key}:\\s*["']([^"']+)["']`));
    return match ? JSON.stringify(match[1]) : '""';
  };
  firebaseValues = {
    __FIREBASE_API_KEY__: extract("apiKey"),
    __FIREBASE_AUTH_DOMAIN__: extract("authDomain"),
    __FIREBASE_PROJECT_ID__: extract("projectId"),
    __FIREBASE_STORAGE_BUCKET__: extract("storageBucket"),
    __FIREBASE_MESSAGING_SENDER_ID__: extract("messagingSenderId"),
    __FIREBASE_APP_ID__: extract("appId"),
    __FIREBASE_MEASUREMENT_ID__: extract("measurementId"),
    __FIREBASE_GA_SECRET__: extract("gaApiSecret"),
  };
}

// Which entry to build — controlled by BUILD_ENTRY env var
const entry = process.env.BUILD_ENTRY || "firebase-bundle";
const entryFile = entry === "auth-bundle"
  ? resolve(__dirname, "src/auth.js")
  : resolve(__dirname, "src/app-entry.js");

export default defineConfig({
  define: firebaseValues,
  build: {
    outDir: "dist",
    emptyOutDir: entry === "firebase-bundle", // Only clean on first build
    lib: {
      entry: entryFile,
      name: entry === "auth-bundle" ? "LinkaroAuth" : "LinkaroApp",
      fileName: () => `${entry}.js`,
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    chunkSizeWarningLimit: 3000,
    minify: true,
  },
});
