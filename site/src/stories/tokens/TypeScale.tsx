import type { FluidToken } from "./token-data";

interface TypeScaleProps {
  steps: FluidToken[];
}

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  td: {
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #eee",
    verticalAlign: "baseline" as const,
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
};

export function TypeScale({ steps }: TypeScaleProps) {
  return (
    <table style={styles.table}>
      <tbody>
        {steps.map((step) => (
          <tr key={step.cssVar}>
            <td style={styles.td}>
              <div style={styles.label}>{step.cssVar}</div>
              <div style={styles.range}>
                {step.minPx}px &ndash; {step.maxPx}px
              </div>
            </td>
            <td style={styles.td}>
              <div style={{ fontSize: `var(${step.cssVar})`, lineHeight: 1.2 }}>
                The quick brown fox
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
