import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
export default defineConfig({
  tokens: ["./src/tokens/design.tokens.json"],
  plugins: [
    css({
      filename: "terrazzo-tokens.css",
      exclude: [
        "_fluid-tokens.*",
        "_theme-declarations.*",
        "space-primitives.*",
        "type-primitives.Font size*",
        "type-primitives.Line height*",
      ],
    }),
  ],
  outDir: "./src/tokens/",
  lint: {
    /** @see https://terrazzo.app/docs/cli/lint */
  },
});
