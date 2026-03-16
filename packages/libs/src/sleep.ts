/**
 * sleep for a given duration
 * @param duration in seconds eg 2
 * @returns
 */
export function sleep(duration: number = 2) {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve();
		}, duration * 1000);
	});
}
