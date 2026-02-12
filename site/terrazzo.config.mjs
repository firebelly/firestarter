import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";

import fluidTokensPlugin from "./src/tokens/terrazzo-plugin-fluid.mjs";

export default defineConfig({
  tokens: ["./src/tokens/design.tokens.json"],
  plugins: [
    css({
      filename: "tokens.css",
      variableName(token) {
        const patterns = [
          [/^Fluid tokens\.Space size pairs\.Custom pairs\.(.+)$/, "--space-"],
          [/^Fluid tokens\.Space size pairs\.(.+)$/, "--space-"],
          [/^Fluid tokens\.Space size\.(.+)$/, "--space-"],
          [/^Fluid tokens\.Font size\.Step (.+)$/, "--step-"],
          [/^Fluid tokens\.Line height body\.Step (.+)$/, "--lh-body-step-"],
          [
            /^Fluid tokens\.Line height heading\.Step (.+)$/,
            "--lh-heading-step-",
          ],
        ];

        for (const [re, prefix] of patterns) {
          const m = token.id.match(re);
          if (m) return prefix + m[1].toLowerCase().replace("\u2014", "-");
        }

        return undefined;
      },
      exclude: [
        "Space primitives.*",
        "Type primitives.Font size*",
        "Type primitives.Line height*",
        "Fluid tokens.Grid.*",
        "Utopia.*",
      ],
    }),
    fluidTokensPlugin(),
  ],
  outDir: "./src/tokens/",
  lint: {
    /** @see https://terrazzo.app/docs/cli/lint */
  },
});
