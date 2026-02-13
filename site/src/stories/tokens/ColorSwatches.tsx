import type { ColorToken } from "./token-data";

interface ColorSwatchesProps {
  colors: ColorToken[];
}

const styles = {
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
    border: "1px solid hsl(0 0% 0% / 0.1)",
  },
  label: {
    fontSize: "13px",
    fontFamily: "monospace",
    color: "#333",
  },
  hsl: {
    fontSize: "11px",
    fontFamily: "monospace",
    color: "#666",
  },
};

export function ColorSwatches({ colors }: ColorSwatchesProps) {
  return (
    <div style={styles.grid}>
      {colors.map((token) => (
        <div key={token.cssVar} style={styles.swatch}>
          <div
            style={{
              ...styles.color,
              backgroundColor: `var(${token.cssVar})`,
            }}
          />
          <span style={styles.label}>{token.cssVar}</span>
          <span style={styles.hsl}>{token.hsl}</span>
        </div>
      ))}
    </div>
  );
}
