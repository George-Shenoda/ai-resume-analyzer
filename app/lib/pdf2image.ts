import type * as PDFJS from "pdfjs-dist";

export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: typeof PDFJS | null = null;
let loadPromise: Promise<typeof PDFJS> | null = null;

async function loadPdfJs(): Promise<typeof PDFJS> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
        // Set the worker source to use local file
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        pdfjsLib = lib;
        return lib;
    });

    return loadPromise;
}

export async function convertPdfToImage(
    file: File,
): Promise<PdfConversionResult> {
    try {
        const lib = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

        // Choose a scale that gives good resolution but not enormous memory usage.
        // You already used 4 — feel free to adjust down (e.g. 2) if memory is a concern.
        const scale = 4;

        const pageCanvases: HTMLCanvasElement[] = [];

        // Render every page into its own temporary canvas
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            // Use integer sizes to avoid fractional pixel issues
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);

            if (context) {
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = "high";
            }

            // Render the page into the temporary canvas
            await page.render({ canvasContext: context!, viewport }).promise;

            pageCanvases.push(canvas);
        }

        if (pageCanvases.length === 0) {
            return {
                imageUrl: "",
                file: null,
                error: "PDF has no pages",
            };
        }

        // Compute final canvas size: width = max page width, height = sum of page heights
        const finalWidth = pageCanvases.reduce(
            (max, c) => Math.max(max, c.width),
            0,
        );
        const finalHeight = pageCanvases.reduce((sum, c) => sum + c.height, 0);

        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = finalWidth;
        finalCanvas.height = finalHeight;

        const finalCtx = finalCanvas.getContext("2d");
        if (!finalCtx) {
            return {
                imageUrl: "",
                file: null,
                error: "Unable to obtain 2D context for final canvas",
            };
        }

        // Draw each page canvas onto the final canvas stacked vertically
        let yOffset = 0;
        for (const c of pageCanvases) {
            // Draw at x=0, y=current offset. If a page is narrower than finalWidth,
            // it will be left-aligned. To center, use (finalWidth - c.width) / 2 as x.
            finalCtx.drawImage(c, 0, yOffset);
            yOffset += c.height;
        }

        // Convert the final canvas to a blob and File (PNG)
        return await new Promise((resolve) => {
            finalCanvas.toBlob(
                (blob) => {
                    if (blob) {
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File(
                            [blob],
                            `${originalName}.png`,
                            {
                                type: "image/png",
                            },
                        );

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob",
                        });
                    }
                },
                "image/png",
                1.0,
            );
        });
    } catch (err) {
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err}`,
        };
    }
}
