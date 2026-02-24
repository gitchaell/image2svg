import { PanelLeft, PanelRight } from "lucide-react";
import React, { useState } from "react";
import { Toaster } from "sonner";
import { I18nProvider } from "@/components/shared/I18nContext";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ui } from "@/i18n/ui";
import { useAppStore } from "@/store/appStore";
import { ControlPanel } from "./ControlPanel";
import { HistorySidebar } from "./HistorySidebar";
import { SVGPreview } from "./SVGPreview";
import { UploadZone } from "./UploadZone";

export function VectorApp({ lang = "en" }: { lang?: keyof typeof ui }) {
	const isDesktop = useMediaQuery("(min-width: 1024px)"); // LG breakpoint for 3-pane layout
	const [showLeftPanel, setShowLeftPanel] = useState(true);
	const [showRightPanel, setShowRightPanel] = useState(true);
	const { currentImageId } = useAppStore();
	const [activeTab, setActiveTab] = useState("library");

	const t = (key: keyof (typeof ui)["en"]) => {
		return ui[lang]?.[key] || ui["en"][key] || key;
	};

	React.useEffect(() => {
		if (currentImageId) {
			setActiveTab("preview");
		}
	}, [currentImageId]);

	return (
		<I18nProvider lang={lang}>
			<TooltipProvider>
				<Toaster position="top-center" richColors />
				{isDesktop ? (
					<div className="flex h-full w-full bg-background overflow-hidden text-foreground">
						{/* Left Sidebar: History & Upload */}
						<div
							className={`transition-all duration-300 border-r bg-muted/10 flex flex-col ${showLeftPanel ? "w-80" : "w-0 opacity-0 overflow-hidden"}`}
						>
							<div className="p-4 border-b flex items-center justify-between h-14 shrink-0">
								<h2 className="font-semibold">{t("app.library")}</h2>
							</div>
							<div className="p-4 border-b shrink-0">
								<UploadZone />
							</div>
							<div className="flex-1 overflow-hidden h-full">
								<HistorySidebar />
							</div>
						</div>

						{/* Center: Preview & Toolbar */}
						<div className="flex-1 flex flex-col min-w-0 bg-muted/20 relative">
							{/* Top Toolbar */}
							<div className="h-14 border-b bg-background flex items-center px-4 justify-between shrink-0 z-20">
								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setShowLeftPanel(!showLeftPanel)}
									>
										<PanelLeft className="w-4 h-4" />
									</Button>
									<div className="flex items-center gap-2 ml-2">
										<Logo className="w-6 h-6" />
										<span className="font-bold hidden md:inline-block text-xl tracking-tight">
											image2svg
										</span>
									</div>
								</div>

								<div></div>

								<div className="flex items-center gap-2">
									<LanguageSelector />
									<ThemeToggle />
									<div className="h-4 w-px bg-border mx-1"></div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setShowRightPanel(!showRightPanel)}
									>
										<PanelRight className="w-4 h-4" />
									</Button>
								</div>
							</div>

							{/* Canvas Area */}
							<div className="flex-1 relative overflow-hidden">
								<SVGPreview />
							</div>
						</div>

						{/* Right Sidebar: Controls */}
						<div
							className={`transition-all duration-300 border-l bg-background flex flex-col ${showRightPanel ? "w-80" : "w-0 opacity-0 overflow-hidden"}`}
						>
							<ControlPanel />
						</div>
					</div>
				) : (
					<div className="h-full w-full flex flex-col bg-background text-foreground">
						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
							className="flex-1 flex flex-col overflow-hidden w-full"
						>
							<div className="border-b px-4 py-2 flex items-center justify-between shrink-0 bg-background z-10 h-14">
								<div className="flex items-center gap-2">
									<Logo className="w-6 h-6" />
									<span className="font-bold truncate">image2svg</span>
								</div>
								<div className="flex items-center gap-1">
									<LanguageSelector />
									<ThemeToggle />
								</div>
							</div>

							<div className="border-b px-4 py-1 flex justify-center bg-muted/20 shrink-0">
								<TabsList className="shrink-0">
									<TabsTrigger value="library">{t("app.library")}</TabsTrigger>
									<TabsTrigger value="editor">{t("app.editor")}</TabsTrigger>
									<TabsTrigger value="preview">{t("app.preview")}</TabsTrigger>
								</TabsList>
							</div>

							<TabsContent
								value="library"
								className="flex-1 overflow-y-auto p-4 space-y-4 m-0 data-[state=inactive]:hidden"
							>
								<UploadZone />
								<div className="border rounded-md h-96">
									<HistorySidebar />
								</div>
							</TabsContent>

							<TabsContent
								value="editor"
								className="flex-1 overflow-hidden flex flex-col m-0 data-[state=inactive]:hidden"
							>
								<ControlPanel />
							</TabsContent>

							<TabsContent
								value="preview"
								className="flex-1 overflow-hidden relative m-0 h-full data-[state=inactive]:hidden"
							>
								<SVGPreview />
							</TabsContent>
						</Tabs>
					</div>
				)}
			</TooltipProvider>
		</I18nProvider>
	);
}
