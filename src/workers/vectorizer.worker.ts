import ImageTracer from "imagetracerjs";

self.onmessage = async (e: MessageEvent) => {
	const { id, type, blob, settings } = e.data;

	if (type !== "process") return;

	try {
		if (!blob) {
			throw new Error("No image blob provided");
		}

		// Create bitmap from blob
		const bitmap = await createImageBitmap(blob);

		// Calculate dimensions (max 2560px to avoid browser crash on huge images)
		const MAX_DIMENSION = 2560;
		let width = bitmap.width;
		let height = bitmap.height;
		let scale = 1;

		if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
			scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
			width = Math.round(width * scale);
			height = Math.round(height * scale);
		}

		// Draw to OffscreenCanvas
		const canvas = new OffscreenCanvas(width, height);
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Could not get canvas context");

		ctx.drawImage(bitmap, 0, 0, width, height);

		// Get ImageData
		const imageData = ctx.getImageData(0, 0, width, height);

		// Run ImageTracer
		const options =
			typeof settings === "string" ? JSON.parse(settings) : settings;

		// Process
		const svgString = ImageTracer.imagedataToSVG(imageData, options);

		self.postMessage({ id, type: "success", svg: svgString });
	} catch (error) {
		console.error("Vectorization error:", error);
		self.postMessage({ id, type: "error", error: (error as Error).message });
	}
};
