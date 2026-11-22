// Minimal headless Chrome driver (DevTools protocol) for the image scripts: posters.mjs and og.mjs.
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const CHROME=process.env.CHROME_PATH??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export async function openChrome({width=1200,height=630,scale=1}={}){
  const profile=await mkdtemp(join(tmpdir(),'kalist-site-'));
  const chrome=spawn(CHROME,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--hide-scrollbars',
    '--autoplay-policy=no-user-gesture-required',`--user-data-dir=${profile}`,'--remote-debugging-port=0','about:blank'],{stdio:['ignore','ignore','pipe']});
  const browserWs=await new Promise((ok,fail)=>{let log='';chrome.stderr.on('data',c=>{log+=c;const m=log.match(/DevTools listening on (ws:\S+)/);if(m)ok(m[1]);});chrome.on('exit',()=>fail(Error('Chrome a quitté : '+log)));});
  const port=new URL(browserWs).port;
  const target=(await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');
  const ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(ok=>ws.addEventListener('open',ok,{once:true}));
  let id=0;const pending=new Map(),waiters=[];
  ws.addEventListener('message',({data})=>{const msg=JSON.parse(data);
    if(msg.id&&pending.has(msg.id)){const {ok,fail}=pending.get(msg.id);pending.delete(msg.id);msg.error?fail(Error(msg.error.message)):ok(msg.result);}
    else if(msg.method)for(const w of waiters.splice(0))w.method===msg.method?w.ok(msg.params):waiters.push(w);});
  const waitFor=method=>new Promise(ok=>waiters.push({method,ok}));
  const send=(method,params={})=>new Promise((ok,fail)=>{const n=++id;pending.set(n,{ok,fail});ws.send(JSON.stringify({id:n,method,params}));});
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:scale,mobile:false});
  const evaluate=async expression=>{const {result,exceptionDetails}=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(exceptionDetails)throw Error(exceptionDetails.exception?.description??exceptionDetails.text);return result.value;};
  const load=async url=>{const loaded=waitFor('Page.loadEventFired');await send('Page.navigate',{url});await loaded;};
  const screenshot=async(format='jpeg',quality=86)=>Buffer.from((await send('Page.captureScreenshot',{format,quality})).data,'base64');
  const close=async()=>{ws.close();chrome.kill('SIGKILL');await new Promise(r=>setTimeout(r,200));await rm(profile,{recursive:true,force:true}).catch(()=>{});};
  return {send,evaluate,load,screenshot,close};
}
