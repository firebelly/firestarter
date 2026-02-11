import {
  calculateClamp,
  calculateSpaceScale,
  calculateTypeScale,
} from "utopia-core";

/** Minimal Terrazzo plugin types (avoids importing transitive @terrazzo/parser) */
interface SetTransformParams {
  format: string;
  localID?: string;
  value: string | Record<string, string>;
  mode?: string;
}

interface TransformHookOptions {
  tokens: Record<string, TokenLike>;
  setTransform(id: string, params: SetTransformParams): void;
}

interface TokenLike {
  $value: unknown;
  mode: Record<string, { $value: unknown }>;
}

interface Plugin {
  name: string;
  enforce?: "pre" | "post";
  transform?(options: TransformHookOptions): Promise<void>;
}

export default function fluidTokensPlugin(): Plugin {
  return {
    name: "terrazzo-plugin-fluid",
    enforce: "post",
    async transform({ tokens, setTransform }) {
      // Helper to read string token values (Utopia config tokens are $type: "string")
      const str = (id: string): string => tokens[id].$value as string;

      // Extract numeric value from normalized dimension tokens ({ value: number, unit: string })
      const dimValue = (val: unknown): number =>
        (val as { value: number }).value;

      // 1. Read Utopia config from tokens map
      const minWidth = parseInt(str("Utopia.Viewport.Min width"), 10);
      const maxWidth = parseInt(str("Utopia.Viewport.Max width"), 10);

      // Space config
      const spaceMinSize = parseInt(str("Utopia.Space.Min size"), 10);
      const spaceMaxSize = parseInt(str("Utopia.Space.Max size"), 10);
      const positiveSpaces = str("Utopia.Space.Positive spaces")
        .split(",")
        .map((s) => parseFloat(s.trim()));
      const negativeSpaces = str("Utopia.Space.Negative spaces")
        .split(",")
        .map((s) => parseFloat(s.trim()));
      const customSpaces = str("Utopia.Space.Custom spaces")
        .split(",")
        .map((s) => s.trim().toLowerCase());

      // Type config
      const typeMinSize = parseInt(str("Utopia.Type.Min size"), 10);
      const typeMaxSize = parseInt(str("Utopia.Type.Max size"), 10);
      const minScale = parseFloat(str("Utopia.Type.Min scale"));
      const maxScale = parseFloat(str("Utopia.Type.Max scale"));
      const positiveSteps = parseInt(str("Utopia.Type.Positive steps"), 10);
      const negativeSteps = parseInt(str("Utopia.Type.Negative steps"), 10);

      // 2. Compute space scale
      const spaceScale = calculateSpaceScale({
        minWidth,
        maxWidth,
        minSize: spaceMinSize,
        maxSize: spaceMaxSize,
        positiveSteps: positiveSpaces,
        negativeSteps: negativeSpaces,
        customSizes: customSpaces,
      });

      for (const size of spaceScale.sizes) {
        const tokenId = `Fluid tokens.Space size.${size.label.toUpperCase()}`;
        setTransform(tokenId, { format: "css", value: size.clamp });
      }

      for (const pair of spaceScale.oneUpPairs) {
        const parts = pair.label.split("-");
        const tokenLabel = parts.map((p) => p.toUpperCase()).join("\u2014");
        const tokenId = `Fluid tokens.Space size pairs.${tokenLabel}`;
        setTransform(tokenId, { format: "css", value: pair.clamp });
      }

      for (const pair of spaceScale.customPairs) {
        const parts = pair.label.split("-");
        const tokenLabel = parts.map((p) => p.toUpperCase()).join("\u2014");
        const tokenId = `Fluid tokens.Space size pairs.Custom pairs.${tokenLabel}`;
        setTransform(tokenId, { format: "css", value: pair.clamp });
      }

      // 3. Compute type scale
      const typeScale = calculateTypeScale({
        minWidth,
        maxWidth,
        minFontSize: typeMinSize,
        maxFontSize: typeMaxSize,
        minTypeScale: minScale,
        maxTypeScale: maxScale,
        positiveSteps,
        negativeSteps,
      });

      for (const step of typeScale) {
        const tokenId = `Fluid tokens.Font size.Step ${step.step}`;
        setTransform(tokenId, { format: "css", value: step.clamp });
      }

      // 4. Compute line heights from Min/Max mode values
      for (const [id, token] of Object.entries(tokens)) {
        if (
          !id.startsWith("Fluid tokens.Line height body.") &&
          !id.startsWith("Fluid tokens.Line height heading.")
        ) {
          continue;
        }
        const minSize = dimValue(token.mode["Min"].$value);
        const maxSize = dimValue(token.mode["Max"].$value);
        const clamp = calculateClamp({ minWidth, maxWidth, minSize, maxSize });
        setTransform(id, { format: "css", value: clamp });
      }
    },
  };
}
