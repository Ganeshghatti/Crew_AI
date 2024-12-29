import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "https://aidcirle-admin.vercel.app",
  //added global:window to fix draft-js issue. Error solved: "global not defined"
  // define: {
  //   global: "window",
  // },
  // Added esbuild to make vite accept .js files also. Error solved : "Failed to parse source for import analysis because the content contains invalid JS syntax. If you are using JSX, make sure to name the file with the .jsx or .tsx extension."
  esbuild: {
    include: /\.[jt]sx?$/,
    exclude: [],
    loader: "jsx",
  },
});
