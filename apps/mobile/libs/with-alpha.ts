/**
 * Applies a new alpha channel to an rgb/rgba color string.
 *
 * @param rgba - Color string in `rgb(r, g, b)` or `rgba(r, g, b, a)` format.
 * @param alpha - Opacity value to apply in the range `0` to `1`.
 * @returns A normalized `rgba(r, g, b, alpha)` string, or the original input
 * if the color format cannot be parsed.
 */
export const with_alpha = (rgba: string, alpha: number) => {
  const match = rgba.match(/rgba?\(([^)]+)\)/i);
  if (!match) return rgba;
  const [r, g, b] = match[1].split(",").map((v) => Number(v.trim()));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
