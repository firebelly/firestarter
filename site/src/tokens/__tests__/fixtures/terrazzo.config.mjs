import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";

import fluidTokensPlugin from "../../terrazzo-plugin-fluid.mjs";

export default defineConfig({
  tokens: ["./src/tokens/__tests__/fixtures/test.tokens.json"],
  plugins: [
    css({
      filename: "test-output.css",
      variableName(token) {
        const patterns = [
          [/^Fluid tokens\.Space size pairs\.(.+)$/, "--space-"],
          [/^Fluid tokens\.Space size\.(.+)$/, "--space-"],
          [/^Fluid tokens\.Font size\.Step (.+)$/, "--step-"],
        ];

        for (const [re, prefix] of patterns) {
          const m = token.id.match(re);
          if (m) return prefix + m[1].toLowerCase().replace("\u2014", "-");
        }

        return undefined;
      },
      exclude: ["Fluid tokens.Grid.*", "Utopia.*"],
    }),
    fluidTokensPlugin(),
  ],
  outDir: "./src/tokens/__tests__/fixtures/",
});
