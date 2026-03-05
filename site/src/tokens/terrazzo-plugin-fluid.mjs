import { calculateClamp } from "utopia-core";

export function parseViewportConfig(tokens) {
  const minWidth = parseInt(tokens["Utopia.Viewport.Min width"].$value, 10);
  const maxWidth = parseInt(tokens["Utopia.Viewport.Max width"].$value, 10);
  return { minWidth, maxWidth };
}

export function splitPairLabel(label) {
  return label.split("\u2014");
}

export function resolveMinMax(id, token, tokens) {
  const px = (val) => val.value;

  if (id.startsWith("Fluid tokens.Space size pairs.")) {
    const label = id.split(".").pop();
    const [fromLabel, toLabel] = splitPairLabel(label);
    const minSize = px(
      tokens[`Fluid tokens.Space size.${fromLabel}`].mode["Min"].$value,
    );
    const maxSize = px(
      tokens[`Fluid tokens.Space size.${toLabel}`].mode["Max"].$value,
    );
    return { minSize, maxSize };
  }

  const minSize = px(token.mode["Min"].$value);
  const maxSize = px(token.mode["Max"].$value);
  return { minSize, maxSize };
}

export default function fluidTokensPlugin() {
  return {
    name: "terrazzo-plugin-fluid",
    // enforce: "post" ensures this runs after Terrazzo resolves
    // token references and modes to concrete values
    enforce: "post",
    async transform({ tokens, setTransform }) {
      const { minWidth, maxWidth } = parseViewportConfig(tokens);

      for (const [id, token] of Object.entries(tokens)) {
        if (
          !id.startsWith("Fluid tokens.") ||
          id.startsWith("Fluid tokens.Grid.")
        )
          continue;

        const { minSize, maxSize } = resolveMinMax(id, token, tokens);
        const clamp = calculateClamp({ minWidth, maxWidth, minSize, maxSize });
        setTransform(id, { format: "css", value: clamp });
      }
    },
  };
}
