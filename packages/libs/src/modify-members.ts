import { modify } from "./modify";

/**
 * Modifies items in an array that match specified IDs, applying partial updates.
 * @param key - The unique property to identify objects by.
 * @param current - The current array of objects.
 * @param ids - The array of IDs to match and modify.
 * @param updates - Partial updates to apply to matched items.
 * @returns A new array with updates applied to matching items.
 */
export const modify_members = <
	T extends Record<string, any>,
	K extends keyof T,
>(
	key: K,
	current: T[],
	ids: T[K][],
	updates: Partial<T>
) => {
	return current.map((item) => {
		if (!ids.includes(item[key])) return item;
		return modify(item, updates);
	});
};
