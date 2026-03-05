import { describe, expect, it } from "vitest";

import {
  parseViewportConfig,
  resolveMinMax,
  splitPairLabel,
} from "../terrazzo-plugin-fluid.mjs";

describe("parseViewportConfig", () => {
  it("returns minWidth and maxWidth as numbers", () => {
    const tokens = {
      "Utopia.Viewport.Min width": { $value: "320" },
      "Utopia.Viewport.Max width": { $value: "1440" },
    };

    expect(parseViewportConfig(tokens)).toEqual({
      minWidth: 320,
      maxWidth: 1440,
    });
  });
});

describe("splitPairLabel", () => {
  it("splits on em-dash", () => {
    expect(splitPairLabel("S\u2014M")).toEqual(["S", "M"]);
  });

  it("splits multi-character labels", () => {
    expect(splitPairLabel("2XL\u20143XL")).toEqual(["2XL", "3XL"]);
  });
});

describe("resolveMinMax", () => {
  it("returns minSize and maxSize for regular tokens", () => {
    const id = "Fluid tokens.Space size.M";
    const token = {
      mode: {
        Min: { $value: { value: 16, unit: "px" } },
        Max: { $value: { value: 24, unit: "px" } },
      },
    };

    expect(resolveMinMax(id, token, {})).toEqual({
      minSize: 16,
      maxSize: 24,
    });
  });

  it("returns minSize and maxSize for pair tokens", () => {
    const id = "Fluid tokens.Space size pairs.S\u2014M";
    const token = {}; // pair tokens don't use their own modes
    const tokens = {
      "Fluid tokens.Space size.S": {
        mode: {
          Min: { $value: { value: 8, unit: "px" } },
          Max: { $value: { value: 12, unit: "px" } },
        },
      },
      "Fluid tokens.Space size.M": {
        mode: {
          Min: { $value: { value: 16, unit: "px" } },
          Max: { $value: { value: 24, unit: "px" } },
        },
      },
    };

    expect(resolveMinMax(id, token, tokens)).toEqual({
      minSize: 8,
      maxSize: 24,
    });
  });
});
