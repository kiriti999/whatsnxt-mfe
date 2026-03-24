import { Suspense } from "react";
import { MantineLoader } from "@whatsnxt/core-ui";
import { SystemDesignForm } from "../../../components/SystemDesign/SystemDesignForm";

export default function SystemDesignPage() {
    return (
        <Suspense fallback={<MantineLoader />}>
            <SystemDesignForm />
        </Suspense>
    );
}
