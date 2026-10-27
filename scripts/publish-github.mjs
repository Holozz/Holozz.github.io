import { spawnSync } from 'node:child_process';
const owner='Holozz';const name='Holozz.github.io';const repository=owner+'/'+name;
function git(args,input){const r=spawnSync('git',args,{input,encoding:'utf8',env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'never'},timeout:120000});if(r.status!==0)throw new Error('Git operation failed: '+args[0]+' '+(r.stderr||''));return r.stdout.trim();}
if(git(['branch','--show-current'])!=='main')throw new Error('Publish from main only');
if(git(['status','--porcelain']))throw new Error('Commit all project changes before publishing');
const credential=git(['credential','fill'],'protocol=https\nhost=github.com\n\n');
const token=credential.split('\n').find(s=>s.startsWith('password='))?.slice(9);
if(!token)throw new Error('Sign into GitHub locally using Git Credential Manager first');
async function api(endpoint,method='GET',body){
  const r=await fetch('https://api.github.com'+endpoint,{method,headers:{'User-Agent':'Holozz-homepage','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
  const data=await r.json().catch(()=>null);return {status:r.status,ok:r.ok,data};
}
const me=await api('/user');if(!me.ok||me.data.login!==owner)throw new Error('GitHub credential must belong to Holozz');
let repo=await api('/repos/'+repository);
if(repo.status===404){repo=await api('/user/repos','POST',{name,description:'Personal notes, articles, and photographs. / 个人笔记、文章与相册',private:false,auto_init:false});if(!repo.ok)throw new Error('Repository creation failed: '+JSON.stringify(repo.data));console.log('Created public repository '+repository);}
else if(!repo.ok)throw new Error('Repository check failed: '+repo.status);
const remotes=git(['remote']).split('\n');
if(!remotes.includes('origin'))git(['remote','add','origin','https://github.com/'+repository+'.git']);
const remote=git(['remote','get-url','origin']);if(remote!=='https://github.com/'+repository+'.git')throw new Error('Unexpected origin; refusing to push elsewhere');
const pagesBefore=await api('/repos/'+repository+'/pages');
if(pagesBefore.status===404){const p=await api('/repos/'+repository+'/pages','POST',{build_type:'workflow'});if(!p.ok&&p.status!==409)console.log('Pages setup will be retried after the first push: '+p.status);}
console.log(git(['push','-u','origin','main']));
const pages=await api('/repos/'+repository+'/pages');
if(pages.status===404){const p=await api('/repos/'+repository+'/pages','POST',{build_type:'workflow'});if(!p.ok)throw new Error('Enable Pages in Settings → Pages → GitHub Actions: '+JSON.stringify(p.data));}
else if(pages.ok&&pages.data.build_type!=='workflow'){const p=await api('/repos/'+repository+'/pages','PUT',{build_type:'workflow'});if(!p.ok)throw new Error('Pages configuration failed: '+JSON.stringify(p.data));}
else if(!pages.ok)throw new Error('Pages access failed: '+pages.status);
console.log(JSON.stringify({repository:'https://github.com/'+repository,target:'https://holozz.github.io/',commit:git(['rev-parse','HEAD'])}));
