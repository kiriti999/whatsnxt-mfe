import type { Lab } from "../types/lab";
import { serverFetcher } from "./serverFetcher";

/**
 * Lab BFF base for server-side fetches (no trailing `/labs`).
 * Prefer BFF_HOST_LAB_API when set; otherwise match the client (`NEXT_PUBLIC_BFF_HOST_LAB_API`
 * from next.config) so the homepage RSC can load labs without a separate server-only env.
 * Strip a trailing `/lab` so callers hit `/api/v1/labs` whether the env was `.../v1` or `.../v1/lab`.
 */
export function getLabServerBaseUrl(): string {
    const raw =
        process.env.BFF_HOST_LAB_API ||
        process.env.NEXT_PUBLIC_BFF_HOST_LAB_API ||
        process.env.NEXT_PUBLIC_API_URL ||
        "";
    return raw.replace(/\/lab$/, "");
}

export const fetchLabs = async (): Promise<Lab[]> => {
    const response = await serverFetcher(getLabServerBaseUrl(), "/labs");
    return response?.data || [];
};

export const fetchLabById = async (id: string): Promise<Lab | null> => {
    const response = await serverFetcher(getLabServerBaseUrl(), `/labs/${id}`);
    return response?.data || null;
};

export const createLab = async (labData: Lab): Promise<Lab> => {
    const response = await serverFetcher(getLabServerBaseUrl(), "/labs", {
        method: "POST",
        body: labData,
    });
    return response?.data;
};

export const updateLab = async (id: string, labData: Lab): Promise<Lab> => {
    const response = await serverFetcher(getLabServerBaseUrl(), `/labs/${id}`, {
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
        getLabServerBaseUrl(),
        `/labs/${labId}/pages/${pageId}`,
        {
            method: "DELETE",
        },
    );
    return response?.data;
};

export const fetchPublishedLabs = async (perPage = 6): Promise<Lab[]> => {
    const response = await serverFetcher(
        getLabServerBaseUrl(),
        `/labs?status=published&perPage=${perPage}`,
    );
    return response?.data || [];
};
