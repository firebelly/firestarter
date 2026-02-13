import type { FontToken } from "./token-data";
import { useTokenStyles } from "./useTokenStyles";

interface FontSpecimenProps {
  tokens: FontToken[];
  property: "fontFamily" | "fontWeight";
}

export function FontSpecimen({ tokens, property }: FontSpecimenProps) {
  const { table, td, label, secondary } = useTokenStyles();

  return (
    <table style={table}>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.cssVar}>
            <td style={td}>
              <div style={label}>{token.label}</div>
              <div style={secondary}>{token.value}</div>
            </td>
            <td style={td}>
              <div
                style={{
                  fontSize: "24px",
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
