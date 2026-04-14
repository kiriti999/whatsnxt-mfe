export async function exportToPdf(): Promise<void> {
	const previewPage = document.querySelector("[data-resume-preview]");
	const previewWrapper = previewPage?.parentElement;
	if (!previewWrapper) return;

	const printWindow = window.open("", "_blank");
	if (!printWindow) return;

	const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
		.map((el) => el.outerHTML)
		.join("\n");

	const containers = previewWrapper.querySelectorAll("[data-resume-preview]");
	const clonedPages: string[] = [];

	for (const container of containers) {
		const clone = container.cloneNode(true) as HTMLElement;

		// Force critical container styles inline so print engine respects them
		clone.style.width = "210mm";
		clone.style.height = "297mm";
		clone.style.maxHeight = "297mm";
		clone.style.overflow = "hidden";
		clone.style.position = "relative";
		clone.style.boxShadow = "none";
		clone.style.border = "none";
		clone.style.pageBreakAfter = "always";
		clone.style.pageBreakInside = "avoid";

		// Force viewport clipping with clip-path (more reliable than overflow in print)
		const viewport = clone.querySelector("[class*='pageViewport']") as HTMLElement | null;
		if (viewport) {
			viewport.style.overflow = "hidden";
			viewport.style.position = "absolute";
			viewport.style.clipPath = "inset(0)";
		}

		clonedPages.push(clone.outerHTML);
	}

	// Remove page-break-after from the last page
	const lastIdx = clonedPages.length - 1;
	if (lastIdx >= 0) {
		clonedPages[lastIdx] = clonedPages[lastIdx].replace(
			/page-break-after:\s*always;?/,
			"page-break-after: auto;",
		);
	}

	printWindow.document.write(`
		<!DOCTYPE html>
		<html>
		<head>
			<title>Resume</title>
			${styles}
			<style>
				@page { margin: 0; size: A4; }
				body { margin: 0; padding: 0; }
				@media print {
					body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
				}
				[class*='measureContainer'] {
					display: none !important;
				}
			</style>
		</head>
		<body>${clonedPages.join("\n")}</body>
		</html>
	`);
	printWindow.document.close();
	printWindow.focus();

	await new Promise<void>((resolve) => {
		printWindow.onload = () => resolve();
		setTimeout(resolve, 1000);
	});

	printWindow.print();
}
