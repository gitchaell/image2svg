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
import { useI18n } from "@/components/shared/I18nContext";
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
	const t = useI18n();
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

			// Get image dimensions and sample for complexity
			const bitmap = await createImageBitmap(image.originalBlob);
			const { width, height } = bitmap;
			const pixelCount = width * height;

			// Create a small canvas to analyze colors
			const canvas = new OffscreenCanvas(100, 100);
			const ctx = canvas.getContext("2d");
			if (ctx) {
				ctx.drawImage(bitmap, 0, 0, 100, 100);
				const imageData = ctx.getImageData(0, 0, 100, 100);
				const uniqueColors = new Set();
				for (let i = 0; i < imageData.data.length; i += 4) {
					const r = Math.round(imageData.data[i] / 10) * 10;
					const g = Math.round(imageData.data[i + 1] / 10) * 10;
					const b = Math.round(imageData.data[i + 2] / 10) * 10;
					uniqueColors.add(`${r},${g},${b}`);
				}

				const colorCount = uniqueColors.size;
				const newSettings = { ...localSettings };

				if (colorCount < 16) {
					// Simple illustration/logo
					newSettings.numberofcolors = Math.max(2, colorCount + 2);
					newSettings.pathomit = 2;
					newSettings.ltres = 1;
					newSettings.qtres = 1;
					newSettings.preprocessBlur = 0;
					newSettings.preprocessQuantize = 0;
				} else {
					// Photo or complex image
					newSettings.numberofcolors = 16;
					newSettings.pathomit = 8;
					newSettings.ltres = 3;
					newSettings.qtres = 3;
					newSettings.preprocessBlur = 1; // Slight blur to reduce noise
					newSettings.preprocessQuantize = 16; // Group colors
				}

				// Adjust scale for performance
				if (pixelCount > 2000 * 2000) {
					newSettings.scale = 0.5;
				} else if (pixelCount > 1000 * 1000) {
					newSettings.scale = 0.75;
				} else {
					newSettings.scale = 1;
				}

				updateSettings(newSettings);
				return;
			}

			// Fallback if canvas fails
			const newSettings = { ...localSettings };
			newSettings.numberofcolors = 8;
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
			<div className="h-14 flex items-center justify-between px-4 border-b shrink-0 bg-card">
				<h2 className="text-lg font-semibold">{t("settings.title")}</h2>
				<div className="flex gap-1">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleMagic}
						disabled={!currentImageId}
						title={t("settings.auto_detect")}
					>
						<Sparkles className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleReset}
						title={t("settings.reset")}
					>
						<RotateCcw className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto px-4">
				{/* Preprocessing Settings */}
				<Section title={t("section.preprocessing")}>
					<div className="space-y-4">
						<p className="text-xs text-muted-foreground">
							{t("section.preprocessing.desc")}
						</p>
						<div className="space-y-2">
							<LabelWithTooltip
								label={t("param.denoise_blur")}
								tooltip={t("param.denoise_blur.tooltip")}
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
								label={t("param.simplify_colors")}
								tooltip={t("param.simplify_colors.tooltip")}
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
				<Section title={t("section.color")}>
					<div className="space-y-4">
						<div className="space-y-2">
							<LabelWithTooltip
								label={t("param.number_of_colors")}
								tooltip={t("param.number_of_colors.tooltip")}
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
									<Label>{t("param.detected_colors")}</Label>
									<div className="flex gap-1">
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6"
											onClick={() => toggleAllColors(true)}
											title={t("param.show_all")}
										>
											<Eye className="h-3 w-3" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6"
											onClick={() => toggleAllColors(false)}
											title={t("param.hide_all")}
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
													? `${t("param.show_color")} ${color}`
													: `${t("param.hide_color")} ${color}`
											}
										/>
									))}
								</div>
							</div>
						)}

						<div className="space-y-2">
							<LabelWithTooltip
								label={t("param.min_color_ratio")}
								tooltip={t("param.min_color_ratio.tooltip")}
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
								label={t("param.color_quant_cycles")}
								tooltip={t("param.color_quant_cycles.tooltip")}
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
				<Section title={t("section.detail")}>
					<div className="space-y-4">
						<div className="space-y-2">
							<LabelWithTooltip
								label={t("param.path_omit")}
								tooltip={t("param.path_omit.tooltip")}
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
								label={t("param.ltres")}
								tooltip={t("param.ltres.tooltip")}
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
								label={t("param.qtres")}
								tooltip={t("param.qtres.tooltip")}
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
								<Label htmlFor="enhance">{t("param.right_angle_enhance")}</Label>
								<Tooltip delayDuration={300}>
									<TooltipTrigger asChild>
										<Info className="h-3 w-3 text-muted-foreground cursor-help" />
									</TooltipTrigger>
									<TooltipContent side="right">
										<p>{t("param.right_angle_enhance.tooltip")}</p>
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
				<Section title={t("section.render")}>
					<div className="space-y-4">
						<div className="space-y-2">
							<LabelWithTooltip
								label={t("param.blur_radius")}
								tooltip={t("param.blur_radius.tooltip")}
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
								label={t("param.blur_delta")}
								tooltip={t("param.blur_delta.tooltip")}
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
								label={t("param.stroke_width")}
								tooltip={t("param.stroke_width.tooltip")}
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
								label={t("param.output_scale")}
								tooltip={t("param.output_scale.tooltip")}
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
							<Label htmlFor="viewbox">{t("param.use_viewbox")}</Label>
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
					{t("settings.apply")}
				</Button>
			</div>
		</div>
	);
}
