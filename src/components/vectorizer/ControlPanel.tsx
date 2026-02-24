import {
	ChevronDown,
	Eye,
	EyeOff,
	Info,
	RotateCcw,
	Sparkles,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { db } from "@/lib/db";
import { useAppStore, type VectorizerSettings } from "@/store/appStore";

export function ControlPanel() {
	const {
		settings,
		updateSettings,
		resetSettings,
		detectedColors,
		hiddenColors,
		toggleHiddenColor,
		currentImageId,
	} = useAppStore();
	const [localSettings, setLocalSettings] =
		useState<VectorizerSettings>(settings);
	const [isDirty, setIsDirty] = useState(false);

	// Sync with store settings if they change externally (e.g. reset)
	useEffect(() => {
		setLocalSettings(settings);
		setIsDirty(false);
	}, [settings]);

	const handleChange = (
		key: keyof VectorizerSettings,
		value: number | boolean,
	) => {
		setLocalSettings((prev) => ({ ...prev, [key]: value }));
		setIsDirty(true);
	};

	const handleApply = () => {
		updateSettings(localSettings);
		setIsDirty(false);
	};

	const handleReset = () => {
		resetSettings();
	};

	const handleMagic = async () => {
		if (!currentImageId) return;
		try {
			const image = await db.images.get(currentImageId);
			if (!image) return;

			// Get image dimensions
			const bitmap = await createImageBitmap(image.originalBlob);
			const { width, height } = bitmap;
			const pixelCount = width * height;

			const newSettings = { ...localSettings };

			// Simple heuristics
			if (pixelCount > 2000 * 2000) {
				newSettings.scale = 0.5;
				newSettings.ltres = 5;
				newSettings.qtres = 5;
				newSettings.numberofcolors = 16;
				newSettings.pathomit = 16;
			} else if (pixelCount > 1000 * 1000) {
				newSettings.scale = 0.75;
				newSettings.ltres = 4;
				newSettings.qtres = 4;
				newSettings.numberofcolors = 12;
			} else {
				newSettings.scale = 1;
				newSettings.ltres = 2;
				newSettings.qtres = 2;
				newSettings.numberofcolors = 8;
			}
			newSettings.colorquantcycles = 1;

			updateSettings(newSettings);
		} catch (err) {
			console.error("Magic config failed:", err);
		}
	};

	const toggleAllColors = (show: boolean) => {
		if (show) {
			// Show all: clear hiddenColors
			useAppStore.setState({ hiddenColors: [] });
		} else {
			// Hide all: set hiddenColors to all detectedColors
			useAppStore.setState({ hiddenColors: [...detectedColors] });
		}
	};

	const LabelWithTooltip = ({
		label,
		tooltip,
		value,
	}: {
		label: string;
		tooltip: string;
		value?: React.ReactNode;
	}) => (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-2">
				<Label className="cursor-help">{label}</Label>
				<Tooltip delayDuration={300}>
					<TooltipTrigger asChild>
						<Info className="h-3 w-3 text-muted-foreground opacity-70 hover:opacity-100" />
					</TooltipTrigger>
					<TooltipContent side="right" className="max-w-[220px]">
						<p>{tooltip}</p>
					</TooltipContent>
				</Tooltip>
			</div>
			{value !== undefined && (
				<span className="text-xs text-muted-foreground">{value}</span>
			)}
		</div>
	);

	const Section = ({
		title,
		children,
	}: {
		title: string;
		children: React.ReactNode;
	}) => (
		<details className="group border-b last:border-0" open>
			<summary className="flex cursor-pointer list-none items-center justify-between py-4 font-medium transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
				{title}
				<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
			</summary>
			<div className="pb-4 pt-0 text-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
				{children}
			</div>
		</details>
	);

	return (
		<div className="flex flex-col h-full bg-background border-l">
			<div className="flex items-center justify-between p-4 border-b shrink-0">
				<h2 className="text-lg font-semibold">Settings</h2>
				<div className="flex gap-1">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleMagic}
						disabled={!currentImageId}
						title="Auto-detect best settings"
					>
						<Sparkles className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleReset}
						title="Reset to defaults"
					>
						<RotateCcw className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto px-4">
				{/* Preprocessing Settings */}
				<Section title="Preprocessing">
					<div className="space-y-4">
						<p className="text-xs text-muted-foreground">
							Clean up grainy images before vectorizing.
						</p>
						<div className="space-y-2">
							<LabelWithTooltip
								label="Denoise Blur"
								tooltip="Applies a blur to smooth out grain and noise before processing. Higher values remove more noise but lose detail."
								value={localSettings.preprocessBlur}
							/>
							<Slider
								min={0}
								max={10}
								step={1}
								value={[localSettings.preprocessBlur || 0]}
								onValueChange={(val) => handleChange("preprocessBlur", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<LabelWithTooltip
								label="Simplify Colors"
								tooltip="Reduces the number of colors (posterization) before processing. Helps merge similar colors and reduce path count."
								value={localSettings.preprocessQuantize}
							/>
							<Slider
								min={0}
								max={16}
								step={1}
								value={[localSettings.preprocessQuantize || 0]}
								onValueChange={(val) =>
									handleChange("preprocessQuantize", val[0])
								}
							/>
						</div>
					</div>
				</Section>

				{/* Color Settings */}
				<Section title="Color">
					<div className="space-y-4">
						<div className="space-y-2">
							<LabelWithTooltip
								label="Number of Colors"
								tooltip="Target number of colors in the palette. More colors means more detail but larger file size."
								value={localSettings.numberofcolors}
							/>
							<Slider
								min={2}
								max={64}
								step={1}
								value={[localSettings.numberofcolors]}
								onValueChange={(val) => handleChange("numberofcolors", val[0])}
							/>
						</div>

						{detectedColors.length > 0 && (
							<div className="space-y-2 pt-4 border-t">
								<div className="flex items-center justify-between mb-2">
									<Label>Detected Colors</Label>
									<div className="flex gap-1">
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6"
											onClick={() => toggleAllColors(true)}
											title="Show All"
										>
											<Eye className="h-3 w-3" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6"
											onClick={() => toggleAllColors(false)}
											title="Hide All"
										>
											<EyeOff className="h-3 w-3" />
										</Button>
									</div>
								</div>
								<div className="grid grid-cols-6 gap-2">
									{detectedColors.map((color) => (
										<button
											key={color}
											type="button"
											className={`w-8 h-8 rounded border transition-all ${
												hiddenColors.includes(color)
													? "opacity-20 grayscale"
													: "hover:scale-110 ring-1 ring-border"
											}`}
											style={{ backgroundColor: color }}
											onClick={() => toggleHiddenColor(color)}
											title={
												hiddenColors.includes(color)
													? `Show ${color}`
													: `Hide ${color}`
											}
										/>
									))}
								</div>
							</div>
						)}

						<div className="space-y-2">
							<LabelWithTooltip
								label="Min Color Ratio"
								tooltip="Ignore colors that occupy less than this percentage of the image."
								value={localSettings.mincolorratio}
							/>
							<Slider
								min={0}
								max={10}
								step={0.1}
								value={[localSettings.mincolorratio]}
								onValueChange={(val) => handleChange("mincolorratio", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<LabelWithTooltip
								label="Color Quant Cycles"
								tooltip="Number of times to refine the color palette. Higher values are slower but yield better color matching."
								value={localSettings.colorquantcycles}
							/>
							<Slider
								min={1}
								max={10}
								step={1}
								value={[localSettings.colorquantcycles]}
								onValueChange={(val) =>
									handleChange("colorquantcycles", val[0])
								}
							/>
						</div>
					</div>
				</Section>

				{/* Detail Settings */}
				<Section title="Detail">
					<div className="space-y-4">
						<div className="space-y-2">
							<LabelWithTooltip
								label="Path Omit (px)"
								tooltip="Ignore paths (shapes) smaller than this pixel size. Reduces noise."
								value={localSettings.pathomit}
							/>
							<Slider
								min={0}
								max={100}
								step={1}
								value={[localSettings.pathomit]}
								onValueChange={(val) => handleChange("pathomit", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<LabelWithTooltip
								label="Linear Trace Precision"
								tooltip="Error threshold for linear path tracing. Lower values mean more precise lines but more points."
								value={localSettings.ltres}
							/>
							<Slider
								min={0.01}
								max={10}
								step={0.1}
								value={[localSettings.ltres]}
								onValueChange={(val) => handleChange("ltres", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<LabelWithTooltip
								label="Quadratic Spline Precision"
								tooltip="Error threshold for curve fitting. Lower values mean smoother curves but more points."
								value={localSettings.qtres}
							/>
							<Slider
								min={0.01}
								max={10}
								step={0.1}
								value={[localSettings.qtres]}
								onValueChange={(val) => handleChange("qtres", val[0])}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Label htmlFor="enhance">Right Angle Enhance</Label>
								<Tooltip delayDuration={300}>
									<TooltipTrigger asChild>
										<Info className="h-3 w-3 text-muted-foreground cursor-help" />
									</TooltipTrigger>
									<TooltipContent side="right">
										<p>Attempts to sharpen corners to 90 degrees.</p>
									</TooltipContent>
								</Tooltip>
							</div>
							<Switch
								id="enhance"
								checked={localSettings.rightangleenhance}
								onCheckedChange={(checked) =>
									handleChange("rightangleenhance", checked)
								}
							/>
						</div>
					</div>
				</Section>

				{/* Render Settings */}
				<Section title="Render">
					<div className="space-y-4">
						<div className="space-y-2">
							<LabelWithTooltip
								label="Blur Radius"
								tooltip="Applies a blur to the generated SVG paths."
								value={localSettings.blurradius}
							/>
							<Slider
								min={0}
								max={20}
								step={1}
								value={[localSettings.blurradius]}
								onValueChange={(val) => handleChange("blurradius", val[0])}
							/>
						</div>
						<div className="space-y-2">
							<LabelWithTooltip
								label="Blur Delta"
								tooltip="The standard deviation for the Gaussian blur."
								value={localSettings.blurdelta}
							/>
							<Slider
								min={0}
								max={255}
								step={1}
								value={[localSettings.blurdelta]}
								onValueChange={(val) => handleChange("blurdelta", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<LabelWithTooltip
								label="Stroke Width"
								tooltip="Width of the stroke around filled shapes."
								value={localSettings.strokewidth}
							/>
							<Slider
								min={0}
								max={10}
								step={0.1}
								value={[localSettings.strokewidth]}
								onValueChange={(val) => handleChange("strokewidth", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<LabelWithTooltip
								label="Output Scale"
								tooltip="Scale factor for the final SVG output dimensions."
								value={`${localSettings.outputScale}x`}
							/>
							<Slider
								min={1}
								max={10}
								step={1}
								value={[localSettings.outputScale]}
								onValueChange={(val) => handleChange("outputScale", val[0])}
							/>
						</div>

						<div className="flex items-center justify-between">
							<Label htmlFor="viewbox">Use Viewbox</Label>
							<Switch
								id="viewbox"
								checked={localSettings.viewbox}
								onCheckedChange={(checked) => handleChange("viewbox", checked)}
							/>
						</div>
					</div>
				</Section>
			</div>

			<div className="p-4 border-t bg-background shrink-0">
				<Button className="w-full" onClick={handleApply} disabled={!isDirty}>
					Apply Changes
				</Button>
			</div>
		</div>
	);
}
