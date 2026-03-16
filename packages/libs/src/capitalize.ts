/**
 * Capitalizes the first letter of a string or the first letter of every word
 * Usage examples:
 * capitalize('hello world') // "Hello world"
 * capitalize('hello world', true) // "Hello World"
 * capitalize('JOHN DOE') // "John doe"
 * capitalize('JOHN DOE', true) // "John Doe"
 * capitalize('') // ""
 * capitalize('a') // "A"
 * @param str - The string to capitalize
 * @param everyWord - If true, capitalizes the first letter of every word (title case)
 * @returns The capitalized string
 */
export function capitalize(str: string, everyWord: boolean = false): string {
	if (!str || typeof str !== "string") {
		return "";
	}

	if (everyWord) {
		// Capitalize first letter of every word (title case)
		return str
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(" ");
	} else {
		// Capitalize only the first letter of the entire string
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	}
}
