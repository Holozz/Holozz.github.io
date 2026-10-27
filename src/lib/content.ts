import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './i18n';
import { href } from './i18n';

export type Post = CollectionEntry<'posts'>;
export type Album = CollectionEntry<'albums'>;
export async function getPosts() {
  const posts = (await getCollection('posts')).filter(p => !p.data.draft).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  const routes = new Set<string>(); const translations = new Set<string>();
  for (const p of posts) {
    const route = postHref(p); const key = p.data.kind + ':' + p.data.translationKey + ':' + p.data.lang;
    if (routes.has(route) || translations.has(key)) throw new Error('Duplicate post route or translation: ' + p.id);
    routes.add(route); translations.add(key);
  }
  return posts;
}
export async function getAlbums() { return (await getCollection('albums')).filter(a => !a.data.draft).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf()); }
export function postHref(post: Post) { return href(post.data.lang, post.data.kind + '/' + post.data.slug); }
export function localizedPosts(posts: Post[], lang: Lang) {
  return posts.filter(p => p.data.lang === lang || !posts.some(other => other.data.lang === lang && other.data.kind === p.data.kind && other.data.translationKey === p.data.translationKey));
}
export function taxonomy(posts: Post[], field: 'tags' | 'category') {
  const values = posts.flatMap(p => field === 'tags' ? p.data.tags : (p.data.category ? [p.data.category] : []));
  return [...new Set(values)].sort((a,b) => a.localeCompare(b));
}
export function translatedPost(post: Post, posts: Post[], lang: Lang) { return posts.find(p => p.data.kind === post.data.kind && p.data.translationKey === post.data.translationKey && p.data.lang === lang); }
export interface PageRoute { path: string | undefined; lang: Lang; section: import('./i18n').Section; post?: Post; album?: Album; term?: string; field?: 'tags' | 'category'; }
export async function getRoutes(): Promise<PageRoute[]> {
  const posts = await getPosts(); const albums = await getAlbums();
  const routes: PageRoute[] = [];
  const sections = ['home', 'articles', 'notes', 'photos', 'projects', 'about', 'archives', 'categories', 'tags'] as const;
  for (const lang of ['zh', 'en'] as const) {
    const path = (s: string) => (lang === 'en' ? 'en/' : '') + s;
    for (const section of sections) routes.push({ path: path(section === 'home' ? '' : section).replace(/\/$/, '') || undefined, lang, section });
    for (const album of albums) routes.push({ path: path('photos/' + album.data.slug), lang, section: 'photos', album });
    for (const field of ['tags', 'category'] as const) for (const term of taxonomy(localizedPosts(posts, lang), field)) {
      const section = field === 'tags' ? 'tags' : 'categories';
      routes.push({ path: path(section + '/' + term), lang, section, term, field });
    }
  }
  for (const post of posts) routes.push({ path: (post.data.lang === 'en' ? 'en/' : '') + post.data.kind + '/' + post.data.slug, lang: post.data.lang, section: post.data.kind, post });
  return routes;
}
