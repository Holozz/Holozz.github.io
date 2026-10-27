import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
export default defineConfig({
  site: 'https://holozz.github.io', output: 'static', trailingSlash: 'always',
  i18n: { defaultLocale: 'zh', locales: ['zh', 'en'], routing: { prefixDefaultLocale: false } },
  markdown: { remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex], shikiConfig: { theme: 'github-light' } },
});
