import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

/**
 * Abstract base class for making HTTP requests using axios
 * @abstract
 */
export abstract class ApiService {
	protected baseURL: string;
	public axios_instance: AxiosInstance;

	/**
	 * Creates an instance of APIService
	 * @param {string} baseURL - The base URL for all HTTP requests
	 */
	constructor(baseURL: string | AxiosInstance) {
		if (typeof baseURL === "string") {
			this.baseURL = baseURL;
			this.axios_instance = axios.create({
				baseURL,
				withCredentials: true,
			});
		} else {
			this.baseURL = baseURL.defaults.baseURL || "";
			this.axios_instance = baseURL;
		}
	}

	/**
	 * Makes a GET request to the specified URL
	 * @param {string} url - The endpoint URL
	 * @param {object} [params={}] - URL parameters
	 * @param {AxiosRequestConfig} [config={}] - Additional axios configuration
	 * @returns {Promise} Axios response promise
	 */
	get(url: string, params = {}, config: AxiosRequestConfig = {}) {
		return this.axios_instance.get(url, {
			...params,
			...config,
		});
	}

	/**
	 * Makes a POST request to the specified URL
	 * @param {string} url - The endpoint URL
	 * @param {object} [data={}] - Request body data
	 * @param {AxiosRequestConfig} [config={}] - Additional axios configuration
	 * @returns {Promise} Axios response promise
	 */
	post(url: string, data = {}, config: AxiosRequestConfig = {}) {
		return this.axios_instance.post(url, data, config);
	}

	/**
	 * Makes a PUT request to the specified URL
	 * @param {string} url - The endpoint URL
	 * @param {object} [data={}] - Request body data
	 * @param {AxiosRequestConfig} [config={}] - Additional axios configuration
	 * @returns {Promise} Axios response promise
	 */
	put(url: string, data = {}, config: AxiosRequestConfig = {}) {
		return this.axios_instance.put(url, data, config);
	}

	/**
	 * Makes a PATCH request to the specified URL
	 * @param {string} url - The endpoint URL
	 * @param {object} [data={}] - Request body data
	 * @param {AxiosRequestConfig} [config={}] - Additional axios configuration
	 * @returns {Promise} Axios response promise
	 */
	patch(url: string, data = {}, config: AxiosRequestConfig = {}) {
		return this.axios_instance.patch(url, data, config);
	}

	/**
	 * Makes a DELETE request to the specified URL
	 * @param {string} url - The endpoint URL
	 * @param {any} [data] - Request body data
	 * @param {AxiosRequestConfig} [config={}] - Additional axios configuration
	 * @returns {Promise} Axios response promise
	 */
	delete(url: string, data?: any, config: AxiosRequestConfig = {}) {
		return this.axios_instance.delete(url, { data, ...config });
	}

	/**
	 * Makes a custom request with the provided configuration
	 * @param {object} [config={}] - Axios request configuration
	 * @returns {Promise} Axios response promise
	 */
	request(config = {}) {
		return this.axios_instance(config);
	}
}
