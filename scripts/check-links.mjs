import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist'); let checked=0; const failures=[];
async function walk(dir){const entries=await fs.readdir(dir,{withFileTypes:true});return(await Promise.all(entries.map(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat();}
const files=await walk(root);
for(const file of files.filter(p=>p.endsWith('.html'))){
  const html=await fs.readFile(file,'utf8');
  const current=new URL('/'+path.relative(root,file).split(path.sep).join('/'),'https://holozz.github.io');
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const value=match[1].replace(/&amp;/g,'&'); if(/^(mailto:|tel:|data:|javascript:)/.test(value))continue;
    const url=new URL(value,current); if(url.origin!==current.origin)continue;
    const relative=decodeURIComponent(url.pathname).replace(/^\//,'');
    let target=path.join(root,relative);
    if(url.pathname.endsWith('/'))target=path.join(target,'index.html');
    try{const stat=await fs.stat(target);if(stat.isDirectory())target=path.join(target,'index.html');await fs.access(target);checked++;}
    catch{failures.push(path.relative(root,file)+' → '+url.pathname);continue;}
    if(url.hash && target.endsWith('.html')){
      const body=await fs.readFile(target,'utf8'); const id=decodeURIComponent(url.hash.slice(1));
      if(!body.includes('id="'+id+'"'))failures.push(path.relative(root,file)+' → missing #'+id);
    }
  }
}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('Verified '+checked+' local links and resources across '+files.filter(p=>p.endsWith('.html')).length+' HTML pages.');
