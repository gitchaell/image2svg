import ImageTracer from "imagetracerjs";

// Helper function for box blur
function boxBlur(
	imageData: ImageData,
	width: number,
	height: number,
	radius: number,
) {
	if (radius < 1) return;

	const pixels = imageData.data;
	const len = pixels.length;
	const side = radius * 2 + 1;
	const range = side * side;
	// Use a Float32Array to avoid overflow during accumulation
	const temp = new Float32Array(len);

	// Horizontal pass
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let r = 0;
			let g = 0;
			let b = 0;
			let a = 0;
			let count = 0;

			for (let i = -radius; i <= radius; i++) {
				const nx = Math.min(Math.max(x + i, 0), width - 1);
				const idx = (y * width + nx) * 4;
				r += pixels[idx];
				g += pixels[idx + 1];
				b += pixels[idx + 2];
				a += pixels[idx + 3];
				count++;
			}

			const idx = (y * width + x) * 4;
			temp[idx] = r / count;
			temp[idx + 1] = g / count;
			temp[idx + 2] = b / count;
			temp[idx + 3] = a / count;
		}
	}

	// Vertical pass
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			let r = 0;
			let g = 0;
			let b = 0;
			let a = 0;
			let count = 0;

			for (let i = -radius; i <= radius; i++) {
				const ny = Math.min(Math.max(y + i, 0), height - 1);
				const idx = (ny * width + x) * 4;
				r += temp[idx];
				g += temp[idx + 1];
				b += temp[idx + 2];
				a += temp[idx + 3];
				count++;
			}

			const idx = (y * width + x) * 4;
			pixels[idx] = Math.round(r / count);
			pixels[idx + 1] = Math.round(g / count);
			pixels[idx + 2] = Math.round(b / count);
			pixels[idx + 3] = Math.round(a / count);
		}
	}
}

// Simple color quantization (posterization)
function quantize(imageData: ImageData, levels: number) {
	if (levels <= 0) return;
	// If levels is e.g. 4, we want values 0, 64, 128, 192, 255 roughly?
	// The step size is 255 / levels.
	// Actually, levels usually means "colors per channel".
	// If levels=0, no quantization.
	const step = 255 / levels;
	const data = imageData.data;
	for (let i = 0; i < data.length; i += 4) {
		data[i] = Math.floor(data[i] / step) * step;
		data[i + 1] = Math.floor(data[i + 1] / step) * step;
		data[i + 2] = Math.floor(data[i + 2] / step) * step;
		// alpha unchanged
	}
}

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

		// Preprocessing
		if (options.preprocessBlur && options.preprocessBlur > 0) {
			boxBlur(imageData, width, height, options.preprocessBlur);
		}

		if (options.preprocessQuantize && options.preprocessQuantize > 0) {
			// Interpret quantize as "number of levels per channel" or similar factor
			// Let's use it as a divisor for simplicity or mapped levels
			// e.g. if quantize is 4, we have 4 levels per channel.
			quantize(imageData, options.preprocessQuantize);
		}

		// Process
		const svgString = ImageTracer.imagedataToSVG(imageData, options);

		self.postMessage({ id, type: "success", svg: svgString });
	} catch (error) {
		console.error("Vectorization error:", error);
		self.postMessage({ id, type: "error", error: (error as Error).message });
	}
};
