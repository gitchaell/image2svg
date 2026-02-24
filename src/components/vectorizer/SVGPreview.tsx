import { Code, Copy, Download, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { db } from "@/lib/db";
import { useAppStore } from "@/store/appStore";

export function SVGPreview() {
	const {
		currentImageId,
		settings,
		setProcessing,
		processing,
		setDetectedColors,
		hiddenColors,
	} = useAppStore();
	const [svgContent, setSvgContent] = useState<string | null>(null);
	const workerRef = useRef<Worker | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Initialize worker
		workerRef.current = new Worker(
			new URL("../../workers/vectorizer.worker.ts", import.meta.url),
			{ type: "module" },
		);

		workerRef.current.onmessage = (e) => {
			const { type, svg, error } = e.data;
			if (type === "success") {
				setSvgContent(svg);
				setProcessing(false);
				toast.success("Vectorization complete");
			} else if (type === "error") {
				console.error("Worker error:", error);
				setProcessing(false);
				toast.error(`Vectorization failed: ${error}`);
			}
		};

		return () => {
			workerRef.current?.terminate();
		};
	}, [setProcessing]);

	useEffect(() => {
		if (!currentImageId || !workerRef.current) {
			setSvgContent(null);
			setDetectedColors([]);
			return;
		}

		const processImage = async () => {
			setProcessing(true);
			try {
				const image = await db.images.get(currentImageId);
				if (!image) return;

				workerRef.current?.postMessage({
					id: currentImageId,
					type: "process",
					blob: image.originalBlob,
					settings: JSON.stringify(settings),
				});
				// toast.info("Processing image..."); // Maybe too noisy
			} catch (err) {
				console.error("Error loading image from DB:", err);
				setProcessing(false);
				toast.error("Failed to load image");
			}
		};

		// Debounce processing to avoid spamming worker on slider change
		const timeoutId = setTimeout(processImage, 500);
		return () => clearTimeout(timeoutId);
	}, [currentImageId, settings, setProcessing, setDetectedColors]);

	// Extract colors when SVG content changes
	useEffect(() => {
		if (!svgContent) {
			setDetectedColors([]);
			return;
		}

		const colors = new Set<string>();
		// Match fill attributes (e.g. fill="rgb(10,20,30)" or fill="#aabbcc")
		const regex = /fill="([^"]+)"/g;
		let match: RegExpExecArray | null;
		// biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop
		while ((match = regex.exec(svgContent)) !== null) {
			if (match[1] !== "none") {
				colors.add(match[1]);
			}
		}
		setDetectedColors(Array.from(colors));
	}, [svgContent, setDetectedColors]);

	const handleDownload = () => {
		if (!svgContent) return;
		try {
			const blob = new Blob([svgContent], { type: "image/svg+xml" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `vectorized-${Date.now()}.svg`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			toast.success("SVG Downloaded");
		} catch (e) {
			toast.error("Download failed");
		}
	};

	const handleCopy = async () => {
		if (!svgContent) return;
		try {
			await navigator.clipboard.writeText(svgContent);
			toast.success("SVG copied to clipboard");
		} catch (err) {
			console.error("Failed to copy:", err);
			toast.error("Failed to copy to clipboard");
		}
	};

	if (!currentImageId) {
		return (
			<div className="flex items-center justify-center h-full bg-muted/20 text-muted-foreground select-none">
				<div className="text-center">
					<p className="text-lg font-medium">No image selected</p>
					<p className="text-sm">Upload or select an image from history</p>
				</div>
			</div>
		);
	}

	return (
		<div className="relative w-full h-full bg-gray-50 dark:bg-zinc-950 overflow-hidden flex flex-col bg-[image:radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[image:radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px]">
			{/* Dynamic styles for hidden colors and hover effect */}
			<style>
				{`
					.svg-preview-container svg path:hover {
						stroke: #3b82f6; /* Blue-500 */
						stroke-width: 2px;
						vector-effect: non-scaling-stroke;
					}
					${hiddenColors.map((color) => `.svg-preview-container path[fill="${color}"] { display: none !important; }`).join("\n")}
				`}
			</style>

			{/* Toolbar */}
			<div className="absolute top-4 right-4 z-10 flex gap-2 bg-background/80 backdrop-blur-md p-2 rounded-lg shadow-sm border">
				<Dialog>
					<DialogTrigger asChild>
						<Button
							size="icon"
							variant="ghost"
							disabled={!svgContent || processing}
							title="View SVG code"
						>
							<Code className="w-4 h-4" />
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
						<DialogHeader>
							<DialogTitle>SVG Code</DialogTitle>
						</DialogHeader>
						<div className="flex-1 min-h-0 border rounded-md bg-muted/50 p-4 overflow-auto">
							<code className="text-xs break-all whitespace-pre-wrap font-mono">
								{svgContent}
							</code>
						</div>
						<Button onClick={handleCopy} className="gap-2">
							<Copy className="w-4 h-4" />
							Copy to Clipboard
						</Button>
					</DialogContent>
				</Dialog>

				<Button
					size="icon"
					variant="ghost"
					onClick={handleCopy}
					disabled={!svgContent || processing}
					title="Copy SVG code"
				>
					<Copy className="w-4 h-4" />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					onClick={handleDownload}
					disabled={!svgContent || processing}
					title="Download SVG"
				>
					<Download className="w-4 h-4" />
				</Button>
			</div>

			<div className="flex-1 relative w-full h-full" ref={containerRef}>
				{processing && (
					<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
						<span className="font-medium text-sm text-muted-foreground">
							Processing...
						</span>
					</div>
				)}

				<TransformWrapper
					initialScale={1}
					minScale={0.1}
					maxScale={8}
					centerOnInit
					limitToBounds={false}
				>
					{({ zoomIn, zoomOut, resetTransform, centerView }) => {
						const handleFitToScreen = () => {
							if (!svgContent || !containerRef.current) {
								resetTransform();
								return;
							}

							// Try to extract viewBox or width/height
							const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
							let svgW = 0;
							let svgH = 0;

							if (viewBoxMatch) {
								const parts = viewBoxMatch[1].split(/\s+|,/).map(Number);
								if (parts.length === 4) {
									svgW = parts[2];
									svgH = parts[3];
								}
							} else {
								const wMatch = svgContent.match(/width="([^"]+)"/);
								const hMatch = svgContent.match(/height="([^"]+)"/);
								if (wMatch && hMatch) {
									svgW = parseFloat(wMatch[1]);
									svgH = parseFloat(hMatch[1]);
								}
							}

							if (svgW > 0 && svgH > 0) {
								const container = containerRef.current.getBoundingClientRect();
								const scaleX = (container.width - 64) / svgW; // 64px padding
								const scaleY = (container.height - 64) / svgH;
								const scale = Math.min(scaleX, scaleY);

								if (scale > 0 && Number.isFinite(scale)) {
									centerView(scale, 0);
									return;
								}
							}
							resetTransform();
						};

						return (
							<>
								<div className="absolute bottom-4 right-4 z-10 flex gap-2 bg-background/80 backdrop-blur-md p-2 rounded-lg shadow-sm border">
									<Button
										size="icon"
										variant="ghost"
										onClick={() => zoomIn()}
										title="Zoom In"
									>
										<ZoomIn className="w-4 h-4" />
									</Button>
									<Button
										size="icon"
										variant="ghost"
										onClick={() => zoomOut()}
										title="Zoom Out"
									>
										<ZoomOut className="w-4 h-4" />
									</Button>
									<Button
										size="icon"
										variant="ghost"
										onClick={handleFitToScreen}
										title="Fit to Screen"
									>
										<Maximize className="w-4 h-4" />
									</Button>
								</div>

								<TransformComponent
									wrapperClass="w-full h-full cursor-move"
									contentClass="w-full h-full flex items-center justify-center"
								>
									{svgContent ? (
										<div
											className="w-full h-full flex items-center justify-center p-8 origin-center svg-preview-container"
											// biome-ignore lint/security/noDangerouslySetInnerHtml: SVG content is safe here
											dangerouslySetInnerHTML={{ __html: svgContent }}
											style={{
												maxWidth: "100%",
												maxHeight: "100%",
												shapeRendering: "optimizeSpeed",
											}}
										/>
									) : (
										!processing && (
											<div className="text-muted-foreground">
												Waiting for result...
											</div>
										)
									)}
								</TransformComponent>
							</>
						);
					}}
				</TransformWrapper>
			</div>
		</div>
	);
}
