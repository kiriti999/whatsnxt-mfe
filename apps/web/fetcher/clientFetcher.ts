import { axiosApi } from '../utils/Utils'

export const clientFetcher = async (URL: string) => {
    const response = await fetch(`${axiosApi.baseUrl}/${axiosApi.version}` + URL);
    if (!response.ok) {
        throw response;
    }
    return response.json();
};