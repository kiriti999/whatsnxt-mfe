import { useEffect } from "react";

/**
 * Warns when leaving the page with unsaved changes (browser tab close / refresh).
 * App Router has no `router.events`; do not use `next/router` here.
 */
export function useSaved(unsaved: boolean) {
	useEffect(() => {
		if (!unsaved) {
			return;
		}

		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [unsaved]);
}
