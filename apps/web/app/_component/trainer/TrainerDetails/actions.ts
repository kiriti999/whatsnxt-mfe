"use server";
import { serverFetcher } from "../../../../fetcher/serverFetcher";

export async function updateContactedStudents(trainerId: string, studentId: string) {
    try {
        const response = await fetch(`/courses/trainer/update-contacted-students/${trainerId}`, { method: 'POST', body: { studentId } })
        console.log(response, 'response')
    } catch (err) {
        console.error('Error updating contacted filed with query:', err);
        throw err;
    }
}
