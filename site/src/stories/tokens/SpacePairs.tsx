import type { FluidToken } from "./token-data";

interface SpacePairsProps {
  pairs: FluidToken[];
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
    backgroundColor: "hsl(248 88% 36%)",
  },
};

export function SpacePairs({ pairs }: SpacePairsProps) {
  return (
    <table style={styles.table}>
      <tbody>
        {pairs.map((pair) => (
          <tr key={pair.cssVar}>
            <td style={{ ...styles.td, width: "160px" }}>
              <div style={styles.label}>{pair.cssVar}</div>
              <div style={styles.range}>
                {pair.minPx}px &ndash; {pair.maxPx}px
              </div>
            </td>
            <td style={styles.td}>
              <div
                style={{
                  ...styles.bar,
                  width: `var(${pair.cssVar})`,
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
