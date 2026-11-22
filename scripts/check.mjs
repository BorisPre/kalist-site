// npm run check — verifies the built site: one h1 per page, title and description lengths, canonical and hreflang
// pairs, image alt texts, and every internal link, image, video and #anchor. Exit code 1 on errors.
import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,dirname,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import config from '../site.config.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..',config.out);
const errors=[],warnings=[];
async function files(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())out.push(...await files(p));else if(p.endsWith('.html'))out.push(p);}return out;}
const pages=new Map();
for(const file of await files(ROOT)){
  const html=await readFile(file,'utf8');
  const path='/'+relative(ROOT,file).replace(/index\.html$/,'');
  pages.set(path,{file,html,ids:new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]))});
}
const exists=async target=>{try{const s=await stat(join(ROOT,target));return s.isDirectory()?stat(join(ROOT,target,'index.html')).then(()=>true,()=>false):true;}catch{return false;}};
const local=href=>href.startsWith(config.basePath+'/')||(!config.basePath&&href.startsWith('/'));
for(const [path,{html,ids}] of pages){
  const at=`${path} :`;
  const noindex=/name="robots" content="noindex"/.test(html);
  const h1=(html.match(/<h1[\s>]/g)??[]).length;
  if(h1!==1)errors.push(`${at} ${h1} balises h1`);
  const title=html.match(/<title>([^<]*)<\/title>/)?.[1]??'';
  const desc=html.match(/<meta name="description" content="([^"]*)"/)?.[1]??'';
  const decode=t=>t.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  if(!title)errors.push(`${at} pas de <title>`);else if(decode(title).length>70)warnings.push(`${at} titre de ${decode(title).length} caractères (Google en affiche ~60)`);
  if(!noindex){
    if(desc.length<70||decode(desc).length>160)warnings.push(`${at} description de ${decode(desc).length} caractères (visez 70 à 160)`);
    if(!/<link rel="canonical"/.test(html))errors.push(`${at} pas de canonical`);
  }
  for(const m of html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g))if(/<(button|a)\b/.test(m[1]))errors.push(`${at} élément interactif dans un lien : ${m[0].slice(0,80)}`);
  for(const m of html.matchAll(/<img\b[^>]*>/g))if(!/\salt="/.test(m[0]))errors.push(`${at} image sans alt : ${m[0].slice(0,80)}`);
  // hreflang pairs must point back at each other
  for(const m of html.matchAll(/<link rel="alternate" hreflang="(fr|en)" href="([^"]+)"/g)){
    const target=m[2].replace(config.siteUrl,'');
    const other=pages.get(target);
    if(!other){errors.push(`${at} hreflang ${m[1]} vers une page absente ${target}`);continue;}
    if(target!==path&&!other.html.includes(`href="${config.siteUrl}${path}"`))errors.push(`${at} hreflang ${m[1]} sans retour depuis ${target}`);
  }
  for(const m of html.matchAll(/\s(?:href|src|data-src)="([^"]+)"/g)){
    const href=m[1];
    if(href.startsWith('#')){if(href.length>1&&!ids.has(href.slice(1)))errors.push(`${at} ancre absente ${href}`);continue;}
    if(!local(href))continue;
    const [target,anchor]=href.slice(config.basePath.length).split('?')[0].split('#');
    if(!await exists(target)){errors.push(`${at} lien cassé ${href}`);continue;}
    if(anchor){const page=pages.get(target.endsWith('/')||target.endsWith('.html')?target:target+'/');if(page&&!page.ids.has(anchor))errors.push(`${at} ancre absente ${href}`);}
  }
}
for(const w of warnings)console.log('⚠ '+w);
for(const e of errors)console.log('✘ '+e);
console.log(`${pages.size} pages vérifiées : ${errors.length} erreur(s), ${warnings.length} avertissement(s)`);
process.exitCode=errors.length?1:0;
