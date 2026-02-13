import { useMemo } from "react";

import type { ColorToken } from "./token-data";
import { useTokenStyles } from "./useTokenStyles";

interface ColorSwatchesProps {
  tokens: ColorToken[];
}

export function ColorSwatches({ tokens }: ColorSwatchesProps) {
  const { theme, label, secondary } = useTokenStyles();

  const styles = useMemo(
    () => ({
      grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "1rem",
      },
      swatch: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "0.25rem",
      },
      color: {
        width: "100%",
        aspectRatio: "1",
        borderRadius: "6px",
        border: `1px solid ${theme.appBorderColor}`,
      },
    }),
    [theme.appBorderColor],
  );

  return (
    <div style={styles.grid}>
      {tokens.map((token) => (
        <div key={token.cssVar} style={styles.swatch}>
          <div
            style={{
              ...styles.color,
              backgroundColor: `var(${token.cssVar})`,
            }}
          />
          <span style={label}>{token.cssVar}</span>
          <span style={secondary}>{token.hsl}</span>
        </div>
      ))}
    </div>
  );
}
