import type { APIRoute } from 'astro';
import { getRoutes } from '../lib/content';
export const GET: APIRoute = async ({ site }) => {
  const urls = (await getRoutes()).map(r => new URL((r.path ? '/' + r.path + '/' : '/'),site).href);
  const escape = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(url=>'<url><loc>'+escape(url)+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
