import { serverFetcher } from './serverFetcher';
import { Lab } from '../types/lab';

const BASEURL = process.env.BFF_HOST_LAB_API as string;

export const fetchLabs = async (): Promise<Lab[]> => {
    const response = await serverFetcher(BASEURL, '/labs');
    return response?.data || [];
};

export const createLab = async (labData: Lab): Promise<Lab> => {
    const response = await serverFetcher(BASEURL, '/labs', {
        method: 'POST',
        body: labData
    });
    return response?.data;
};
