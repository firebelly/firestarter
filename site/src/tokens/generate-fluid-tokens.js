/**
 * Fluid Token Generator
 *
 * Generates fluid CSS custom properties from Figma design tokens
 * using utopia-core for space and type scale calculations.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { calculateSpaceScale } from "utopia-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read design tokens
const tokensPath = join(__dirname, "design.tokens.json");
const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));

// Extract config from tokens
const themeDeclarations = tokens["_theme-declarations"];

// Viewport config
const minWidth = parseInt(themeDeclarations.Viewport["Min width"]["$value"], 10);
const maxWidth = parseInt(themeDeclarations.Viewport["Max width"]["$value"], 10);

// Space config
const spaceConfig = themeDeclarations["Space Boundaries"];
const minSize = parseFloat(spaceConfig["Min size"]["$value"]);
const maxSize = parseFloat(spaceConfig["Max size"]["$value"]);
const positiveSpaces = spaceConfig["Positive spaces"]["$value"]
  .split(",")
  .map((s) => parseFloat(s.trim()));
const negativeSpaces = spaceConfig["Negative spaces"]["$value"]
  .split(",")
  .map((s) => parseFloat(s.trim()));

// Generate space scale using utopia-core
const spaceScale = calculateSpaceScale({
  minWidth,
  maxWidth,
  minSize,
  maxSize,
  positiveSteps: positiveSpaces,
  negativeSteps: negativeSpaces,
});

// Format CSS output
let css = ":root {\n";

// Space sizes
css += "  /* Space sizes */\n";
for (const size of spaceScale.sizes) {
  css += `  --space-${size.label}: ${size.clamp};\n`;
}

css += "\n";

// Space one-up pairs
css += "  /* Space one-up pairs */\n";
for (const pair of spaceScale.oneUpPairs) {
  css += `  --space-${pair.label}: ${pair.clamp};\n`;
}

css += "}\n";

// Output to console
console.log(css);
