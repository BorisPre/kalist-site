// npm run og — share images (1200 × 630) for every page, in headless Chrome, into assets/og/.
// Run after `npm run build` (it reads data/og-manifest.json), then build again so pages point at them.
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,join,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import config from '../site.config.mjs';
import {openChrome} from './chrome.mjs';
import {escapeHtml as esc} from './markdown.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(await readFile(join(ROOT,'data/og-manifest.json'),'utf8'));
const TYPES={'.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf'};
const logo=await readFile(join(ROOT,'assets/img/icon.svg'),'utf8');
const page=entry=>{
  const home=entry.key==='home'||entry.key==='en';
  const visual=entry.image?`<div class="plate"><img src="/assets/media/${entry.image}-peak.webp"></div>`:home?'':`<div class="phone"><img src="/assets/img/app-${entry.lang}-mouvement.webp"></div>`;
  const tag=entry.lang==='fr'?'Application de calisthenics':'Calisthenics app';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Barlow;src:url('/assets/fonts/barlow.ttf');font-weight:600 900}
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;background:#07070c;color:#f3f1ff;font-family:Inter,-apple-system,'Segoe UI',sans-serif;position:relative}
.bg{position:absolute;inset:0;background:radial-gradient(700px 420px at 92% 10%,rgba(139,92,246,.45),transparent 65%),radial-gradient(500px 300px at 0% 100%,rgba(198,245,104,.12),transparent 70%)}
.photo{position:absolute;inset:0;background:url('/assets/img/hero-1600.webp') 75% 40%/cover}
.photo::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#07070c 0%,rgba(7,7,12,.9) 40%,rgba(7,7,12,.2) 80%)}
.content{position:absolute;left:72px;top:64px;bottom:64px;width:${visual?'640px':home?'700px':'1050px'};display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:16px;font:900 34px/1 Barlow,sans-serif;letter-spacing:.14em}.brand svg{width:58px;height:58px;border-radius:14px}
.eyebrow{margin-top:auto;font:800 20px/1 Inter,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#b9a3ff;margin-bottom:18px}
h1{font:800 ${entry.title.length>60?58:68}px/1.02 Barlow,sans-serif;margin:0;letter-spacing:-.01em}
.foot{margin-top:28px;display:flex;align-items:center;gap:12px;color:#d9d6ec;font:600 22px/1 Inter,sans-serif}.foot i{width:12px;height:12px;border-radius:50%;background:#c6f568}
.plate{position:absolute;right:72px;top:95px;width:440px;height:440px;border-radius:28px;background:#f2f0ed;overflow:hidden;box-shadow:0 30px 80px -20px rgba(139,92,246,.6)}
.plate img{width:100%;height:100%;object-fit:contain}
.phone{position:absolute;right:110px;top:70px;width:280px;height:540px;border-radius:40px;padding:10px;background:linear-gradient(145deg,#2b2940,#0e0e17)}
.phone img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:32px}
</style></head><body>${home?'<div class="photo"></div>':'<div class="bg"></div>'}${visual}
<div class="content"><div class="brand">${logo.replace('<svg ','<svg ')}<span>KALIST</span></div>
<div class="eyebrow">${esc(entry.eyebrow||tag)}</div><h1>${esc(entry.title)}</h1><div class="foot"><i></i>${esc(tag)} · Android & iPhone</div></div></body></html>`;
};
const server=createServer(async(req,res)=>{
  const u=new URL(req.url,'http://x');
  if(u.pathname==='/og'){res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(page(manifest[Number(u.searchParams.get('i'))]));return;}
  try{const body=await readFile(join(ROOT,decodeURIComponent(u.pathname)));res.writeHead(200,{'content-type':TYPES[extname(u.pathname)]??'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end();}
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const chrome=await openChrome({width:1200,height:630});
await mkdir(join(ROOT,'assets/og'),{recursive:true});
try{
  for(let i=0;i<manifest.length;i++){
    await chrome.load(`http://127.0.0.1:${server.address().port}/og?i=${i}`);
    await chrome.evaluate(`Promise.all([document.fonts.ready,...[...document.images].map(i=>i.decode().catch(()=>0))])`);
    await writeFile(join(ROOT,'assets/og',manifest[i].key+'.jpg'),await chrome.screenshot('jpeg',84));
  }
  console.log(`${manifest.length} images de partage écrites dans assets/og/`);
}finally{await chrome.close();server.close();}
