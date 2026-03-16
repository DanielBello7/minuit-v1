export function deduct<T, K extends keyof T>(
	key: K,
	current: T[],
	removes: T[K][]
) {
	return current.filter((k) => !removes.includes(k[key]));
}
