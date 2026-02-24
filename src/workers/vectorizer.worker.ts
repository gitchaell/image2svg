import ImageTracer from "imagetracerjs";

// Helper function for box blur (kept for reference or fallback)
function boxBlur(
	imageData: ImageData,
	width: number,
	height: number,
	radius: number,
) {
	if (radius < 1) return;

	const pixels = imageData.data;
	const len = pixels.length;
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

// Median filter for noise reduction (salt-and-pepper)
function medianFilter(
	imageData: ImageData,
	width: number,
	height: number,
	radius: number,
) {
	if (radius < 1) return;
	const pixels = imageData.data;
	const newPixels = new Uint8ClampedArray(pixels.length);

	// Pre-allocate arrays for sorting
	const size = (2 * radius + 1) * (2 * radius + 1);
	const rArr = new Uint8Array(size);
	const gArr = new Uint8Array(size);
	const bArr = new Uint8Array(size);
	const aArr = new Uint8Array(size);
	const mid = Math.floor(size / 2);

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let i = 0;
			for (let dy = -radius; dy <= radius; dy++) {
				for (let dx = -radius; dx <= radius; dx++) {
					const ny = Math.min(Math.max(y + dy, 0), height - 1);
					const nx = Math.min(Math.max(x + dx, 0), width - 1);
					const idx = (ny * width + nx) * 4;
					rArr[i] = pixels[idx];
					gArr[i] = pixels[idx + 1];
					bArr[i] = pixels[idx + 2];
					aArr[i] = pixels[idx + 3];
					i++;
				}
			}
			rArr.sort();
			gArr.sort();
			bArr.sort();
			aArr.sort();

			const idx = (y * width + x) * 4;
			newPixels[idx] = rArr[mid];
			newPixels[idx + 1] = gArr[mid];
			newPixels[idx + 2] = bArr[mid];
			newPixels[idx + 3] = aArr[mid];
		}
	}

	pixels.set(newPixels);
}

// K-Means Color Quantization
function kMeansQuantize(imageData: ImageData, k: number) {
	if (k < 2) return;
	const data = imageData.data;
	const pixelCount = data.length / 4;

	// 1. Initialize centroids randomly from pixels
	const centroids = [];
	for (let i = 0; i < k; i++) {
		const idx = Math.floor(Math.random() * pixelCount) * 4;
		centroids.push([data[idx], data[idx + 1], data[idx + 2]]);
	}

	// 2. Iterate (fixed iterations for speed, e.g., 5)
	const iterations = 5;
	for (let iter = 0; iter < iterations; iter++) {
		const sums = Array(k).fill(0).map(() => [0, 0, 0]);
		const counts = Array(k).fill(0);

		for (let i = 0; i < data.length; i += 4) {
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];

			// Find nearest centroid
			let minDist = Infinity;
			let nearest = 0;

			for (let j = 0; j < k; j++) {
				const dr = r - centroids[j][0];
				const dg = g - centroids[j][1];
				const db = b - centroids[j][2];
				const dist = dr * dr + dg * dg + db * db;
				if (dist < minDist) {
					minDist = dist;
					nearest = j;
				}
			}

			sums[nearest][0] += r;
			sums[nearest][1] += g;
			sums[nearest][2] += b;
			counts[nearest]++;
		}

		// Update centroids
		let diff = 0;
		for (let j = 0; j < k; j++) {
			if (counts[j] > 0) {
				const nr = sums[j][0] / counts[j];
				const ng = sums[j][1] / counts[j];
				const nb = sums[j][2] / counts[j];
				diff += Math.abs(nr - centroids[j][0]) + Math.abs(ng - centroids[j][1]) + Math.abs(nb - centroids[j][2]);
				centroids[j] = [nr, ng, nb];
			}
		}
		if (diff < 1) break; // Converged
	}

	// 3. Assign pixels to final centroids
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];

		let minDist = Infinity;
		let nearest = 0;

		for (let j = 0; j < k; j++) {
			const dr = r - centroids[j][0];
			const dg = g - centroids[j][1];
			const db = b - centroids[j][2];
			const dist = dr * dr + dg * dg + db * db;
			if (dist < minDist) {
				minDist = dist;
				nearest = j;
			}
		}

		data[i] = Math.round(centroids[nearest][0]);
		data[i + 1] = Math.round(centroids[nearest][1]);
		data[i + 2] = Math.round(centroids[nearest][2]);
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
			// Use Median Filter instead of Box Blur for better edge preservation
			// If radius is large, fallback to Box Blur or iterate?
			// Median filter is O(r^2), so for large r it's slow.
			// Limit r to 5 max for Median, otherwise use Box.
			if (options.preprocessBlur <= 5) {
				medianFilter(imageData, width, height, options.preprocessBlur);
			} else {
				boxBlur(imageData, width, height, options.preprocessBlur);
			}
		}

		if (options.preprocessQuantize && options.preprocessQuantize > 0) {
			// Use K-Means with K = preprocessQuantize (if > 1)
			// If 1, ignore? If > 16 (slider max is 16), clip.
			const k = Math.min(Math.max(2, Math.round(options.preprocessQuantize)), 32);
			kMeansQuantize(imageData, k);
		}

		// Process
		const svgString = ImageTracer.imagedataToSVG(imageData, options);

		self.postMessage({ id, type: "success", svg: svgString });
	} catch (error) {
		console.error("Vectorization error:", error);
		self.postMessage({ id, type: "error", error: (error as Error).message });
	}
};
