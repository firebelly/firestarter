import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import fluidTokensPlugin from "./src/tokens/terrazzo-plugin-fluid.mjs";

export default defineConfig({
  tokens: ["./src/tokens/design.tokens.json"],
  plugins: [
    css({
      filename: "tokens.css",
      variableName(token) {
        const id = token.id;

        // Space sizes: "Fluid tokens.Space size.3XS" → "--space-3xs"
        if (
          id.startsWith("Fluid tokens.Space size.") &&
          !id.includes("pairs")
        ) {
          const label = id.split(".").pop().toLowerCase();
          return `--space-${label}`;
        }

        // Space one-up pairs: "Fluid tokens.Space size pairs.3XS—2XS" → "--space-3xs-2xs"
        if (
          id.startsWith("Fluid tokens.Space size pairs.") &&
          !id.includes("Custom")
        ) {
          const pair = id.split(".").pop().toLowerCase().replace("—", "-");
          return `--space-${pair}`;
        }

        // Space custom pairs: "Fluid tokens.Space size pairs.Custom pairs.S—L" → "--space-s-l"
        if (id.startsWith("Fluid tokens.Space size pairs.Custom pairs.")) {
          const pair = id.split(".").pop().toLowerCase().replace("—", "-");
          return `--space-${pair}`;
        }

        // Font size: "Fluid tokens.Font size.Step 0" → "--step-0"
        if (id.startsWith("Fluid tokens.Font size.")) {
          const n = id.split("Step ").pop();
          return `--step-${n}`;
        }

        // Line height body: "Fluid tokens.Line height body.Step 0" → "--lh-body-step-0"
        if (id.startsWith("Fluid tokens.Line height body.")) {
          const n = id.split("Step ").pop();
          return `--lh-body-step-${n}`;
        }

        // Line height heading: "Fluid tokens.Line height heading.Step 0" → "--lh-heading-step-0"
        if (id.startsWith("Fluid tokens.Line height heading.")) {
          const n = id.split("Step ").pop();
          return `--lh-heading-step-${n}`;
        }

        // Non-fluid tokens: fall through to default naming
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
