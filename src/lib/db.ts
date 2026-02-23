import Dexie, { type Table } from "dexie";

export interface ImageRecord {
	id?: number;
	name: string;
	originalBlob: Blob;
	previewUrl?: string; // Optional: for display purposes
	svgContent?: string; // The generated SVG
	createdAt: number;
	updatedAt: number;
	settings: Record<string, any>; // Vectorization settings used
}

export class VectorizerDatabase extends Dexie {
	images!: Table<ImageRecord>;

	constructor() {
		super("VectorizerDB");
		this.version(1).stores({
			images: "++id, name, createdAt, updatedAt", // Primary key and indexed props
		});
	}
}

export const db = new VectorizerDatabase();
