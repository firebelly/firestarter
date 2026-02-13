import type { FluidToken } from "./token-data";

interface SpaceSizesProps {
  sizes: FluidToken[];
}

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  td: {
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #eee",
    verticalAlign: "middle" as const,
  },
  label: {
    fontSize: "13px",
    fontFamily: "monospace",
    color: "#333",
    whiteSpace: "nowrap" as const,
  },
  range: {
    fontSize: "11px",
    fontFamily: "monospace",
    color: "#666",
  },
  bar: {
    height: "16px",
    borderRadius: "3px",
    backgroundColor: "hsl(234 79% 64%)",
  },
};

export function SpaceSizes({ sizes }: SpaceSizesProps) {
  return (
    <table style={styles.table}>
      <tbody>
        {sizes.map((size) => (
          <tr key={size.cssVar}>
            <td style={{ ...styles.td, width: "160px" }}>
              <div style={styles.label}>{size.cssVar}</div>
              <div style={styles.range}>
                {size.minPx}px &ndash; {size.maxPx}px
              </div>
            </td>
            <td style={styles.td}>
              <div
                style={{
                  ...styles.bar,
                  width: `var(${size.cssVar})`,
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
