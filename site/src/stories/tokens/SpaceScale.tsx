import { useMemo } from "react";

import type { FluidToken } from "./token-data";
import { useTokenStyles } from "./useTokenStyles";

interface SpaceScaleProps {
  tokens: FluidToken[];
}

export function SpaceScale({ tokens }: SpaceScaleProps) {
  const { theme, table, td, label, secondary } = useTokenStyles();
  const tdMiddle = { ...td, verticalAlign: "middle" as const };

  return (
    <table style={table}>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.cssVar}>
            <td style={{ ...tdMiddle, width: "160px" }}>
              <div style={label}>{token.cssVar}</div>
              <div style={secondary}>
                {token.minPx}px &ndash; {token.maxPx}px
              </div>
            </td>
            <td style={tdMiddle}>
              <div
                style={{
                  height: "16px",
                  borderRadius: "3px",
                  backgroundColor: theme.color.secondary,
                  width: `var(${token.cssVar})`,
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
