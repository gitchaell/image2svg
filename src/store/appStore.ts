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
}

export const defaultSettings: VectorizerSettings = {
	ltres: 1,
	qtres: 1,
	pathomit: 8,
	rightangleenhance: true,
	colorsampling: 2,
	numberofcolors: 16,
	mincolorratio: 0,
	colorquantcycles: 3,
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
};

interface AppState {
	currentImageId: number | null;
	processing: boolean;
	progress: number;
	settings: VectorizerSettings;

	setCurrentImageId: (id: number | null) => void;
	setProcessing: (processing: boolean) => void;
	setProgress: (progress: number) => void;
	updateSettings: (settings: Partial<VectorizerSettings>) => void;
	resetSettings: () => void;
}

export const useAppStore = create<AppState>((set) => ({
	currentImageId: null,
	processing: false,
	progress: 0,
	settings: defaultSettings,

	setCurrentImageId: (id) => set({ currentImageId: id }),
	setProcessing: (processing) => set({ processing }),
	setProgress: (progress) => set({ progress }),
	updateSettings: (newSettings) =>
		set((state) => ({
			settings: { ...state.settings, ...newSettings },
		})),
	resetSettings: () => set({ settings: defaultSettings }),
}));
