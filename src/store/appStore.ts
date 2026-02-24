import { create } from "zustand";

export interface VectorizerSettings {
	// ImageTracerJS settings
	ltres: number;
	qtres: number;
	pathomit: number;
	rightangleenhance: boolean;
	colorsampling: number; // 0: disabled, 1: random, 2: deterministic
	numberofcolors: number;
	mincolorratio: number;
	colorquantcycles: number;
	layering: number; // 0: sequential, 1: parallel
	strokewidth: number;
	linefilter: boolean;
	scale: number;
	roundcoords: number;
	viewbox: boolean;
	desc: boolean;
	lcpr: number;
	qcpr: number;
	blurradius: number;
	blurdelta: number;

	// Custom settings
	outputScale: number; // For final export
	preprocessBlur: number; // 0 to X
	preprocessQuantize: number; // 0 to X (levels per channel)
}

export const defaultSettings: VectorizerSettings = {
	ltres: 4,
	qtres: 4,
	pathomit: 8,
	rightangleenhance: false,
	colorsampling: 2,
	numberofcolors: 8,
	mincolorratio: 0,
	colorquantcycles: 1,
	layering: 0,
	strokewidth: 1,
	linefilter: false,
	scale: 1,
	roundcoords: 1,
	viewbox: false,
	desc: false,
	lcpr: 0,
	qcpr: 0,
	blurradius: 0,
	blurdelta: 20,
	outputScale: 1,
	preprocessBlur: 1,
	preprocessQuantize: 1,
};

interface AppState {
	currentImageId: number | null;
	processing: boolean;
	progress: number;
	settings: VectorizerSettings;
	detectedColors: string[];
	hiddenColors: string[];

	setCurrentImageId: (id: number | null) => void;
	setProcessing: (processing: boolean) => void;
	setProgress: (progress: number) => void;
	updateSettings: (settings: Partial<VectorizerSettings>) => void;
	resetSettings: () => void;
	setDetectedColors: (colors: string[]) => void;
	toggleHiddenColor: (color: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
	currentImageId: null,
	processing: false,
	progress: 0,
	settings: defaultSettings,
	detectedColors: [],
	hiddenColors: [],

	setCurrentImageId: (id) => set({ currentImageId: id }),
	setProcessing: (processing) => set({ processing }),
	setProgress: (progress) => set({ progress }),
	updateSettings: (newSettings) =>
		set((state) => ({
			settings: { ...state.settings, ...newSettings },
		})),
	resetSettings: () => set({ settings: defaultSettings }),
	setDetectedColors: (colors) => set({ detectedColors: colors }),
	toggleHiddenColor: (color) =>
		set((state) => {
			const hidden = new Set(state.hiddenColors);
			if (hidden.has(color)) {
				hidden.delete(color);
			} else {
				hidden.add(color);
			}
			return { hiddenColors: Array.from(hidden) };
		}),
}));
