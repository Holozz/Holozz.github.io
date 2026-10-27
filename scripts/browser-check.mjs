import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const root=path.resolve('dist'); const results=path.resolve('test-results');
await fs.mkdir(results,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.xml':'application/xml'};
const server=http.createServer(async(req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  try { const stat=await fs.stat(file); if(stat.isDirectory())file=path.join(file,'index.html'); const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data);}
  catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await fs.readFile(path.join(root,'404.html')));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
let browser;
try{
  browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const sections=['','articles/','notes/','photos/','projects/','about/','archives/','categories/','tags/'];
  let pageCount=0;
  for(const locale of ['', 'en/'])for(const section of sections){
    await page.goto(origin+'/'+locale+section);await page.locator('main h1').waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'),locale?'en':'zh-CN');
    const target=await page.locator('.language-switch').getAttribute('href');assert.equal(target,locale?'/'+section:'/en/'+section);
    const alternate=await page.locator('link[rel="alternate"]').count();assert.equal(alternate,2);
    for(const width of [1440,1024,390,320]){
      await page.setViewportSize({width,height:960});
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
      assert.equal(overflow,false,'Horizontal overflow: '+locale+section+' at '+width);
    }
    pageCount++;
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto(origin+'/');await page.screenshot({path:path.join(results,'home-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.goto(origin+'/');await page.screenshot({path:path.join(results,'home-mobile.png'),fullPage:true});
  await page.locator('.nav-toggle').click();assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'true');
  await page.getByRole('navigation',{name:'主导航'}).getByRole('link',{name:'相册',exact:true}).click();assert.equal(new URL(page.url()).pathname,'/photos/');
  await page.locator('.language-switch').click();assert.equal(new URL(page.url()).pathname,'/en/photos/');assert.equal(await page.evaluate(()=>localStorage.getItem('holozz-language')),'en');
  await page.locator('.nav-toggle').click();await page.keyboard.press('Escape');assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'false');
  await page.goto(origin+'/missing-page/');await page.getByRole('heading',{name:'页面未找到'}).waitFor();await page.getByRole('link',{name:'English home',exact:true}).click();assert.equal(new URL(page.url()).pathname,'/en/');
  const avatar=await page.locator('.avatar').evaluate(img=>img.complete&&img.naturalWidth>0);assert.equal(avatar,true);
  const pins=JSON.parse(await fs.readFile('src/data/github.json','utf8')).projects;
  await page.goto(origin+'/projects/');assert.equal(await page.locator('.project-card').count(),pins.length);
  assert.equal(await page.locator('.project-card h2 a').first().getAttribute('href'),pins[0].url);
  if(process.env.CONTENT_FIXTURES==='1'){
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(origin+'/articles/qa-reading/');assert.equal(await page.locator('.katex').count()>0,true);assert.equal(await page.locator('.prose table').count(),1);
    await page.locator('.toc a').first().click();assert.ok(new URL(page.url()).hash);
    await page.locator('.copy-code').first().click();await page.locator('.copy-feedback').filter({hasText:'已复制'}).waitFor();assert.ok((await page.evaluate(()=>navigator.clipboard.readText())).includes('System.out.println'));
    await page.locator('.language-switch').click();assert.equal(new URL(page.url()).pathname,'/en/articles/qa-reading/');
    await page.goto(origin+'/notes/qa-original/');await page.locator('.language-switch').click();await page.locator('#translation-notice').waitFor({state:'visible'});await page.locator('#translation-notice a').click();assert.equal(new URL(page.url()).pathname,'/notes/qa-original/');
    await page.goto(origin+'/en/categories/'+encodeURIComponent('学习')+'/');await page.locator('.post-preview').first().waitFor();
    await page.goto(origin+'/en/photos/qa-album/');await page.locator('.photo-open').first().click();assert.equal(await page.locator('dialog').evaluate(d=>d.open),true);await page.keyboard.press('ArrowRight');assert.equal(await page.locator('.lightbox-counter').textContent(),'2 / 2');await page.keyboard.press('Escape');assert.equal(await page.locator('dialog').evaluate(d=>d.open),false);
    assert.equal(await page.locator('.photo-open').first().evaluate(e=>e===document.activeElement),true);
    await page.setViewportSize({width:320,height:740});await page.goto(origin+'/articles/qa-reading/');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    const draft=await page.goto(origin+'/articles/qa-draft/');assert.equal(draft.status(),404);
    await page.screenshot({path:path.join(results,'reading-mobile.png'),fullPage:true});
    console.log('Content fixtures: math, code copy, table, TOC, translation, original fallback, taxonomy, lightbox, focus return, draft exclusion passed.');
  }
  assert.deepEqual(errors,[]);console.log('Browser checks passed: '+pageCount+' bilingual pages × 4 widths, navigation, language storage, 404, avatar, pinned projects.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
