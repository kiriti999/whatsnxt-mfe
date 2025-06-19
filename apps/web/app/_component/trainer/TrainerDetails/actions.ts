"use server";
import { serverFetcher } from "../../../../fetcher/serverFetcher";

const BASEURL = process.env.BFF_HOST_COURSE_API as string;

export async function updateContactedStudents(trainerId: string, studentId: string) {
    try {
        const response = await serverFetcher(BASEURL, `/courses/trainer/update-contacted-students/${trainerId}`, { method: 'POST', body: { studentId } })
        console.log(response, 'response')
    } catch (err) {
        console.error('Error updating contacted filed with query:', err);
        throw err;
    }
}
