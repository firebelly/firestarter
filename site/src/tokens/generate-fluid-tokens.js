/**
 * Fluid Token Generator
 *
 * Generates fluid CSS custom properties from Figma design tokens
 * using utopia-core for space and type scale calculations.
 */

import { readFileSync, writeFileSync } from "node:fs";
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
const themeDeclarations = tokens["_theme-declarations"];

// Viewport config
const minWidth = parseInt(
  themeDeclarations.Viewport["Min width"]["$value"],
  10,
);
const maxWidth = parseInt(
  themeDeclarations.Viewport["Max width"]["$value"],
  10,
);

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

// Type config
const typeConfig = themeDeclarations["Type Boundaries"];
const typeScale = calculateTypeScale({
  minWidth,
  maxWidth,
  minFontSize: parseFloat(typeConfig["Min size"]["$value"]),
  maxFontSize: parseFloat(typeConfig["Max size"]["$value"]),
  minTypeScale: parseFloat(typeConfig["Min scale"]["$value"]),
  maxTypeScale: parseFloat(typeConfig["Max scale"]["$value"]),
  positiveSteps: parseInt(typeConfig["Positive steps"]["$value"], 10),
  negativeSteps: parseInt(typeConfig["Negative steps"]["$value"], 10),
});

// Custom space pairs
const customSpacesRaw = spaceConfig["Custom spaces"]["$value"];
if (customSpacesRaw) {
  css += "\n";
  css += "  /* Space custom pairs */\n";

  // Build a lookup from label to size object
  const sizeLookup = {};
  for (const size of spaceScale.sizes) {
    sizeLookup[size.label.toUpperCase()] = size;
  }

  const customPairs = customSpacesRaw.split(",").map((s) => s.trim());
  for (const pair of customPairs) {
    const [fromLabel, toLabel] = pair.split("-").map((s) => s.trim());
    const fromSize = sizeLookup[fromLabel.toUpperCase()];
    const toSize = sizeLookup[toLabel.toUpperCase()];

    if (fromSize && toSize) {
      const clamp = calculateClamp({
        minWidth,
        maxWidth,
        minSize: fromSize.minSize,
        maxSize: toSize.maxSize,
      });
      const label = `${fromLabel.toLowerCase()}-${toLabel.toLowerCase()}`;
      css += `  --space-${label}: ${clamp};\n`;
    }
  }
}

// Font sizes
css += "\n";
css += "  /* Font sizes */\n";
for (const step of typeScale) {
  css += `  --step-${step.step}: ${step.clamp};\n`;
}

// Line heights
const typePrimitives = tokens["type-primitives"];
const fluidTokens = tokens["_fluid-tokens"];

function parsePixelValue(token) {
  return parseFloat(token["$value"].replace("px", ""));
}

function formatStepName(key) {
  // "step 8" → "step-8", "step -1" → "step--1"
  return key.replace("step ", "step-");
}

function generateLineHeights(group, maxGroup, prefix) {
  let output = "";
  for (const key of Object.keys(group)) {
    // Map "step 8" → "Step 8", "step -1" → "Step -1"
    const primitiveKey = "Step " + key.replace("step ", "");
    const minVal = parsePixelValue(
      typePrimitives["Line height @min"][primitiveKey],
    );
    const maxVal = parsePixelValue(typePrimitives[maxGroup][primitiveKey]);
    const clamp = calculateClamp({
      minWidth,
      maxWidth,
      minSize: minVal,
      maxSize: maxVal,
    });
    output += `  --${prefix}-${formatStepName(key)}: ${clamp};\n`;
  }
  return output;
}

css += "\n";
css += "  /* Line heights - body */\n";
css += generateLineHeights(
  fluidTokens["line-height-body"],
  "Line height body @max",
  "lh-body",
);

css += "\n";
css += "  /* Line heights - heading */\n";
css += generateLineHeights(
  fluidTokens["line-height-heading"],
  "Line height heading @max",
  "lh-heading",
);

css += "}\n";

// Write to file
const outputPath = join(__dirname, "fluid-tokens.css");
writeFileSync(outputPath, css);
console.log(`Generated ${outputPath}`);
