import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { languages } from "@/i18n/ui";

export function LanguageSelector() {
	const [isOpen, setIsOpen] = useState(false);
	const [currentLang, setCurrentLang] = useState("en");
	const dropdownRef = useRef<HTMLDivElement>(null);

	const getPathForLang = (lang: string) => {
		if (typeof window === "undefined") return "/";
		const path = window.location.pathname;
		const segments = path.split("/").filter(Boolean);

		// Remove empty strings and ensure proper segments
		if (segments.length > 0 && Object.keys(languages).includes(segments[0])) {
			segments[0] = lang;
		} else {
			segments.unshift(lang);
		}
		return `/${segments.join("/")}`;
	};

	useEffect(() => {
		const path = window.location.pathname;
		const segments = path.split("/").filter(Boolean);
		if (segments.length > 0 && Object.keys(languages).includes(segments[0])) {
			setCurrentLang(segments[0]);
		} else {
			setCurrentLang("en");
		}

		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative" ref={dropdownRef}>
			<Button
				variant="ghost"
				size="sm"
				className="gap-1 px-2 h-9 font-normal"
				onClick={() => setIsOpen(!isOpen)}
				title="Change language"
			>
				<span className="text-sm uppercase">{currentLang}</span>
				<ChevronDown
					className={`h-3 w-3 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</Button>

			{isOpen && (
				<div className="absolute right-0 top-full mt-2 w-32 rounded-md border bg-popover text-popover-foreground shadow-md outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-200">
					<div className="py-1">
						{Object.entries(languages).map(([lang, label]) => (
							<a
								key={lang}
								href={getPathForLang(lang)}
								className={`block w-full px-4 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors ${
									lang === currentLang ? "font-semibold text-primary" : ""
								}`}
								onClick={() => setIsOpen(false)}
							>
								{label}
							</a>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
