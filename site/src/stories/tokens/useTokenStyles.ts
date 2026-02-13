import { useMemo } from "react";
import { useTheme } from "storybook/theming";

export function useTokenStyles() {
  const theme = useTheme();

  const styles = useMemo(
    () => ({
      table: {
        width: "100%",
        borderCollapse: "collapse" as const,
      },
      td: {
        padding: "0.75rem 1rem",
        verticalAlign: "middle",
        borderBottom: `1px solid ${theme.appBorderColor}`,
      },
      label: {
        fontSize: "13px",
        fontFamily: theme.fontCode,
        color: theme.textColor,
        whiteSpace: "nowrap" as const,
      },
      secondary: {
        fontSize: "11px",
        fontFamily: theme.fontCode,
        color: theme.textMutedColor,
      },
    }),
    [
      theme.appBorderColor,
      theme.fontCode,
      theme.textColor,
      theme.textMutedColor,
    ],
  );

  return { theme, ...styles };
}
