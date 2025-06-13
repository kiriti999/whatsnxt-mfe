// applyActions.ts

import { serverFetcher } from './serverFetcher';

const BASEURL = process.env.BFF_HOST_API as string;

// Function to set application to pending
export const fetchTrainerProfile = async (userId?: string) => {
    try {
        const url = userId ? `/profile?userId=${userId}` : `/profile`
        const response = await fetch(url); // Automatically GET
        return response;
    } catch (error) {
        console.error('applyActions:: Error fetching trainer profile with query:', error);
        throw error;
    }
};

export const fetchTrainerDetails = async (trainerId: string) => {
    try {
        const response = await serverFetcher(BASEURL, `/courses/trainer/get-details/${trainerId}`); // Automatically GET
        return response;
    } catch (error) {
        console.error('applyActions:: Error fetching trainer details with query:', error);
        throw error;
    }
};
