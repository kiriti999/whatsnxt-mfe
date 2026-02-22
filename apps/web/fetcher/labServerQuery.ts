import type { Lab } from "../types/lab";
import { serverFetcher } from "./serverFetcher";

const BASEURL = process.env.BFF_HOST_LAB_API as string;

export const fetchLabs = async (): Promise<Lab[]> => {
    const response = await serverFetcher(BASEURL, "/labs");
    return response?.data || [];
};

export const fetchLabById = async (id: string): Promise<Lab | null> => {
    const response = await serverFetcher(BASEURL, `/labs/${id}`);
    return response?.data || null;
};

export const createLab = async (labData: Lab): Promise<Lab> => {
    const response = await serverFetcher(BASEURL, "/labs", {
        method: "POST",
        body: labData,
    });
    return response?.data;
};

export const updateLab = async (id: string, labData: Lab): Promise<Lab> => {
    const response = await serverFetcher(BASEURL, `/labs/${id}`, {
        method: "PUT",
        body: labData,
    });
    return response?.data;
};

export const deleteLabPage = async (
    labId: string,
    pageId: string,
): Promise<Lab> => {
    const response = await serverFetcher(
        BASEURL,
        `/labs/${labId}/pages/${pageId}`,
        {
            method: "DELETE",
        },
    );
    return response?.data;
};

export const fetchPublishedLabs = async (perPage = 6): Promise<Lab[]> => {
    // BFF_HOST_LAB_API ends with /lab — strip it to get the api/v1 base
    const base = (process.env.BFF_HOST_LAB_API as string)?.replace(/\/lab$/, "") ?? "";
    const response = await serverFetcher(
        base,
        `/labs?status=published&perPage=${perPage}`,
    );
    return response?.data || [];
};
