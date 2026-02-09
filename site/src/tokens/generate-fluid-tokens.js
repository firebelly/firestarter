/**
 * Fluid Token Generator
 *
 * Generates fluid CSS custom properties from Figma design tokens
 * using utopia-core for space and type scale calculations.
 */

import { appendFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  calculateClamp,
  calculateSpaceScale,
  calculateTypeScale,
} from "utopia-core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read design tokens
const tokensPath = join(__dirname, "design.tokens.json");
const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));

// Extract config from tokens
const utopia = tokens["Utopia"];

// Viewport config
const viewportConfig = {
  minWidth: parseInt(utopia.Viewport["Min width"]["$value"], 10),
  maxWidth: parseInt(utopia.Viewport["Max width"]["$value"], 10),
};

// Space config
const spaceConfig = {
  minSize: parseInt(utopia.Space["Min size"]["$value"], 10),
  maxSize: parseInt(utopia.Space["Max size"]["$value"], 10),
  positiveSpaces: utopia.Space["Positive spaces"]["$value"]
    .split(",")
    .map((s) => parseFloat(s.trim())),
  negativeSpaces: utopia.Space["Negative spaces"]["$value"]
    .split(",")
    .map((s) => parseFloat(s.trim())),
  customSpaces: utopia.Space["Custom spaces"]["$value"],
};

// Type config
const typeConfig = {
  minSize: parseInt(utopia.Type["Min size"]["$value"], 10),
  maxSize: parseInt(utopia.Type["Max size"]["$value"], 10),
  positiveSteps: parseInt(utopia.Type["Positive steps"]["$value"], 10),
  negativeSteps: parseInt(utopia.Type["Negative steps"]["$value"], 10),
  minScale: parseFloat(utopia.Type["Min scale"]["$value"]),
  maxScale: parseFloat(utopia.Type["Max scale"]["$value"]),
  lineHeightMinScale: tokens["Type primitives"]["Line height @min"],
  lineHeightBodyMaxScale: tokens["Type primitives"]["Line height body @max"],
  lineHeightHeadingMaxScale:
    tokens["Type primitives"]["Line height heading @max"],
};

// Set space scale
const spaceScale = calculateSpaceScale({
  minWidth: viewportConfig.minWidth,
  maxWidth: viewportConfig.maxWidth,
  minSize: spaceConfig.minSize,
  maxSize: spaceConfig.maxSize,
  positiveSteps: spaceConfig.positiveSpaces,
  negativeSteps: spaceConfig.negativeSpaces,
  customSizes: spaceConfig.customSpaces
    .split(",")
    .map((s) => s.trim().toLowerCase()),
});

// Set font sizes
const fontSizes = calculateTypeScale({
  minWidth: viewportConfig.minWidth,
  maxWidth: viewportConfig.maxWidth,
  minFontSize: typeConfig.minSize,
  maxFontSize: typeConfig.maxSize,
  minTypeScale: typeConfig.minScale,
  maxTypeScale: typeConfig.maxScale,
  positiveSteps: typeConfig.positiveSteps,
  negativeSteps: typeConfig.negativeSteps,
});

// Calculate line height
function calculateLineHeight(minScale, maxScale) {
  return Object.keys(minScale).map((step) => ({
    label: parseInt(step.replace("Step ", ""), 10),
    clamp: calculateClamp({
      minWidth: viewportConfig.minWidth,
      maxWidth: viewportConfig.maxWidth,
      minSize: parseFloat(minScale[step]["$value"]),
      maxSize: parseFloat(maxScale[step]["$value"]),
    }),
  }));
}

// Set line height body
const lineHeightBody = calculateLineHeight(
  typeConfig.lineHeightMinScale,
  typeConfig.lineHeightBodyMaxScale,
);
// Set line height heading
const lineHeightHeading = calculateLineHeight(
  typeConfig.lineHeightMinScale,
  typeConfig.lineHeightHeadingMaxScale,
);

let css = ":root {\n";

// Space sizes
css += "  /* Space sizes */\n";
for (const size of spaceScale.sizes) {
  css += `  --space-${size.label}: ${size.clamp};\n`;
}
css += "\n";
// One-up pairs
css += "  /* Space one-up pairs */\n";
for (const pair of spaceScale.oneUpPairs) {
  css += `  --space-${pair.label}: ${pair.clamp};\n`;
}
css += "\n";
// Custom pairs
css += "  /* Space custom pairs */\n";
for (const pair of spaceScale.customPairs) {
  css += `  --space-${pair.label}: ${pair.clamp};\n`;
}
css += "\n";
// Font sizes
css += "  /* Font sizes */\n";
for (const size of fontSizes) {
  css += `  --step-${size.label}: ${size.clamp};\n`;
}
css += "\n";
// Line height body
css += "  /* Line heights - body */\n";
for (const lineHeight of lineHeightBody) {
  css += `  --lh-body-step-${lineHeight.label}: ${lineHeight.clamp};\n`;
}
css += "\n";
// Line height heading
css += "  /* Line heights - heading */\n";
for (const lineHeight of lineHeightHeading) {
  css += `  --lh-heading-step-${lineHeight.label}: ${lineHeight.clamp};\n`;
}
css += "}\n";

// Write to file
const outputPath = join(__dirname, "tokens.css");
appendFileSync(outputPath, css);
console.log(`Appended fluid tokens to ${outputPath}`);
