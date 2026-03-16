/**
 * Truncates a string to a maximum length, optionally appending an ellipsis
 * Usage examples:
 * truncate('Hello world', 8) // "Hello wo"
 * truncate('Hello world', 8, '...') // "Hello..."
 * truncate('Hi', 10) // "Hi"
 * truncate('', 5) // ""
 * @param str - The string to truncate
 * @param maxLength - Maximum length (inclusive of ellipsis when provided)
 * @param ellipsis - Optional suffix when truncated (default: none)
 * @returns The truncated string
 */
export function truncate(
	str: string,
	maxLength: number,
	ellipsis: string = ""
): string {
	if (!str || typeof str !== "string" || maxLength < 0) {
		return "";
	}
	if (str.length <= maxLength) {
		return str;
	}
	const take = maxLength - ellipsis.length;
	if (take <= 0) {
		return ellipsis.slice(0, maxLength);
	}
	return str.slice(0, take) + ellipsis;
}
