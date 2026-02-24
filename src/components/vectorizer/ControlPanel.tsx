import { ChevronDown, RotateCcw } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAppStore, type VectorizerSettings } from "@/store/appStore";

export function ControlPanel() {
	const { settings, updateSettings, resetSettings } = useAppStore();
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
				<Button
					variant="ghost"
					size="icon"
					onClick={handleReset}
					title="Reset to defaults"
				>
					<RotateCcw className="h-4 w-4" />
				</Button>
			</div>

			<div className="flex-1 overflow-y-auto px-4">
				{/* Color Settings */}
				<Section title="Color">
					<div className="space-y-4">
						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Number of Colors</Label>
								<span className="text-xs text-muted-foreground">
									{localSettings.numberofcolors}
								</span>
							</div>
							<Slider
								min={2}
								max={64}
								step={1}
								value={[localSettings.numberofcolors]}
								onValueChange={(val) => handleChange("numberofcolors", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Min Color Ratio</Label>
								<span className="text-xs text-muted-foreground">
									{localSettings.mincolorratio}
								</span>
							</div>
							<Slider
								min={0}
								max={10}
								step={0.1}
								value={[localSettings.mincolorratio]}
								onValueChange={(val) => handleChange("mincolorratio", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Color Quant Cycles</Label>
								<span className="text-xs text-muted-foreground">
									{localSettings.colorquantcycles}
								</span>
							</div>
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
							<div className="flex items-center justify-between">
								<Label>Path Omit (px)</Label>
								<span className="text-xs text-muted-foreground">
									{localSettings.pathomit}
								</span>
							</div>
							<Slider
								min={0}
								max={100}
								step={1}
								value={[localSettings.pathomit]}
								onValueChange={(val) => handleChange("pathomit", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Linear Trace Precision</Label>
								<span className="text-xs text-muted-foreground">
									{localSettings.ltres}
								</span>
							</div>
							<Slider
								min={0.01}
								max={10}
								step={0.1}
								value={[localSettings.ltres]}
								onValueChange={(val) => handleChange("ltres", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Quadratic Spline Precision</Label>
								<span className="text-xs text-muted-foreground">
									{localSettings.qtres}
								</span>
							</div>
							<Slider
								min={0.01}
								max={10}
								step={0.1}
								value={[localSettings.qtres]}
								onValueChange={(val) => handleChange("qtres", val[0])}
							/>
						</div>

						<div className="flex items-center justify-between">
							<Label htmlFor="enhance">Right Angle Enhance</Label>
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
							<div className="flex justify-between">
								<Label>Blur Radius</Label>
								<span className="text-xs text-muted-foreground">
									{localSettings.blurradius}
								</span>
							</div>
							<Slider
								min={0}
								max={20}
								step={1}
								value={[localSettings.blurradius]}
								onValueChange={(val) => handleChange("blurradius", val[0])}
							/>
						</div>
						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Blur Delta</Label>
								<span className="text-xs text-muted-foreground">
									{localSettings.blurdelta}
								</span>
							</div>
							<Slider
								min={0}
								max={255}
								step={1}
								value={[localSettings.blurdelta]}
								onValueChange={(val) => handleChange("blurdelta", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Stroke Width</Label>
								<span className="text-xs text-muted-foreground">
									{localSettings.strokewidth}
								</span>
							</div>
							<Slider
								min={0}
								max={10}
								step={0.1}
								value={[localSettings.strokewidth]}
								onValueChange={(val) => handleChange("strokewidth", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Output Scale</Label>
								<span className="text-xs text-muted-foreground">
									{localSettings.outputScale}x
								</span>
							</div>
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
