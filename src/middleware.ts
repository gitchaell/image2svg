import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((_context, next) => {
	// Simple middleware that just proceeds.
	// In 'manual' mode, you might want to handle locale detection here or just rely on your routes.
	// Astro's i18n might still use this to ensure middleware chain exists.
	return next();
});
