import type { FluidToken } from "./token-data";
import { useTokenStyles } from "./useTokenStyles";

interface FluidScaleProps {
  tokens: FluidToken[];
  fontSize?: string;
}

export function FluidScale({ tokens, fontSize }: FluidScaleProps) {
  const { table, td, label, secondary } = useTokenStyles();

  return (
    <table style={table}>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.cssVar}>
            <td style={td}>
              <div style={label}>{token.cssVar}</div>
              <div style={secondary}>
                {token.minPx}px &ndash; {token.maxPx}px
              </div>
            </td>
            <td style={td}>
              <div
                style={
                  fontSize
                    ? {
                        fontSize,
                        lineHeight: `var(${token.cssVar})`,
                      }
                    : {
                        fontSize: `var(${token.cssVar})`,
                        lineHeight: 1.2,
                      }
                }
              >
                {fontSize ? (
                  <>
                    The quick brown fox jumps over the lazy dog.
                    <br />
                    Pack my box with five dozen liquor jugs.
                  </>
                ) : (
                  "The quick brown fox"
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
