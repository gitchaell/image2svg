# Astro Template (v1.0.0)

This repository provides an optimized starter template for web projects built with [Astro v5.2.5](https://astro.build/). Designed for developers seeking an efficient workflow and exceptional performance right from the start.

## 🚀 Advanced Features

* **Astro v5.2.5:** Utilizes the latest Astro features for optimized performance.
* **TypeScript v5.7.3:** Fully typed for robust development.
* **Tailwind CSS v4.0.4:** For responsive and agile design.
* **Biome.js:** Replaced ESLint/Prettier/Stylelint for fast, unified linting and formatting.
* **i18n System:** Custom `[lang]` routing with key-based translations (`src/i18n`).
* **Modern Fonts:** Pre-configured **Geist Sans**, **Geist Mono**, **Google Sans**, and **Google Sans Code**.
* **Theme Switcher:** Built-in Dark/Light mode toggle with persistence.
* **Testing Ready:** Vitest for unit tests, Playwright for E2E tests.
* **Semantic Release:** Automated versioning and package publishing.
* **PWA & Sitemap:** Integrated `@vite-pwa/astro` and `@astrojs/sitemap`.
* **Icons:** `@lucide/astro` for beautiful, tree-shakable icons.

## 🛠️ Usage Guide

### Internationalization (i18n)

The template uses a folder-based strategy with a centralized translation object.

1.  **Add Languages:** Update `src/i18n/ui.ts` to include your new language code and name.
2.  **Add Translations:** Add your key-value pairs to the `ui` object in `src/i18n/ui.ts`.
3.  **Use in Pages:**
    ```ts
    import { useTranslations } from "@/i18n/utils";
    // inside getStaticPaths or component
    const t = useTranslations(lang);
    <h1>{t('site.title')}</h1>
    ```

### Fonts & Typography

Fonts are locally hosted in `public/fonts` and configured in `src/styles/fonts.css`.

*   **Sans Serif:** `Geist Sans`, `Google Sans` (fallback to system fonts).
*   **Monospace:** `Google Sans Code`, `Geist Mono` (fallback to system monospace).

Tailwind is configured to use these by default for `font-sans` and `font-mono`.

### Theme Switcher

The `ThemeToggle` component handles light/dark mode. It persists preference to `localStorage` and respects system settings. Use Tailwind's `dark:` variant to style dark mode elements.

```html
<div class="bg-white dark:bg-zinc-900 text-black dark:text-white">
  Content
</div>
```

## 📦 Commands

* `npm run dev`: Starts the Astro development server.
* `npm run build`: Builds the project for production.
* `npm run preview`: Previews the production build.
* `npm run format`: Formats code using Biome.
* `npm run lint`: Lints code using Biome.
* `npm run check`: Runs Biome check (lint + format).
* `npm run test`: Runs unit tests with Vitest.
* `npm run test:e2e`: Runs E2E tests with Playwright.

## Author

**Michaell Alavedra**

* Email: f.michaell.a.m@gmail.com
* Website: [https://michaellalavedra.com](https://michaellalavedra.com)
* Repository: [https://github.com/gitchaell/astro-template](https://github.com/gitchaell/astro-template)

## License

[MIT License](LICENSE)
