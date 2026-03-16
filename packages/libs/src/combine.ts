/**
 * Combines two arrays of objects, adding only items from `inserts` that don't already exist in `original`,
 * based on a shared key.
 *
 * @param key - The unique property to compare objects by.
 * @param current - The original array of objects.
 * @param inserts - The array of objects to insert.
 * @returns A new array containing original items and non-duplicate inserts.
 */
export function combine<T extends Record<string, any>>(
	key: keyof T,
	current: T[],
	inserts: T[]
) {
	const exists = current.map((k) => k[key]);
	const picked = inserts.filter((a) => !exists.includes(a[key]));
	return [...current, ...picked];
}
