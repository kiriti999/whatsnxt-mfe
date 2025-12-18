import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: "./vitest.setup.ts",
    include: ["app/**/*.test.ts", "app/**/*.spec.ts"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["app/**/*.ts"],
      exclude: [
        "app/**/*.test.ts",
        "app/**/*.spec.ts",
        "app/**/index.ts",
        "app/database/migrations/**/*",
        "app/tests/**/*",
        "app/config/**/*",
        "app/errors/**/*",
      ],
    },
    threads: true,
    watch: false,
    clearMocks: true,
  },
  resolve: {
    alias: {
      "@whatsnxt/errors": "../../packages/errors/src",
      "@whatsnxt/constants": "../../packages/constants/src",
      "@whatsnxt/http-client": "../../packages/http-client/src",
    },
  },
});
