import { MantineLoader } from "@whatsnxt/core-ui";
import React, { Suspense } from "react";
import TutorialFormContent from "../../../components/Blog/TutorialFormContent";

export default function Form() {
  return (
    <Suspense fallback={<MantineLoader />}>
      <TutorialFormContent />
    </Suspense>
  );
}
