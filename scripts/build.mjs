// npm run build — writes the whole site into docs/ (served by GitHub Pages from main /docs).
// Pages: home, guides, exercise library, blog, legal pages, 404; plus sitemap, RSS, llms.txt and content.json.
import {readFile,writeFile,mkdir,rm,cp,readdir,stat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import config from '../site.config.mjs';
import {STRINGS} from '../src/strings.mjs';
import {markdown,frontMatter,escapeHtml as esc} from './markdown.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const OUT=join(ROOT,config.out);
const LANGS=['fr','en'];
const movements=JSON.parse(await readFile(join(ROOT,'data/movements.json'),'utf8'));
const byId=Object.fromEntries(movements.map(m=>[m.id,m]));
const paths=JSON.parse(await readFile(join(ROOT,'data/paths.json'),'utf8'));
const url=p=>config.basePath+p;
const abs=p=>config.siteUrl+p;
const today=new Date().toISOString().slice(0,10);
const hash=async file=>createHash('sha1').update(await readFile(join(ROOT,file))).digest('hex').slice(0,8);
const V={css:await hash('src/site.css'),js:await hash('src/site.js')};
const home=lang=>lang==='fr'?'/':'/en/';
const other=lang=>lang==='fr'?'en':'fr';

const LOGO=(await readFile(join(ROOT,'assets/img/icon.svg'),'utf8')).replace('<svg ','<svg aria-hidden="true" focusable="false" ').replace(/ width="512" height="512"/,'');
const ICON={
  play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l13-7.5z"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>',
  mail:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M3 6h18v12H3zM3 7l9 6 9-6"/></svg>',
  shield:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6zM8.5 12l2.5 2.5 4.5-5"/></svg>',
  phone:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.5 18.5h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};

// ---------- Content ----------
async function readCollection(lang,kind){
  const dir=join(ROOT,'content',lang,kind);const items=[];
  for(const file of (await readdir(dir)).filter(f=>f.endsWith('.md')).sort()){
    const source=await readFile(join(dir,file),'utf8');
    const {data,body}=frontMatter(source);
    const slug=data.slug||file.replace(/\.md$/,'');
    const base=lang==='fr'?{guides:'/guides/',blog:'/blog/'}[kind]:{guides:'/en/guides/',blog:'/en/blog/'}[kind];
    items.push({...data,lang,kind,slug,body,source,path:`${base}${slug}/`});
  }
  return items.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(a.order??99)-(b.order??99));
}
const content={};
for(const lang of LANGS)content[lang]={guides:await readCollection(lang,'guides'),blog:await readCollection(lang,'blog')};
for(const lang of LANGS)content[lang].guides.sort((a,b)=>Number(a.order??99)-Number(b.order??99));
const all=LANGS.flatMap(l=>[...content[l].guides,...content[l].blog]);
const twin=item=>all.find(x=>x.ref&&x.ref===item.ref&&x.lang!==item.lang);

// ---------- Small pieces ----------
const S=lang=>STRINGS[lang];
const levelChip=(m,lang)=>`<span class="chip lv${m.level}">${esc(m[lang].level)}</span>`;
const targetText=(m,lang)=>m.hold?S(lang).secs(m.target):S(lang).reps(m.target);
function plate(id,lang,{auto=false,eager=false,button=true}={}){
  const m=byId[id];if(!m)throw Error(`Mouvement inconnu : ${id}`);
  const name=m[lang].name;
  const alt=lang==='fr'?`Illustration anatomique du mouvement ${name}`:`Anatomical illustration of the ${name}`;
  return `<div class="plate"${auto?' data-auto':''}><img src="${url(`/assets/media/${m.media.peak}`)}" alt="${esc(alt)}" width="${m.media.width}" height="${m.media.height}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async"><video muted loop playsinline preload="none" data-src="${url(`/assets/media/${m.media.video}`)}" aria-hidden="true"></video>${button?`<button class="play" type="button" aria-label="${esc(S(lang).library.play)} : ${esc(name)}">${ICON.play}</button>`:''}</div>`;
}
function storeCta(lang,{primary=true}={}){
  const s=S(lang).store,{googlePlay,appStore}=config.stores;
  if(googlePlay||appStore)return `<div class="store">${googlePlay?`<a class="btn primary" href="${googlePlay}" rel="noopener">${ICON.phone}${s.googlePlay}</a>`:''}${appStore?`<a class="btn ${googlePlay?'ghost':'primary'}" href="${appStore}" rel="noopener">${ICON.phone}${s.appStore}</a>`:''}</div>`;
  return `<div class="store"><a class="btn ${primary?'primary':'ghost'}" href="mailto:${config.email}?subject=${encodeURIComponent(s.notifySubject)}">${ICON.mail}${s.notify}</a><span class="soon">${s.soon}</span></div>`;
}
function headerCta(lang){
  const s=S(lang).store,{googlePlay,appStore}=config.stores,link=googlePlay||appStore;
  return link?`<a class="btn primary small" href="${link}" rel="noopener">${lang==='fr'?'Télécharger':'Download'}</a>`:`<a class="btn primary small" href="mailto:${config.email}?subject=${encodeURIComponent(s.notifySubject)}">${lang==='fr'?'Être prévenu':'Get notified'}</a>`;
}
const phone=(lang,shot,{tilt=false,eager=false,alt=''}={})=>`<div class="phone${tilt?' tilt':''}"><img src="${url(`/assets/img/app-${lang}-${shot}.webp`)}" alt="${esc(alt)}" width="600" height="1067" ${eager?'':'loading="lazy" '}decoding="async"></div>`;
const crumbs=(lang,items)=>`<ol class="crumbs">${items.map(([label,path],i)=>`<li>${i<items.length-1?`<a href="${url(path)}">${esc(label)}</a>`:`<span aria-current="page">${esc(label)}</span>`}</li>`).join('')}</ol>`;
const crumbsLd=items=>({'@type':'BreadcrumbList',itemListElement:items.map(([name,path],i)=>({'@type':'ListItem',position:i+1,name,item:abs(path)}))});
const readMinutes=words=>Math.max(1,Math.round(words/200));

// FAQ: the "## Questions fréquentes" / "## FAQ" / "## Frequently asked questions" section, one ### per question.
function faqOf(body){
  const section=body.split(/^## /m).find(s=>/^(Questions fréquentes|FAQ|Frequently asked questions)/i.test(s));
  if(!section)return [];
  return section.split(/^### /m).slice(1).map(block=>{const [q,...rest]=block.split('\n');return [q.trim(),rest.join(' ').replace(/\s+/g,' ').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[*_`]/g,'').trim()];}).filter(([q,a])=>q&&a);
}
const faqLd=list=>list.length?{'@type':'FAQPage',mainEntity:list.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}:null;

// ---------- Layout ----------
const ORG={'@type':'Organization','@id':abs('/#org'),name:'KALIST',url:abs('/'),logo:abs('/assets/img/icon-512.png'),email:config.email};
const ogKey=path=>path.replace(/\.html$/,'').replace(/^\/|\/$/g,'').replace(/\//g,'-')||'home';
const ogImage=(path,lang)=>{const key=ogKey(path);return existsSync(join(ROOT,'assets/og',key+'.jpg'))?`/assets/og/${key}.jpg`:`/assets/og/${lang==='fr'?'home':'en'}.jpg`;};
const pages=[];
function layout(page){
  const {lang}=page,s=S(lang);
  const alternates=page.alternates??{[lang]:page.path};
  const switchPath=alternates[other(lang)]??home(other(lang));
  const navLink=(key,path)=>`<a href="${url(path)}"${page.section===key?' aria-current="page"':''}>${s.nav[key]}</a>`;
  const links=`${navLink('guides',s.paths.guides)}${navLink('exercises',s.paths.exercises)}${navLink('blog',s.paths.blog)}<a href="${url(home(lang))}#app">${s.nav.app}</a>`;
  const langLink=`<a class="lang" href="${url(switchPath)}" hreflang="${other(lang)}" lang="${other(lang)}" title="${esc(s.switchLabel)}">${other(lang).toUpperCase()}</a>`;
  const image=abs(page.image??ogImage(page.path,lang));
  const ld=[ORG,{'@type':'WebSite','@id':abs('/#website'),url:abs('/'),name:'KALIST',inLanguage:['fr','en'],publisher:{'@id':abs('/#org')}},...(page.ld??[])].filter(Boolean);
  const legalLinks=[['privacy','/legal/privacy.html'],['terms','/legal/terms.html'],['notice',`/legal/terms.html#${lang==='fr'?'mentions':'legal-notice'}`],['support','/legal/support.html']];
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
${page.noindex?'<meta name="robots" content="noindex">':`<link rel="canonical" href="${abs(page.path)}">`}
${page.noindex?'':Object.entries(alternates).map(([l,p])=>`<link rel="alternate" hreflang="${l}" href="${abs(p)}">`).join('\n')}
${!page.noindex&&alternates.fr?`<link rel="alternate" hreflang="x-default" href="${abs(alternates.fr)}">`:''}
<meta property="og:type" content="${page.ogType??'website'}">
<meta property="og:site_name" content="KALIST">
<meta property="og:locale" content="${s.locale}">
<meta property="og:title" content="${esc(page.ogTitle??page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${abs(page.path)}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#07070c">
${config.googleSiteVerification?`<meta name="google-site-verification" content="${esc(config.googleSiteVerification)}">`:''}
<link rel="icon" href="${url('/assets/img/icon.svg')}" type="image/svg+xml">
<link rel="icon" href="${url('/assets/img/favicon-32.png')}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${url('/assets/img/apple-touch-icon.png')}">
<link rel="preload" href="${url('/assets/fonts/barlow.ttf')}" as="font" type="font/ttf" crossorigin>
${page.preload??''}
<link rel="stylesheet" href="${url('/assets/site.css')}?v=${V.css}">
<link rel="alternate" type="application/rss+xml" title="KALIST" href="${url(lang==='fr'?'/feed.xml':'/en/feed.xml')}">
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':ld}).replace(/</g,'\\u003c')}</script>
</head>
<body>
<a class="skip" href="#main">${s.skip}</a>
<header class="top"><div class="wrap">
<a class="brand" href="${url(home(lang))}" aria-label="KALIST — ${s.home}">${LOGO}<span>KALIST</span></a>
<nav class="nav" aria-label="${s.menu}">${links}${langLink}</nav>
${headerCta(lang)}
<details class="menu"><summary aria-label="${s.menu}"><span></span></summary><nav aria-label="${s.menu}">${links}${langLink}</nav></details>
</div></header>
<main id="main">
${page.html}
</main>
<footer class="site"><div class="wrap">
<div class="foot">
<div><a class="brand" href="${url(home(lang))}">${LOGO}<span>KALIST</span></a><p>${esc(s.tagline)}</p><p><a href="mailto:${config.email}">${config.email}</a></p></div>
<div><h2>${s.nav.guides}</h2><ul>${content[lang].guides.map(g=>`<li><a href="${url(g.path)}">${esc(g.short||g.title)}</a></li>`).join('')}</ul></div>
<div><h2>${s.footer.site}</h2><ul><li><a href="${url(home(lang))}">${s.home}</a></li><li><a href="${url(s.paths.exercises)}">${s.nav.exercises}</a></li><li><a href="${url(s.paths.blog)}">${s.nav.blog}</a></li><li><a href="${url(home(lang))}#app">${s.nav.app}</a></li><li><a href="${url(switchPath)}" hreflang="${other(lang)}" lang="${other(lang)}">${s.switchTo}</a></li></ul></div>
<div><h2>${s.footer.legal}</h2><ul>${legalLinks.map(([k,p])=>`<li><a href="${url(p)}">${s.footer[k]}</a></li>`).join('')}</ul></div>
</div>
<p class="health">${esc(s.health)}</p>
<div class="foot-bottom"><span>© ${new Date().getFullYear()} ${esc(config.publisher)} · ${s.footer.rights}</span><span>KALIST</span></div>
</div></footer>
<script src="${url('/assets/site.js')}?v=${V.js}" defer></script>
</body>
</html>
`;
}
const add=page=>pages.push(page);

// ---------- Containers inside Markdown ----------
function containers(lang,item){
  let step=0;
  return (name,args,inner)=>{
    const s=S(lang);
    if(name==='step'){
      const m=byId[args];if(!m)throw Error(`${item.path} : mouvement inconnu « ${args} »`);step++;
      return `<section class="step" id="${m.id}"><div>${plate(m.id,lang,{auto:true})}</div><div><span class="step-num">${s.guide.step} ${step}</span><h3>${esc(m[lang].name)}</h3><ul class="chips"><li>${levelChip(m,lang)}</li><li><span class="chip">${esc(m[lang].equipment)}</span></li><li><span class="chip lime">${s.guide.target} : ${targetText(m,lang)}</span></li></ul>${inner}<p class="muscles">${s.guide.muscles} : ${esc(m[lang].muscles.join(', '))}</p></div></section>`;
    }
    if(name==='note')return `<div class="note">${inner}</div>`;
    if(name==='cta')return `<div class="in-app"><div><h3>${esc(args||s.guide.inApp)}</h3>${inner||`<p>${s.guide.inAppLead}</p>`}${storeCta(lang)}</div>${phone(lang,'mouvement',{alt:''})}</div>`;
    if(name==='moves'){
      const ids=args.split(',').map(x=>x.trim()).filter(Boolean);
      return `<div class="grid three moves-inline">${ids.map(id=>{const m=byId[id];if(!m)throw Error(`${item.path} : mouvement inconnu « ${id} »`);return `<a class="guide-card" href="${url(s.paths.exercises)}#${id}">${plate(id,lang,{auto:true,button:false})}<h3>${esc(m[lang].name)}</h3><div class="meta">${levelChip(m,lang)}<span class="chip">${targetText(m,lang)}</span></div></a>`;}).join('')}</div>`;
    }
    return `<div class="${esc(name)}">${inner}</div>`;
  };
}

// ---------- Home ----------
for(const lang of LANGS){
  const s=S(lang),c=content[lang];
  const guideCards=c.guides.map(g=>guideCard(g,lang)).join('');
  const showcase=['pushup','pullup','lsit','handstand','front-lever','pistol'];
  const html=`
<section class="hero">
<div class="hero-photo"><img src="${url('/assets/img/hero-1600.webp')}" srcset="${url('/assets/img/hero-960.webp')} 960w, ${url('/assets/img/hero-1600.webp')} 1600w" sizes="100vw" alt="${esc(s.hero.alt)}" width="1600" height="900" fetchpriority="high"></div>
<div class="wrap">
<div>
<span class="eyebrow">${s.hero.eyebrow}</span>
<h1>${esc(s.hero.title)}</h1>
<p class="lead">${esc(s.hero.lead)}</p>
<div class="hero-actions">${storeCta(lang)}</div>
<a href="${url(s.paths.guides)}">${s.hero.secondary} →</a>
</div>
</div>
</section>
<div class="wrap"><div class="stats">${s.stats.map(([n,l])=>`<div><strong>${n}</strong><span>${l}</span></div>`).join('')}</div></div>
<section class="block" id="app"><div class="wrap">
<div class="block-head"><div><span class="eyebrow">${s.features.eyebrow}</span><h2>${s.features.title}</h2></div></div>
<div class="grid four">${s.features.items.map(([t,d],i)=>`<article class="card feature"><span class="num">${i+1}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>
</div></section>
<section class="block band"><div class="wrap">
<div class="block-head"><div><span class="eyebrow">${s.shots.eyebrow}</span><h2>${s.shots.title}</h2></div></div>
<div class="shots">${s.shots.items.map(([shot,cap])=>`<figure>${phone(lang,shot,{alt:cap})}<figcaption>${cap}</figcaption></figure>`).join('')}</div>
</div></section>
<section class="block"><div class="wrap">
<div class="block-head"><div><span class="eyebrow">${s.guidesBlock.eyebrow}</span><h2>${s.guidesBlock.title}</h2><p class="lead">${s.guidesBlock.lead}</p></div><a class="btn ghost" href="${url(s.paths.guides)}">${s.guidesBlock.all}${ICON.arrow}</a></div>
<div class="grid four">${guideCards}</div>
</div></section>
<section class="block band"><div class="wrap">
<div class="block-head"><div><span class="eyebrow">${s.libraryBlock.eyebrow}</span><h2>${s.libraryBlock.title}</h2><p class="lead">${s.libraryBlock.lead}</p></div><a class="btn ghost" href="${url(s.paths.exercises)}">${s.libraryBlock.cta}${ICON.arrow}</a></div>
<div class="grid three">${showcase.map(id=>`<a class="guide-card" href="${url(s.paths.exercises)}#${id}">${plate(id,lang,{auto:true,button:false})}<h3>${esc(byId[id][lang].name)}</h3><div class="meta">${levelChip(byId[id],lang)}<span class="chip">${esc(byId[id][lang].category)}</span></div></a>`).join('')}</div>
</div></section>
<section class="block"><div class="wrap privacy"><div class="shield">${ICON.shield}</div><div><span class="eyebrow">${s.privacy.eyebrow}</span><h2>${s.privacy.title}</h2><p class="lead" style="margin-top:14px">${s.privacy.lead}</p></div></div></section>
${c.blog.length?`<section class="block band"><div class="wrap">
<div class="block-head"><div><span class="eyebrow">${s.blogBlock.eyebrow}</span><h2>${s.blogBlock.title}</h2></div><a class="btn ghost" href="${url(s.paths.blog)}">${s.blogBlock.all}${ICON.arrow}</a></div>
<div class="grid">${c.blog.slice(0,3).map(p=>postCard(p,lang,'h3')).join('')}</div>
</div></section>`:''}
<section class="block"><div class="wrap">
<div class="block-head"><div><h2>${s.faqTitle}</h2></div></div>
<div class="faq">${s.faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
</div></section>
<section class="block band cta-final"><div class="wrap"><h2>${s.finalCta.title}</h2><p class="lead">${s.finalCta.lead}</p>${storeCta(lang)}</div></section>`;
  add({lang,path:home(lang),alternates:{fr:'/',en:'/en/'},section:'home',
    title:lang==='fr'?'KALIST — Application de calisthenics et street workout':'KALIST — Calisthenics app: programs, skills and camera coach',
    description:lang==='fr'?'Application de calisthenics : programmes au poids du corps, 94 mouvements animés, parcours de figures et coach caméra sur votre téléphone.':'Calisthenics app: bodyweight programs, 94 animated movements, skill paths from first pull-up to front lever, and an on-device camera coach.',
    preload:`<link rel="preload" as="image" href="${url('/assets/img/hero-1600.webp')}" imagesrcset="${url('/assets/img/hero-960.webp')} 960w, ${url('/assets/img/hero-1600.webp')} 1600w" imagesizes="100vw" fetchpriority="high">`,
    ld:[{'@type':'MobileApplication','@id':abs('/#app'),name:'KALIST',operatingSystem:'Android, iOS',applicationCategory:'HealthApplication',inLanguage:['fr','en','es','de','zh'],description:s.tagline,publisher:{'@id':abs('/#org')},image:abs('/assets/img/icon-512.png')},faqLd(s.faq)],
    html});
}

function guideCard(g,lang){
  const s=S(lang),p=paths.find(x=>x.id===g.skill);
  const steps=p?p.steps.length:0,last=g.hero||p?.steps.at(-1);
  const levels=p?[...new Set(p.steps.map(id=>byId[id].level))]:[];
  return `<a class="guide-card" href="${url(g.path)}">${plate(last,lang,{button:false})}<div class="meta"><span class="chip lime">${steps} ${s.guide.steps}</span>${levels.length?`<span class="chip">${esc(byId[p.steps[0]][lang].level)} → ${esc(byId[p.steps.at(-1)][lang].level)}</span>`:''}</div><h3>${esc(g.short||g.title)}</h3><p>${esc(g.summary||g.description)}</p></a>`;
}
function postCard(p,lang,tag='h2'){
  const s=S(lang);
  return `<a class="post-card" href="${url(p.path)}">${plate(p.image||'pushup',lang,{button:false})}<div><time datetime="${p.date}">${s.date(p.date)}</time><${tag}>${esc(p.title)}</${tag}><p>${esc(p.description)}</p></div></a>`;
}

// ---------- Guides and blog articles ----------
for(const lang of LANGS){
  const s=S(lang);
  for(const kind of ['guides','blog']){
    for(const item of content[lang][kind]){
      const md=markdown(item.body,{lang,url,container:containers(lang,item)});
      item.md=md;
      const t=twin(item);
      const alternates={[lang]:item.path,...(t?{[t.lang]:t.path}:{})};
      const section=kind==='guides'?'guides':'blog';
      const trail=[[s.home,home(lang)],[s.crumbs[section],s.paths[section]],[item.short||item.title,item.path]];
      const hero=item.hero||item.image||(paths.find(x=>x.id===item.skill)?.steps.at(-1))||'pushup';
      const minutes=readMinutes(md.words);
      const p=paths.find(x=>x.id===item.skill);
      const toc=md.headings.filter(h=>h.level===2);
      const related=kind==='guides'?content[lang].guides.filter(g=>g!==item).slice(0,3):content[lang].guides.slice(0,3);
      const html=`
<header class="page-head"><div class="wrap">
${crumbs(lang,trail)}
<div class="article-hero"><div>
<span class="eyebrow">${kind==='guides'?s.guide.eyebrow:s.blog.eyebrow}</span>
<h1>${esc(item.title)}</h1>
<p class="lead">${esc(item.description)}</p>
<div class="meta-row">${p?`<span class="chip lime">${p.steps.length} ${s.guide.steps}</span>`:''}<span class="chip">${minutes} ${s.guide.read}</span><span class="chip"><span>${s.guide.updated} <time datetime="${item.updated||item.date}">${s.date(item.updated||item.date)}</time></span></span></div>
</div>${plate(hero,lang,{auto:true,eager:true})}</div>
</div></header>
<div class="wrap article">
<article class="prose">${md.html}</article>
<aside>${toc.length>2?`<nav class="toc" aria-label="${s.guide.toc}"><strong>${s.guide.toc}</strong>${toc.map(h=>`<a href="#${h.id}">${esc(h.text)}</a>`).join('')}</nav>`:''}</aside>
</div>
<section class="block band"><div class="wrap">
<div class="block-head"><div><h2>${s.guide.related}</h2></div><a class="btn ghost" href="${url(s.paths.guides)}">${s.guidesBlock.all}${ICON.arrow}</a></div>
<div class="grid three">${related.map(g=>guideCard(g,lang)).join('')}</div>
</div></section>`;
      add({lang,path:item.path,alternates,section,ogType:'article',
        title:`${item.seo_title||item.title} | KALIST`,ogTitle:item.title,description:item.description,
        ld:[{'@type':kind==='guides'?'Article':'BlogPosting',headline:item.title,description:item.description,inLanguage:lang,
          datePublished:item.date,dateModified:item.updated||item.date,mainEntityOfPage:abs(item.path),image:abs(ogImage(item.path,lang)),
          author:{'@type':'Organization',name:'KALIST',url:abs('/')},publisher:{'@id':abs('/#org')},keywords:[item.keyword,...(item.tags||[])].filter(Boolean).join(', ')},
          crumbsLd(trail),faqLd(faqOf(item.body))],
        html,item});
    }
  }
}

// ---------- Guide and blog indexes ----------
for(const lang of LANGS){
  const s=S(lang);
  const gp=s.paths.guides,bp=s.paths.blog;
  const gTrail=[[s.home,home(lang)],[s.crumbs.guides,gp]],bTrail=[[s.home,home(lang)],[s.crumbs.blog,bp]];
  add({lang,path:gp,alternates:{fr:'/guides/',en:'/en/guides/'},section:'guides',
    title:lang==='fr'?'Guides de progression calisthenics | KALIST':'Calisthenics progression guides | KALIST',
    description:lang==='fr'?'Sept progressions complètes et animées : première traction, muscle-up, front lever, planche, handstand, L-sit et pistol squat.':'Seven complete, animated progressions: first pull-up, muscle-up, front lever, planche, handstand, L-sit and pistol squat.',
    ld:[crumbsLd(gTrail),{'@type':'CollectionPage',name:s.guidesBlock.title,inLanguage:lang,url:abs(gp)}],
    html:`<header class="page-head"><div class="wrap">${crumbs(lang,gTrail)}<span class="eyebrow">${s.guidesBlock.eyebrow}</span><h1>${lang==='fr'?'Guides de progression calisthenics':'Calisthenics progression guides'}</h1><p class="lead">${s.guidesBlock.lead}</p></div></header>
<section class="block"><div class="wrap"><div class="grid four">${content[lang].guides.map(g=>guideCard(g,lang)).join('')}</div></div></section>`});
  add({lang,path:bp,alternates:{fr:'/blog/',en:'/en/blog/'},section:'blog',
    title:lang==='fr'?'Blog calisthenics et street workout | KALIST':'Calisthenics blog: advice and programs | KALIST',
    description:lang==='fr'?'Conseils de calisthenics pour débuter, s’entraîner à la maison sans matériel et progresser au poids du corps.':'Calisthenics advice to get started, train at home without equipment and progress with bodyweight training.',
    ld:[crumbsLd(bTrail),{'@type':'Blog',name:s.blog.eyebrow,inLanguage:lang,url:abs(bp),publisher:{'@id':abs('/#org')}}],
    html:`<header class="page-head"><div class="wrap">${crumbs(lang,bTrail)}<span class="eyebrow">${s.blogBlock.eyebrow}</span><h1>${s.blog.eyebrow}</h1><p class="lead">${esc(lang==='fr'?'Débuter, s’entraîner à la maison, choisir ses exercices : des conseils concrets pour progresser au poids du corps.':'Getting started, training at home, choosing your exercises: practical advice to progress with bodyweight training.')}</p></div></header>
<section class="block"><div class="wrap"><div class="grid">${content[lang].blog.map(p=>postCard(p,lang)).join('')}</div></div></section>`});
}

// ---------- Exercise library ----------
for(const lang of LANGS){
  const s=S(lang),L=s.library,path=s.paths.exercises;
  const trail=[[s.home,home(lang)],[s.crumbs.exercises,path]];
  const cats=[...new Set(movements.map(m=>m.category))];
  const guideFor=id=>{const p=paths.find(x=>x.steps.includes(id));const g=p&&content[lang].guides.find(x=>x.skill===p.id);return g;};
  const levelNames=[0,1,2].map(l=>movements.find(m=>m.level===l)[lang].level);
  const cards=[0,1,2].map(level=>`<div class="level-head" data-level="${level}"><h2>${esc(levelNames[level])}</h2><span class="chip">${movements.filter(m=>m.level===level).length} ${L.count}</span></div>`+
    movements.filter(m=>m.level===level).map(m=>{const g=guideFor(m.id);return `<article class="move" id="${m.id}" data-cat="${m.category}" data-level="${m.level}">${plate(m.id,lang)}<h3>${esc(m[lang].name)}</h3><div class="meta">${levelChip(m,lang)}<span class="chip">${esc(m[lang].category)}</span><span class="chip">${esc(m[lang].equipment)}</span></div><p>${esc(m[lang].cue)}</p><p class="muscles">${L.target} : ${targetText(m,lang)} · ${s.guide.muscles} : ${esc(m[lang].muscles.join(', '))}</p>${g?`<a class="more" href="${url(g.path)}">${L.partOf} : ${esc(g.short||g.title)} →</a>`:''}</article>`;}).join('')).join('');
  add({lang,path,alternates:{fr:'/exercices/',en:'/en/exercises/'},section:'exercises',
    title:lang==='fr'?'Exercices de calisthenics : 94 mouvements animés | KALIST':'Calisthenics exercises: 94 animated movements | KALIST',
    description:lang==='fr'?'Liste des exercices de calisthenics du débutant à l’avancé : pompes, tractions, dips, gainage, jambes, anneaux et figures, avec animation et muscles travaillés.':'Calisthenics exercise list from beginner to advanced: push-ups, pull-ups, dips, core, legs, rings and skills, each with an animation and the muscles worked.',
    ld:[crumbsLd(trail),{'@type':'CollectionPage',name:s.libraryBlock.title,inLanguage:lang,url:abs(path)}],
    html:`<header class="page-head"><div class="wrap">${crumbs(lang,trail)}<span class="eyebrow">${s.libraryBlock.eyebrow}</span><h1>${esc(lang==='fr'?'Exercices de calisthenics : 94 mouvements animés':'Calisthenics exercises: 94 animated movements')}</h1><p class="lead">${esc(s.libraryBlock.lead)}</p></div></header>
<section class="block" style="padding-top:40px"><div class="wrap">
<div role="group" aria-label="${L.category}" class="filters"><button type="button" data-filter="cat" data-value="all" aria-pressed="true">${L.all}</button>${cats.map(c=>`<button type="button" data-filter="cat" data-value="${c}" aria-pressed="false">${esc(movements.find(m=>m.category===c)[lang].category)}</button>`).join('')}</div>
<div role="group" aria-label="${L.level}" class="filters"><button type="button" data-filter="level" data-value="all" aria-pressed="true">${L.allLevels}</button>${levelNames.map((n,i)=>`<button type="button" data-filter="level" data-value="${i}" aria-pressed="false">${esc(n)}</button>`).join('')}</div>
<p class="result-count" data-count data-template="{n} ${L.count}" aria-live="polite">${movements.length} ${L.count}</p>
<div class="library" data-library>${cards}</div>
</div></section>`});
}

// ---------- Legal pages (same text as in the app) ----------
for(const file of ['privacy','terms','support']){
  const raw=await readFile(join(ROOT,'content/legal',file+'.html'),'utf8');
  const title=raw.match(/<title>([^<]+)<\/title>/)[1];
  const articles=[...raw.matchAll(/<article[\s\S]*?<\/article>/g)].map((m,i)=>(i?m[0].replace(/<(\/?)h1>/g,'<$1h2 class="h1">').replace(/<h2 class="h1">/,'<h2 class="h1">'):m[0]).replace(/href="\.\/(\w+)\.html/g,(_,f)=>`href="${url('/legal/'+f+'.html')}`)).join('\n');
  const desc={privacy:'Politique de confidentialité de KALIST : données conservées sur l’appareil, caméra analysée localement, abonnements via RevenueCat.',terms:'Conditions d’utilisation et mentions légales de KALIST, application de calisthenics éditée par Boris Prempain — EI.',support:'Assistance KALIST : une question, un problème ou une idée ? Écrivez-nous à kalist.support@gmail.com, nous vous répondons.'}[file];
  add({lang:'fr',path:`/legal/${file}.html`,alternates:{fr:`/legal/${file}.html`},title,description:desc,
    html:`<div class="wrap legal"><p class="langs"><a href="#fr">Français</a> · <a href="#en">English</a></p>${articles}</div>`});
}

// ---------- 404 ----------
add({lang:'fr',path:'/404.html',noindex:true,title:'Page introuvable | KALIST',description:'Page introuvable.',
  html:`<section class="block"><div class="wrap" style="text-align:center"><h1>404</h1><p class="lead" style="margin:18px auto">${S('fr').notFound.lead}<br>${S('en').notFound.lead}</p><div class="store" style="justify-content:center"><a class="btn primary" href="${url('/')}">${S('fr').notFound.back}</a><a class="btn ghost" href="${url('/en/')}">${S('en').notFound.back}</a></div></div></section>`});

// ---------- Write ----------
await rm(OUT,{recursive:true,force:true});
await mkdir(join(OUT,'assets'),{recursive:true});
for(const dir of ['img','media','fonts','og'])if(existsSync(join(ROOT,'assets',dir)))await cp(join(ROOT,'assets',dir),join(OUT,'assets',dir),{recursive:true});
await cp(join(ROOT,'src/site.css'),join(OUT,'assets/site.css'));
await cp(join(ROOT,'src/site.js'),join(OUT,'assets/site.js'));
await writeFile(join(OUT,'.nojekyll'),'');
for(const page of pages){
  const file=page.path.endsWith('/')?join(OUT,page.path,'index.html'):join(OUT,page.path);
  await mkdir(dirname(file),{recursive:true});
  await writeFile(file,layout(page));
}
const indexed=pages.filter(p=>!p.noindex);
const lastmod=p=>p.item?.updated||p.item?.date||today;
await writeFile(join(OUT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${indexed.map(p=>`<url><loc>${abs(p.path)}</loc><lastmod>${lastmod(p)}</lastmod>${Object.keys(p.alternates??{}).length>1?Object.entries(p.alternates).map(([l,a])=>`<xhtml:link rel="alternate" hreflang="${l}" href="${abs(a)}"/>`).join('')+`<xhtml:link rel="alternate" hreflang="x-default" href="${abs(p.alternates.fr)}"/>`:''}</url>`).join('\n')}
</urlset>
`);
await writeFile(join(OUT,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);
for(const lang of LANGS){
  const items=pages.filter(p=>p.item&&p.lang===lang).sort((a,b)=>(b.item.date||'').localeCompare(a.item.date||''));
  const feed=`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>KALIST — ${lang==='fr'?'Calisthenics : guides et blog':'Calisthenics guides and blog'}</title>
<link>${abs(home(lang))}</link><description>${esc(S(lang).tagline)}</description><language>${lang}</language>
<atom:link href="${abs(lang==='fr'?'/feed.xml':'/en/feed.xml')}" rel="self" type="application/rss+xml"/>
${items.map(p=>`<item><title>${esc(p.item.title)}</title><link>${abs(p.path)}</link><guid>${abs(p.path)}</guid><pubDate>${new Date(p.item.date).toUTCString()}</pubDate><description>${esc(p.item.description)}</description></item>`).join('\n')}
</channel></rss>
`;
  await mkdir(join(OUT,home(lang)),{recursive:true});
  await writeFile(join(OUT,lang==='fr'?'feed.xml':'en/feed.xml'),feed);
}
// Structured content for AI agents (AURA) and for llms.txt readers.
const articles=pages.filter(p=>p.item).map(p=>({lang:p.lang,type:p.item.kind==='guides'?'guide':'article',title:p.item.title,description:p.item.description,keyword:p.item.keyword||'',tags:p.item.tags||[],url:abs(p.path),translation:Object.entries(p.alternates).filter(([l])=>l!==p.lang).map(([,a])=>abs(a))[0]||null,date:p.item.date,updated:p.item.updated||p.item.date,markdown:p.item.body.trim()}));
await writeFile(join(OUT,'content.json'),JSON.stringify({site:abs('/'),generated:today,app:'KALIST',articles,exercises:movements.map(m=>({id:m.id,url_fr:abs(`/exercices/#${m.id}`),url_en:abs(`/en/exercises/#${m.id}`),...Object.fromEntries(LANGS.map(l=>[l,{name:m[l].name,level:m[l].level,category:m[l].category,equipment:m[l].equipment,cue:m[l].cue,muscles:m[l].muscles,target:targetText(m,l)}]))}))},null,1));
const line=p=>`- [${p.item?.title??p.title.replace(/ \| KALIST$/,'')}](${abs(p.path)}): ${p.description}`;
await writeFile(join(OUT,'llms.txt'),`# KALIST

> ${S('en').tagline} ${S('fr').tagline}

KALIST is a calisthenics app for Android and iPhone (French, English, Spanish, German, Simplified Chinese). Camera analysis runs on the device; no account, ads or tracking. Publisher: ${config.publisher}, contact ${config.email}. Structured content: ${abs('/content.json')}

## Guides (FR)
${pages.filter(p=>p.item?.kind==='guides'&&p.lang==='fr').map(line).join('\n')}

## Guides (EN)
${pages.filter(p=>p.item?.kind==='guides'&&p.lang==='en').map(line).join('\n')}

## Blog
${pages.filter(p=>p.item?.kind==='blog').map(line).join('\n')}

## Reference
${pages.filter(p=>['exercises'].includes(p.section)&&!p.item).map(line).join('\n')}
`);
await writeFile(join(ROOT,'data/og-manifest.json'),JSON.stringify(pages.filter(p=>!p.noindex).map(p=>({key:ogKey(p.path),lang:p.lang,title:p.ogTitle??p.title.replace(/ \| KALIST$/,'').replace(/^KALIST — /,''),eyebrow:p.item?(p.item.kind==='guides'?S(p.lang).guide.eyebrow:S(p.lang).blog.eyebrow):p.section==='exercises'?S(p.lang).libraryBlock.eyebrow:'',image:p.item?(p.item.hero||p.item.image||paths.find(x=>x.id===p.item.skill)?.steps.at(-1)):null})),null,1));
const size=async dir=>{let t=0;for(const e of await readdir(dir,{withFileTypes:true})){const f=join(dir,e.name);t+=e.isDirectory()?await size(f):(await stat(f)).size;}return t;};
console.log(`${pages.length} pages écrites dans ${config.out}/ (${Math.round(await size(OUT)/1e6)} Mo), ${indexed.length} dans le sitemap`);
