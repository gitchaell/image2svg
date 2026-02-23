import { expect, test } from "vitest";
import { useTranslations } from "@/i18n/utils";

test("useTranslations returns correct string for default lang", () => {
	const t = useTranslations("en");
	expect(t("site.title")).toBe("Astro Template");
});

test("useTranslations returns correct string for other lang", () => {
	const t = useTranslations("es");
	expect(t("site.title")).toBe("Plantilla Astro");
});

test("useTranslations falls back to default lang", () => {
	// @ts-expect-error
	const t = useTranslations("invalid");
	// Assuming we might have missing keys in future, but for now we check a known key.
	// Let's assume 'unknown.key' doesn't exist, it returns undefined in current implementation.
	// The implementation is: return ui[lang][key] || ui[defaultLang][key];

	// Let's test if we pass a lang that doesn't exist (though typescript prevents it, runtime might not)
	// Actually our type is keyof typeof ui.

	expect(t("site.title")).toBe("Astro Template");
});
