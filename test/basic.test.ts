import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import IndexLang from "@/pages/[lang]/index.astro";

test("Index page contains title (en)", async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(IndexLang as any, {
		params: { lang: "en" },
	});
	expect(result).toContain("Astro Template");
});

test("Index page contains title (es)", async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(IndexLang as any, {
		params: { lang: "es" },
	});
	expect(result).toContain("Plantilla Astro");
});
