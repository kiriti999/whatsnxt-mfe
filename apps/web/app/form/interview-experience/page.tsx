import { Suspense } from "react";
import { MantineLoader } from "@whatsnxt/core-ui";
import { InterviewExperienceForm } from "../../../components/InterviewExperience/InterviewExperienceForm";

export default function InterviewExperienceFormPage() {
    return (
        <Suspense fallback={<MantineLoader />}>
            <InterviewExperienceForm />
        </Suspense>
    );
}
