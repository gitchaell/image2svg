import React, { useRef, useEffect, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { db } from "@/lib/db";

export function SVGPreview() {
	const { currentImageId, settings, setProcessing, processing } = useAppStore();
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
	}, []);

	useEffect(() => {
		if (!currentImageId || !workerRef.current) {
			setSvgContent(null);
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
	}, [currentImageId, settings]);

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
		<div
			className="relative w-full h-full bg-background overflow-hidden flex flex-col"
			style={{
				backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
				backgroundSize: "20px 20px",
			}}
		>
			{/* Toolbar */}
			<div className="absolute top-4 right-4 z-10 flex gap-2 bg-background/80 backdrop-blur-md p-2 rounded-lg shadow-sm border">
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
								<Button size="icon" variant="ghost" onClick={() => zoomIn()}>
									<ZoomIn className="w-4 h-4" />
								</Button>
								<Button size="icon" variant="ghost" onClick={() => zoomOut()}>
									<ZoomOut className="w-4 h-4" />
								</Button>
								<Button
									size="icon"
									variant="ghost"
									onClick={() => resetTransform()}
								>
									<RotateCcw className="w-4 h-4" />
								</Button>
							</div>

							<TransformComponent
								wrapperClass="w-full h-full"
								contentClass="w-full h-full flex items-center justify-center"
							>
								{svgContent ? (
									<div
										className="w-full h-full flex items-center justify-center p-8 origin-center"
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
