import type { FluidToken } from "./token-data";

interface LineHeightScaleProps {
  steps: FluidToken[];
  fontSizeSteps: Array<{ cssVar: string }>;
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

export function LineHeightScale({
  steps,
  fontSizeSteps,
}: LineHeightScaleProps) {
  return (
    <table style={styles.table}>
      <tbody>
        {steps.map((step, i) => (
          <tr key={step.cssVar}>
            <td style={styles.td}>
              <div style={styles.label}>{step.cssVar}</div>
              <div style={styles.range}>
                {step.minPx}px &ndash; {step.maxPx}px
              </div>
            </td>
            <td style={styles.td}>
              <div
                style={{
                  fontSize: `var(${fontSizeSteps[i].cssVar})`,
                  lineHeight: `var(${step.cssVar})`,
                }}
              >
                The quick brown fox jumps over the lazy dog. Pack my box with
                five dozen liquor jugs.
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
