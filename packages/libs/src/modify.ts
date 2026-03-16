/**
 * Modifies an object with a set of updates.
 * @param original - The original object to modify.
 * @param updates - The updates to apply to the original object.
 * @returns The modified object.
 */
export const modify = <T extends object>(
	original: T,
	updates: Partial<T>
): T => {
	const result = { ...original };

	for (const key in updates) {
		if (updates.hasOwnProperty(key)) {
			const updateValue = updates[key];
			const originalValue = (result as any)[key];

			if (
				updateValue !== null &&
				updateValue !== undefined &&
				typeof updateValue === "object" &&
				!Array.isArray(updateValue) &&
				typeof originalValue === "object" &&
				!Array.isArray(originalValue) &&
				originalValue !== null
			) {
				// Recursively merge nested objects
				(result as any)[key] = modify(originalValue, updateValue);
			} else {
				// Replace the value
				(result as any)[key] = updateValue;
			}
		}
	}

	return result;
};
