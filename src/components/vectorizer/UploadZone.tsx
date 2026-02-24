import { Upload } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useI18n } from "@/components/shared/I18nContext";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";

export function UploadZone() {
	const t = useI18n();
	const setCurrentImageId = useAppStore((state) => state.setCurrentImageId);
	const [isDragOver, setIsDragOver] = useState(false);

	const handleFile = async (file: File) => {
		if (!file.type.startsWith("image/")) return;

		try {
			const id = await db.images.add({
				name: file.name,
				originalBlob: file,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				settings: {},
			});

			setCurrentImageId(Number(id));
		} catch (err) {
			console.error("Failed to save image", err);
		}
	};

	const onDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		if (e.dataTransfer.files?.[0]) {
			handleFile(e.dataTransfer.files[0]);
		}
	};

	return (
		<Card
			className={cn(
				"border-dashed border-2 flex flex-col items-center justify-center cursor-pointer transition-colors p-10 h-64 w-full max-w-lg mx-auto",
				isDragOver
					? "bg-accent/50 border-primary"
					: "hover:bg-accent/10 border-muted-foreground/25",
			)}
			onDragOver={(e) => {
				e.preventDefault();
				setIsDragOver(true);
			}}
			onDragLeave={() => setIsDragOver(false)}
			onDrop={onDrop}
			onClick={() => document.getElementById("file-upload")?.click()}
		>
			<Upload className="w-12 h-12 text-muted-foreground mb-4" />
			<div className="text-center space-y-2">
				<h3 className="text-lg font-medium">{t("upload.title")}</h3>
				<p className="text-sm text-muted-foreground">{t("upload.desc")}</p>
			</div>
			<input
				id="file-upload"
				type="file"
				className="hidden"
				accept="image/*"
				onChange={(e) => {
					if (e.target.files?.[0]) handleFile(e.target.files[0]);
					if (e.target) e.target.value = ""; // reset input
				}}
			/>
		</Card>
	);
}
