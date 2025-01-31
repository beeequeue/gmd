import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/cli/index.ts"],
  outDir: "dist",

  target: "node20",
  format: ["esm"],
  esbuildOptions: (options) => {
    options.supported = {
      // For better performance: https://github.com/evanw/esbuild/issues/951
      "object-rest-spread": false,
    }
  },

  banner: {
    js: "import {createRequire} from 'module';const require=createRequire(import.meta.url);",
  },

  dts: true,
  bundle: true,
  sourcemap: true,
  minify: true,
  clean: true,
})
