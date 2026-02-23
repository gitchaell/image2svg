declare module "imagetracerjs" {
	interface ImageData {
		width: number;
		height: number;
		data: Uint8ClampedArray;
	}

	export interface ImageTracerOptions {
		ltres?: number;
		qtres?: number;
		pathomit?: number;
		rightangleenhance?: boolean;
		colorsampling?: number;
		numberofcolors?: number;
		mincolorratio?: number;
		colorquantcycles?: number;
		layering?: number;
		strokewidth?: number;
		linefilter?: boolean;
		scale?: number;
		roundcoords?: number;
		viewbox?: boolean;
		desc?: boolean;
		lcpr?: number;
		qcpr?: number;
		blurradius?: number;
		blurdelta?: number;
	}

	interface ImageTracer {
		imagedataToSVG(imageData: ImageData, options?: ImageTracerOptions): string;
		imageToSVG(
			url: string,
			callback: (svg: string) => void,
			options?: ImageTracerOptions,
		): void;
		appendSVGString(svg: string): void;
		loadImage(url: string, callback: (canvas: HTMLCanvasElement) => void): void;
		getImgdata(canvas: HTMLCanvasElement): ImageData;
	}

	const imageTracer: ImageTracer;
	export default imageTracer;
}
