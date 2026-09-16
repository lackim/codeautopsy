import { defineConfig } from "@shipcli/core";

export default defineConfig({
  name: "codeautopsy",
  description: "Post-mortem analysis of dead GitHub repos",
  build: {
    entrypoint: "./src/cli.ts",
    outDir: "bin",
    targets: ["macos-arm64", "linux-x64", "windows-x64"],
  },
  publish: {
    access: "public",
    bump: "patch",
  },
  share: {
    enabled: true,
  },
  landing: {
    outDir: "web",
  },
});
