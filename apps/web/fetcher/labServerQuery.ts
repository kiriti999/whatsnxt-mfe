import { serverFetcher } from './serverFetcher';
import { Lab } from '../types/lab';

const BASEURL = process.env.BFF_HOST_LAB_API as string;

export const fetchLabs = async (): Promise<Lab[]> => {
    const response = await serverFetcher(BASEURL, '/labs');
    return response?.data || [];
};

export const fetchLabById = async (id: string): Promise<Lab | null> => {
    const response = await serverFetcher(BASEURL, `/labs/${id}`);
    return response?.data || null;
};

export const createLab = async (labData: Lab): Promise<Lab> => {
    const response = await serverFetcher(BASEURL, '/labs', {
        method: 'POST',
        body: labData
    });
    return response?.data;
};

export const updateLab = async (id: string, labData: Lab): Promise<Lab> => {
    const response = await serverFetcher(BASEURL, `/labs/${id}`, {
        method: 'PUT',
        body: labData
    });
    return response?.data;
};
