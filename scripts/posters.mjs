// npm run posters — one still per movement at its key position (top of the pull-up, held L-sit…), taken from the
// animation itself in headless Chrome. Run after `npm run sync`. Writes assets/media/<id>-peak.webp.
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {openChrome} from './chrome.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const MEDIA=join(ROOT,'assets/media');
const movements=JSON.parse(await readFile(join(ROOT,'data/movements.json'),'utf8'));
const server=createServer(async(req,res)=>{if(req.url==='/'){res.writeHead(200,{'content-type':'text/html'});res.end('<!doctype html><title>posters</title>');return;}try{const body=await readFile(join(MEDIA,decodeURIComponent(new URL(req.url,'http://x').pathname)));res.writeHead(200,{'content-type':'video/mp4'});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const base=`http://127.0.0.1:${server.address().port}`;
const chrome=await openChrome({width:800,height:800});
try{
  await chrome.load(base+'/');
  for(const m of movements){
    const data=await chrome.evaluate(`(async()=>{
      const blob=await (await fetch('/${m.media.video}')).blob();
      const v=document.createElement('video');v.muted=true;v.src=URL.createObjectURL(blob);
      await new Promise((ok,no)=>{v.onloadeddata=ok;v.onerror=()=>no(Error('video'));});
      v.currentTime=Math.min(${m.media.peakTime},v.duration-0.05);
      await new Promise(ok=>v.onseeked=ok);
      const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);
      URL.revokeObjectURL(v.src);
      return c.toDataURL('image/webp',0.82).split(',')[1];
    })()`);
    await writeFile(join(MEDIA,m.media.peak),Buffer.from(data,'base64'));
  }
  console.log(`${movements.length} images clés écrites dans assets/media/`);
}finally{await chrome.close();server.close();}
