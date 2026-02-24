import { type defaultLang, ui } from "@/i18n/ui";
import { createContext, useCallback, useContext } from "react";

type Lang = keyof typeof ui;
type Keys = keyof (typeof ui)[typeof defaultLang];

const I18nContext = createContext<Lang>("en");

export function I18nProvider({
	children,
	lang,
}: { children: React.ReactNode; lang: Lang }) {
	return <I18nContext.Provider value={lang}>{children}</I18nContext.Provider>;
}

export function useI18n() {
	const lang = useContext(I18nContext);

	return useCallback(
		function t(key: Keys) {
			const translation = ui[lang]?.[key] || ui["en"][key];
			return translation || key;
		},
		[lang],
	);
}
