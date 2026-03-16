/**
 * Turns blob into base64
 * @param data
 * @returns base64 string
 */
export async function blob_reader(data: Blob): Promise<string> {
	return await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = async () => {
			const base64data = (reader.result as any).split(",")[1];
			if (base64data) resolve(base64data);
			else reject(new Error("error getting file"));
		};
		reader.onerror = (e) => reject(e);
		reader.readAsDataURL(data);
	});
}
