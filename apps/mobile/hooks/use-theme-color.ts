/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { COLOR_THEMES } from "@/constants/themes/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRootStore } from "@/stores";

export function useThemeColor(
  colorName: keyof typeof COLOR_THEMES.light &
    keyof typeof COLOR_THEMES.dark,
  overrides?: { light?: string; dark?: string },
) {
  const store = useRootStore((state) => state);
  const scheme = useColorScheme() ?? "light";
  const theme = store.data.theme === "system" ? scheme : store.data.mode;
  const colorFromOverrides =
    overrides !== undefined ? overrides[theme] : undefined;

  if (colorFromOverrides) {
    return colorFromOverrides;
  } else {
    return COLOR_THEMES[theme][colorName];
  }
}
