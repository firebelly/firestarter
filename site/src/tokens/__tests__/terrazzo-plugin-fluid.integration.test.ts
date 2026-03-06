import { readFile, rm } from "node:fs/promises";
import path from "node:path";

import { buildCmd, loadConfig } from "@terrazzo/cli";
import { Logger } from "@terrazzo/parser";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const fixturesDir = path.join(__dirname, "fixtures");
const outputPath = path.join(fixturesDir, "test-output.css");

const logger = new Logger({ level: "error" });

let css: string;

describe("fluid plugin integration", () => {
  beforeAll(async () => {
    const { config, configPath } = await loadConfig({
      cmd: "build",
      flags: { config: "./src/tokens/__tests__/fixtures/terrazzo.config.mjs" },
      logger,
    });

    await buildCmd({ config, configPath, flags: {}, logger });
    css = await readFile(outputPath, "utf-8");
  });

  afterAll(async () => {
    await rm(outputPath, { force: true });
  });

  it("generates clamp() for regular space token", () => {
    expect(css).toMatch(/--space-s:\s*clamp\(/);
  });

  it("generates clamp() for regular type token", () => {
    expect(css).toMatch(/--step-0:\s*clamp\(/);
  });

  it("generates clamp() for space pair token", () => {
    expect(css).toMatch(/--space-s-m:\s*clamp\(/);
  });

  it("excludes grid tokens", () => {
    expect(css).not.toMatch(/grid/i);
    expect(css).not.toMatch(/columns/i);
  });

  it("excludes Utopia config tokens", () => {
    expect(css).not.toMatch(/viewport/i);
    expect(css).not.toMatch(/min-width/i);
    expect(css).not.toMatch(/max-width/i);
  });

  it("is parseable CSS", () => {
    // Verify the output has the expected CSS structure
    expect(css).toMatch(/:root\s*\{/);
    expect(css).toMatch(/\}/);
    // Every custom property line should end with a semicolon
    const propertyLines = css
      .split("\n")
      .filter((line) => line.trim().startsWith("--"));
    expect(propertyLines.length).toBeGreaterThan(0);
    for (const line of propertyLines) {
      expect(line.trim()).toMatch(/;$/);
    }
  });
});
