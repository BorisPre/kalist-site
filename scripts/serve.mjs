// npm run serve — local preview of docs/ at the same address layout as GitHub Pages (http://localhost:4300/kalist-site/).
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname,join,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import config from '../site.config.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..',config.out);
const TYPES={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.xml':'application/xml','.txt':'text/plain; charset=utf-8',
  '.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.ttf':'font/ttf'};
const port=Number(process.env.PORT||4300);
createServer(async(req,res)=>{
  let path=decodeURIComponent(new URL(req.url,'http://x').pathname);
  if(config.basePath&&!path.startsWith(config.basePath)){res.writeHead(302,{location:config.basePath+'/'});res.end();return;}
  path=path.slice(config.basePath.length)||'/';
  let file=join(ROOT,path);
  try{if((await stat(file)).isDirectory())file=join(file,'index.html');
    const body=await readFile(file);res.writeHead(200,{'content-type':TYPES[extname(file)]??'application/octet-stream'});res.end(body);}
  catch{res.writeHead(404,{'content-type':TYPES['.html']});res.end(await readFile(join(ROOT,'404.html')).catch(()=>'404'));}
}).listen(port,'127.0.0.1',()=>console.log(`Aperçu : http://localhost:${port}${config.basePath}/`));
