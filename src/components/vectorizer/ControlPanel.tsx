import React, { useCallback } from "react";
import { useAppStore, type VectorizerSettings } from "@/store/appStore";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ControlPanel() {
	const { settings, updateSettings } = useAppStore();

	const handleChange = (
		key: keyof VectorizerSettings,
		value: number | boolean,
	) => {
		updateSettings({ [key]: value });
	};

	return (
		<div className="w-full h-full overflow-y-auto p-4 space-y-6 bg-background border-l">
			<div className="flex items-center justify-between mb-2">
				<h2 className="text-lg font-semibold">Settings</h2>
			</div>

			<Tabs defaultValue="color" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="color">Color</TabsTrigger>
					<TabsTrigger value="detail">Detail</TabsTrigger>
					<TabsTrigger value="render">Render</TabsTrigger>
				</TabsList>

				{/* Color Settings */}
				<TabsContent value="color" className="space-y-6 mt-4">
					<div className="space-y-4">
						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Number of Colors</Label>
								<span className="text-xs text-muted-foreground">
									{settings.numberofcolors}
								</span>
							</div>
							<Slider
								min={2}
								max={64}
								step={1}
								value={[settings.numberofcolors]}
								onValueChange={(val) => handleChange("numberofcolors", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Min Color Ratio</Label>
								<span className="text-xs text-muted-foreground">
									{settings.mincolorratio}
								</span>
							</div>
							<Slider
								min={0}
								max={10}
								step={0.1}
								value={[settings.mincolorratio]}
								onValueChange={(val) => handleChange("mincolorratio", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Color Quant Cycles</Label>
								<span className="text-xs text-muted-foreground">
									{settings.colorquantcycles}
								</span>
							</div>
							<Slider
								min={1}
								max={10}
								step={1}
								value={[settings.colorquantcycles]}
								onValueChange={(val) =>
									handleChange("colorquantcycles", val[0])
								}
							/>
						</div>
					</div>
				</TabsContent>

				{/* Detail Settings */}
				<TabsContent value="detail" className="space-y-6 mt-4">
					<div className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label>Path Omit (px)</Label>
								<span className="text-xs text-muted-foreground">
									{settings.pathomit}
								</span>
							</div>
							<Slider
								min={0}
								max={100}
								step={1}
								value={[settings.pathomit]}
								onValueChange={(val) => handleChange("pathomit", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Linear Trace Precision</Label>
								<span className="text-xs text-muted-foreground">
									{settings.ltres}
								</span>
							</div>
							<Slider
								min={0.01}
								max={10}
								step={0.1}
								value={[settings.ltres]}
								onValueChange={(val) => handleChange("ltres", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Quadratic Spline Precision</Label>
								<span className="text-xs text-muted-foreground">
									{settings.qtres}
								</span>
							</div>
							<Slider
								min={0.01}
								max={10}
								step={0.1}
								value={[settings.qtres]}
								onValueChange={(val) => handleChange("qtres", val[0])}
							/>
						</div>

						<div className="flex items-center justify-between">
							<Label htmlFor="enhance">Right Angle Enhance</Label>
							<Switch
								id="enhance"
								checked={settings.rightangleenhance}
								onCheckedChange={(checked) =>
									handleChange("rightangleenhance", checked)
								}
							/>
						</div>
					</div>
				</TabsContent>

				{/* Render Settings */}
				<TabsContent value="render" className="space-y-6 mt-4">
					<div className="space-y-4">
						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Blur Radius</Label>
								<span className="text-xs text-muted-foreground">
									{settings.blurradius}
								</span>
							</div>
							<Slider
								min={0}
								max={20}
								step={1}
								value={[settings.blurradius]}
								onValueChange={(val) => handleChange("blurradius", val[0])}
							/>
						</div>
						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Blur Delta</Label>
								<span className="text-xs text-muted-foreground">
									{settings.blurdelta}
								</span>
							</div>
							<Slider
								min={0}
								max={255}
								step={1}
								value={[settings.blurdelta]}
								onValueChange={(val) => handleChange("blurdelta", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Stroke Width</Label>
								<span className="text-xs text-muted-foreground">
									{settings.strokewidth}
								</span>
							</div>
							<Slider
								min={0}
								max={10}
								step={0.1}
								value={[settings.strokewidth]}
								onValueChange={(val) => handleChange("strokewidth", val[0])}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between">
								<Label>Output Scale</Label>
								<span className="text-xs text-muted-foreground">
									{settings.outputScale}x
								</span>
							</div>
							<Slider
								min={1}
								max={10}
								step={1}
								value={[settings.outputScale]}
								onValueChange={(val) => handleChange("outputScale", val[0])}
							/>
						</div>

						<div className="flex items-center justify-between">
							<Label htmlFor="viewbox">Use Viewbox</Label>
							<Switch
								id="viewbox"
								checked={settings.viewbox}
								onCheckedChange={(checked) => handleChange("viewbox", checked)}
							/>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
