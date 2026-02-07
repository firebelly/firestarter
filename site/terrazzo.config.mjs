import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
export default defineConfig({
  tokens: ["./src/tokens/design.tokens.json"],
  plugins: [
    css({
      filename: "tokens.css",
      exclude: [
        "Space primitives.*",
        "Type primitives.Font size*",
        "Type primitives.Line height*",
        "Fluid tokens.*",
        "Utopia.*",
      ],
    }),
  ],
  outDir: "./src/tokens/",
  lint: {
    /** @see https://terrazzo.app/docs/cli/lint */
  },
});
