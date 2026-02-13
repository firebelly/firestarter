import type { FontToken } from "./token-data";

interface FontSpecimenProps {
  fonts: FontToken[];
  property: "fontFamily" | "fontWeight";
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
  value: {
    fontSize: "11px",
    fontFamily: "monospace",
    color: "#666",
  },
  sample: {
    fontSize: "24px",
  },
};

export function FontSpecimen({ fonts, property }: FontSpecimenProps) {
  return (
    <table style={styles.table}>
      <tbody>
        {fonts.map((token) => (
          <tr key={token.cssVar}>
            <td style={styles.td}>
              <div style={styles.label}>{token.cssVar}</div>
              <div style={styles.value}>{token.value}</div>
            </td>
            <td style={styles.td}>
              <div
                style={{
                  ...styles.sample,
                  [property]: `var(${token.cssVar})`,
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
