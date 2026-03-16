import { AxiosError } from "axios";
import { ZodError } from "zod";

function ensure_error(err: unknown): Error {
	if (err instanceof ZodError) {
		const newError = new Error(err.issues[0]?.message ?? "Unknown error");
		return newError;
	}

	if (err instanceof AxiosError) {
		if (err.response) {
			const msg = `${err.response.data.error ?? "Error"}: ${
				err.response.data.message ?? "Unknown error"
			}`;
			return new Error(msg);
		}
	}
	if (err instanceof Error) return err;
	let stringText = "[unable to stringify thrown error]";
	try {
		stringText = JSON.stringify(err);
	} catch {}
	const error = new Error(`value thrown as is: ${stringText}`);
	return error;
}

export { ensure_error };
