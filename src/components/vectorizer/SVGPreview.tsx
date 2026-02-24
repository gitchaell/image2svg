import { Copy, Download, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
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
			} else if (type === "error") {
				console.error("Worker error:", error);
				setProcessing(false);
			}
		};

		return () => {
			workerRef.current?.terminate();
		};
		// biome-ignore lint/correctness/useExhaustiveDependencies: setProcessing is stable
	}, []);

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
			} catch (err) {
				console.error("Error loading image from DB:", err);
				setProcessing(false);
			}
		};

		// Debounce processing to avoid spamming worker on slider change
		const timeoutId = setTimeout(processImage, 500);
		return () => clearTimeout(timeoutId);
		// biome-ignore lint/correctness/useExhaustiveDependencies: setProcessing is stable
	}, [currentImageId, settings]);

	// Extract colors when SVG content changes
	useEffect(() => {
		if (!svgContent) {
			setDetectedColors([]);
			return;
		}

		const colors = new Set<string>();
		// Match fill attributes (e.g. fill="rgb(10,20,30)" or fill="#aabbcc")
		const regex = /fill="([^"]+)"/g;
		let match;
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
		const blob = new Blob([svgContent], { type: "image/svg+xml" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `vectorized-${Date.now()}.svg`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleCopy = async () => {
		if (!svgContent) return;
		try {
			await navigator.clipboard.writeText(svgContent);
			// Optional: Show toast or feedback? For now just silent success or rely on button state
		} catch (err) {
			console.error("Failed to copy:", err);
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

			<div className="flex-1 relative w-full h-full">
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
					{({ zoomIn, zoomOut, resetTransform }) => (
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
									onClick={() => resetTransform()}
									title="Fit to Screen / Reset"
								>
									<Maximize className="w-4 h-4" />
								</Button>
							</div>

							<TransformComponent
								wrapperClass="w-full h-full"
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
					)}
				</TransformWrapper>
			</div>
		</div>
	);
}
