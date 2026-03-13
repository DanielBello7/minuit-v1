/**
 * Compares two currency codes for equality after normalizing (lowercase, trim, and strip spaces, hyphens, underscores).
 * @param ccy_1 - First currency code (e.g. "USD", " usd ", "US-D")
 * @param ccy_2 - Second currency code
 * @returns `true` if both codes are the same when normalized, otherwise `false`
 */
export function is_same_ccy(ccy_1: string, ccy_2: string) {
  const formatted_1 = ccy_1
    .toLowerCase()
    .trim()
    .replaceAll(' ', '')
    .replaceAll('-', '')
    .replaceAll('_', '');
  const formatted_2 = ccy_2
    .toLowerCase()
    .trim()
    .replaceAll(' ', '')
    .replaceAll('-', '')
    .replaceAll('_', '');
  if (formatted_1 === formatted_2) return true;
  return false;
}
