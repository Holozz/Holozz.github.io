import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    translationKey: z.string().min(1),
    kind: z.enum(['articles', 'notes']),
    lang: z.enum(['zh', 'en']),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().min(1).regex(/^[^\/#?]+$/).optional(),
    tags: z.array(z.string().min(1).regex(/^[^\/#?]+$/)).default([]),
    draft: z.boolean().default(true),
  }),
});
const albums = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/albums' }),
  schema: ({ image }) => z.object({
    title: z.object({ zh: z.string(), en: z.string() }),
    description: z.object({ zh: z.string(), en: z.string() }),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    date: z.coerce.date(),
    draft: z.boolean().default(true),
    photos: z.array(z.object({
      src: image(),
      alt: z.object({ zh: z.string().min(1), en: z.string().min(1) }),
      caption: z.object({ zh: z.string(), en: z.string() }).optional(),
    })).min(1),
  }),
});
export const collections = { posts, albums };
