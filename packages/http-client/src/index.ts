import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class HttpClient {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string = '') {
        this.axiosInstance = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // Send cookies for authentication
        });

        // Add response interceptor for universal error handling if needed
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    public setHeader(key: string, value: string): void {
        this.axiosInstance.defaults.headers.common[key] = value;
    }

    public setBaseURL(url: string): void {
        this.axiosInstance.defaults.baseURL = url;
    }

    public getInstance(): AxiosInstance {
        return this.axiosInstance;
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
        return response.data;
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
        return response.data;
    }

    public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
        return response.data;
    }

    public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
        return response.data;
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
        return response.data;
    }
}

// Export a default instance
// Users can create their own instances if they need different base URLs
const http = new HttpClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444/api/v1');

export default http;
