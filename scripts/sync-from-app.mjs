// npm run sync — copies what the site reuses from the KALIST app: movement data (FR/EN), animations,
// logo, display font and legal pages. Run it after changing those in the app, then `npm run build`.
import {mkdir,copyFile,writeFile,readFile,readdir,rm} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import config from '../site.config.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const APP=resolve(ROOT,config.appPath);
const DIST=join(APP,'dist');
// The app modules expect a browser; these two stand-ins are all they touch at import time.
globalThis.document??={documentElement:{}};
globalThis.localStorage??={getItem:()=>null,setItem(){}};
const load=path=>import(pathToFileURL(join(DIST,path)).href);
const i18n=await load('i18n.mjs');
const {movements,paths,byId}=await load('data.mjs');
const {howTo}=await load('game/howto.mjs');
const {variationCue}=await load('variation-cues.mjs');
const {musclesOf}=await load('anatomy.mjs');

const LEVELS={fr:['Débutant','Intermédiaire','Avancé'],en:['Beginner','Intermediate','Advanced']};
const MUSCLES={
  chest:['Chest','Pectoraux'],shoulders:['Shoulders','Épaules'],triceps:['Triceps','Triceps'],back:['Back','Dos'],
  biceps:['Biceps','Biceps'],core:['Core','Abdominaux'],hips:['Hip flexors','Fléchisseurs de hanche'],
  legs:['Quadriceps','Quadriceps'],glutes:['Glutes','Fessiers'],calves:['Calves','Mollets'],forearms:['Forearms','Avant-bras']
};
const pick=(values,lang)=>values[lang==='fr'?1:0];

const media=join(ROOT,'assets/media');
await mkdir(media,{recursive:true});
const out=[];
for(const m of movements){
  const entry={id:m.id,category:m.category,level:m.level,equipment:m.equipment,target:m.target,hold:m.hold,muscles:musclesOf(m.id)};
  for(const lang of ['fr','en']){
    i18n.setLanguage(lang);
    const how=howTo(m.id);
    entry[lang]={
      name:i18n.local(m.names),
      category:i18n.t(m.category),
      equipment:i18n.t(m.equipment),
      level:LEVELS[lang][m.level],
      cue:variationCue(m.id)||how.description,
      safety:how.safety,
      muscles:entry.muscles.map(key=>pick(MUSCLES[key],lang))
    };
  }
  const meta=JSON.parse(await readFile(join(DIST,'media/animations',`${m.id}-pro.json`),'utf8'));
  // Key frame for the still: repetitions are timed [start, move, end position, return] and holds [entry, hold, exit, rest].
  const [t0=0,t1=0,t2=0]=meta.timing??[];
  const peak=m.hold?t0+t1/2:t0+t1+t2/2;
  entry.media={peak:`${m.id}-peak.webp`,video:`${m.id}.mp4`,width:meta.width,height:meta.height,peakTime:Math.round(peak*100)/100};
  await copyFile(join(DIST,'media/animations',`${m.id}-pro.mp4`),join(media,`${m.id}.mp4`));
  out.push(entry);
}
const pathData=paths.map(p=>({id:p.id,fr:p.name[1],en:p.name[0],steps:p.steps.filter(id=>byId(id))}));
await mkdir(join(ROOT,'data'),{recursive:true});
await writeFile(join(ROOT,'data/movements.json'),JSON.stringify(out,null,1)+'\n');
await writeFile(join(ROOT,'data/paths.json'),JSON.stringify(pathData,null,1)+'\n');

await mkdir(join(ROOT,'content/legal'),{recursive:true});
for(const file of await readdir(join(DIST,'legal')))if(file.endsWith('.html'))await copyFile(join(DIST,'legal',file),join(ROOT,'content/legal',file));
await mkdir(join(ROOT,'assets/fonts'),{recursive:true});
await copyFile(join(DIST,'assets/display.ttf'),join(ROOT,'assets/fonts/barlow.ttf'));
await copyFile(join(DIST,'assets/icon.svg'),join(ROOT,'assets/img/icon.svg'));
console.log(`${out.length} mouvements, ${pathData.length} parcours, animations et pages légales copiés depuis ${APP}`);
