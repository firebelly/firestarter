import { calculateClamp } from "utopia-core";

export default function fluidTokensPlugin() {
  return {
    name: "terrazzo-plugin-fluid",
    // enforce: "post" ensures this runs after Terrazzo resolves
    // token references and modes to concrete values
    enforce: "post",
    async transform({ tokens, setTransform }) {
      const px = (val) => val.value;
      const minWidth = parseInt(tokens["Utopia.Viewport.Min width"].$value, 10);
      const maxWidth = parseInt(tokens["Utopia.Viewport.Max width"].$value, 10);

      for (const [id, token] of Object.entries(tokens)) {
        if (
          !id.startsWith("Fluid tokens.") ||
          id.startsWith("Fluid tokens.Grid.")
        )
          continue;

        let minSize, maxSize;

        if (id.startsWith("Fluid tokens.Space size pairs.")) {
          // Pair tokens: use "from" token's Min mode, "to" token's Max mode
          const label = id.split(".").pop();
          const [fromLabel, toLabel] = label.split("\u2014");
          minSize = px(
            tokens[`Fluid tokens.Space size.${fromLabel}`].mode["Min"].$value,
          );
          maxSize = px(
            tokens[`Fluid tokens.Space size.${toLabel}`].mode["Max"].$value,
          );
        } else {
          minSize = px(token.mode["Min"].$value);
          maxSize = px(token.mode["Max"].$value);
        }

        const clamp = calculateClamp({ minWidth, maxWidth, minSize, maxSize });
        setTransform(id, { format: "css", value: clamp });
      }
    },
  };
}
