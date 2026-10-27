import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
const files=['src/content/posts/qa-reading.zh.md','src/content/posts/qa-reading.en.md','src/content/posts/qa-original.zh.md','src/content/posts/qa-draft.zh.md','src/content/albums/qa-album.json','src/assets/qa-photo.png'];
async function run(args,env={}){await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1',...env}});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(args.join(' ')+' exited '+code)));});}
for(const file of files){try{await fs.access(file);throw new Error('Fixture path already exists: '+file);}catch(e){if(e.code!=='ENOENT')throw e;}}
const header=(kind,slug,key,lang,draft=false)=>'---\ntitle: "'+(lang==='en'?'QA reading template':'临时排版验证：长标题与公式代码表格')+'"\ndescription: "Temporary QA fixture, never published."\nslug: '+slug+'\ntranslationKey: '+key+'\nkind: '+kind+'\nlang: '+lang+'\npubDate: 2026-10-27\ncategory: 学习\ntags: [Java, 双语]\ndraft: '+draft+'\n---\n';
const body='\n## 公式与表格\n\nInline $E=mc^2$.\n\n$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n## Code\n\n\x60\x60\x60java\nSystem.out.println("A long line that must scroll inside its code block without overflowing the mobile page");\n\x60\x60\x60\n';
try{
  await fs.mkdir('src/assets',{recursive:true});
  await fs.copyFile('public/images/avatar.png','src/assets/qa-photo.png');
  await fs.writeFile(files[0],header('articles','qa-reading','qa-reading','zh')+body);
  await fs.writeFile(files[1],header('articles','qa-reading','qa-reading','en')+body);
  await fs.writeFile(files[2],header('notes','qa-original','qa-original','zh')+'\nOriginal only.\n');
  await fs.writeFile(files[3],header('articles','qa-draft','qa-draft','zh',true)+'\nNot public.\n');
  const photo={src:'../../assets/qa-photo.png',alt:{zh:'临时测试照片',en:'Temporary test photo'},caption:{zh:'测试说明',en:'Test caption'}};
  await fs.writeFile(files[4],JSON.stringify({slug:'qa-album',title:{zh:'临时测试相册',en:'Temporary QA album'},description:{zh:'不会发布',en:'Never published'},date:'2026-10-27',draft:false,photos:[photo,photo]}));
  await run(['node_modules/astro/bin/astro.mjs','build']);await run(['scripts/check-links.mjs']);await run(['scripts/browser-check.mjs'],{CONTENT_FIXTURES:'1'});
}finally{for(const file of files)await fs.rm(file,{force:true});await run(['node_modules/astro/bin/astro.mjs','build']);}
