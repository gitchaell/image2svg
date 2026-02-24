import { useLiveQuery } from "dexie-react-hooks";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/shared/I18nContext";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";

function ImageThumbnail({ blob }: { blob: Blob }) {
	const [url, setUrl] = useState<string>("");

	useEffect(() => {
		if (!blob) return;
		const objectUrl = URL.createObjectURL(blob);
		setUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [blob]);

	if (!url)
		return (
			<div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
				<ImageIcon className="w-6 h-6 text-muted-foreground/50" />
			</div>
		);

	return (
		<img
			src={url}
			alt="Thumbnail"
			className="w-12 h-12 object-cover rounded bg-muted"
		/>
	);
}

export function HistorySidebar() {
	const t = useI18n();
	const images = useLiveQuery(() =>
		db.images.orderBy("createdAt").reverse().toArray(),
	);
	const { currentImageId, setCurrentImageId } = useAppStore();

	const handleDelete = async (e: React.MouseEvent, id: number) => {
		e.stopPropagation();
		await db.images.delete(id);
		if (currentImageId === id) setCurrentImageId(null);
	};

	const handleSelect = (id: number) => {
		setCurrentImageId(id);
	};

	// While loading or undefined
	if (images === undefined)
		return (
			<div className="flex flex-col h-full bg-background border-r w-full md:w-80 shrink-0">
				<div className="p-4 border-b bg-card">
					<h2 className="font-semibold text-lg">{t("history.title")}</h2>
				</div>
				<div className="p-4 space-y-2">
					<div className="h-14 w-full bg-muted rounded-lg animate-pulse" />
					<div className="h-14 w-full bg-muted rounded-lg animate-pulse" />
					<div className="h-14 w-full bg-muted rounded-lg animate-pulse" />
				</div>
			</div>
		);

	return (
		<div className="flex flex-col h-full bg-background border-r w-full md:w-80 shrink-0">
			<div className="p-4 border-b bg-card">
				<h2 className="font-semibold text-lg">{t("history.title")}</h2>
			</div>
			<div className="flex-1 overflow-y-auto p-2 space-y-2">
				{images.length === 0 ? (
					<div className="text-center text-sm text-muted-foreground p-4">
						{t("history.empty")}
					</div>
				) : (
					images.map((img) => (
						<div
							key={img.id}
							onClick={() => handleSelect(img.id!)}
							className={cn(
								"group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors relative hover:bg-muted/50",
								currentImageId === img.id
									? "bg-accent border border-primary/20"
									: "border border-transparent",
							)}
						>
							<div className="shrink-0">
								<ImageThumbnail blob={img.originalBlob} />
							</div>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-sm truncate">{img.name}</p>
								<p className="text-xs text-muted-foreground">
									{new Date(img.createdAt).toLocaleDateString()}
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
								onClick={(e) => handleDelete(e, img.id!)}
							>
								<Trash2 className="w-4 h-4 text-destructive" />
							</Button>
						</div>
					))
				)}
			</div>
		</div>
	);
}
