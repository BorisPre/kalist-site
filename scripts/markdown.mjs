// A small Markdown reader for the site's articles. Supported (see AURA.md): front matter, headings with optional
// {#id}, paragraphs, - and 1. lists, > quotes, tables, ---, **bold**, *italic*, `code`, [links](/path), ![images](src)
// and containers:  ::: name arguments  …  :::  rendered by the caller (step cards, notes, calls to action).

export function frontMatter(source){
  const match=source.match(/^---\n([\s\S]*?)\n---\n?/);
  if(!match)return {data:{},body:source};
  const data={};
  for(const line of match[1].split('\n')){
    const hit=line.match(/^([\w-]+):\s*(.*)$/);if(!hit)continue;
    let value=hit[2].trim();
    if(/^\[.*\]$/.test(value))value=value.slice(1,-1).split(',').map(v=>v.trim().replace(/^["']|["']$/g,'')).filter(Boolean);
    else if(/^(["']).*\1$/.test(value))value=value.slice(1,-1);
    data[hit[1]]=value;
  }
  return {data,body:source.slice(match[0].length)};
}

export const slugify=text=>text.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()
  .replace(/&[a-z]+;/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const escapeHtml=text=>String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// options: {lang, url: path => public URL, container: (name, args, innerHtml, innerSource) => html}
export function markdown(source,options={}){
  const {lang='fr',url=p=>p,container=(n,a,inner)=>`<div class="${n}">${inner}</div>`}=options;
  const headings=[];const used=new Set();
  const unique=base=>{let id=base||'section',n=2;while(used.has(id))id=`${base}-${n++}`;used.add(id);return id;};
  const typo=text=>lang==='fr'?text.replace(/ ([:;?!»])/g,' $1').replace(/« /g,'« '):text;
  const link=href=>/^\/(?!\/)/.test(href)?url(href):href;
  function inline(text){
    const codes=[];
    let s=escapeHtml(text).replace(/`([^`]+)`/g,(_,c)=>{codes.push(c);return `\u0000${codes.length-1}\u0000`;});
    s=s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,(_,alt,src)=>`<img src="${link(src)}" alt="${alt}" loading="lazy" decoding="async">`);
    s=s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(_,label,href)=>{
      const out=/^https?:/.test(href);
      return `<a href="${link(href)}"${out?' rel="noopener" target="_blank"':''}>${label}</a>`;
    });
    s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[\s(])\*([^*\s][^*]*)\*/g,'$1<em>$2</em>').replace(/(^|[\s(])_([^_\s][^_]*)_/g,'$1<em>$2</em>');
    s=typo(s);
    return s.replace(/\u0000(\d+)\u0000/g,(_,i)=>`<code>${codes[i]}</code>`);
  }
  const plain=text=>text.replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[*_`]/g,'');

  function blocks(src){
    const lines=src.replace(/\r/g,'').split('\n');const html=[];let i=0;
    const isBlockStart=l=>/^(#{1,4} |:::|> |[-*] |\d+\. |\||---\s*$)/.test(l);
    while(i<lines.length){
      const line=lines[i];
      if(!line.trim()){i++;continue;}
      let m;
      if((m=line.match(/^:::\s*([\w-]+)\s*(.*)$/))){
        const inner=[];i++;let depth=0;
        while(i<lines.length){
          if(/^:::\s*[\w-]+/.test(lines[i]))depth++;
          else if(/^:::\s*$/.test(lines[i])){if(depth===0)break;depth--;}
          inner.push(lines[i]);i++;
        }
        i++;
        const innerSource=inner.join('\n');
        html.push(container(m[1],m[2].trim(),blocks(innerSource),innerSource));continue;
      }
      if((m=line.match(/^(#{1,4}) (.+?)(?:\s*\{#([\w-]+)\})?\s*$/))){
        const level=m[1].length,id=unique(m[3]||slugify(plain(m[2])));
        headings.push({level,id,text:plain(m[2])});
        html.push(`<h${level} id="${id}">${inline(m[2])}</h${level}>`);i++;continue;
      }
      if(/^---\s*$/.test(line)){html.push('<hr>');i++;continue;}
      if(line.startsWith('> ')){
        const quote=[];while(i<lines.length&&lines[i].startsWith('>')){quote.push(lines[i].replace(/^>\s?/,''));i++;}
        html.push(`<blockquote>${blocks(quote.join('\n'))}</blockquote>`);continue;
      }
      if(line.startsWith('|')){
        const rows=[];while(i<lines.length&&lines[i].startsWith('|')){rows.push(lines[i]);i++;}
        const cells=row=>row.replace(/^\||\|\s*$/g,'').split('|').map(c=>c.trim());
        const [head,,...body]=rows;
        html.push(`<div class="table-wrap"><table><thead><tr>${cells(head).map(c=>`<th scope="col">${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map(r=>`<tr>${cells(r).map(c=>`<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
        continue;
      }
      if((m=line.match(/^([-*]|\d+\.) /))){
        const ordered=/\d/.test(m[1]);const items=[];
        while(i<lines.length){
          const item=lines[i].match(/^([-*]|\d+\.) (.*)$/);
          if(item&&(/\d/.test(item[1])===ordered)){items.push(item[2]);i++;continue;}
          if(items.length&&/^\s{2,}\S/.test(lines[i])){items[items.length-1]+=' '+lines[i].trim();i++;continue;}
          break;
        }
        const tag=ordered?'ol':'ul';
        html.push(`<${tag}>${items.map(t=>`<li>${inline(t)}</li>`).join('')}</${tag}>`);continue;
      }
      const para=[];
      while(i<lines.length&&lines[i].trim()&&!(para.length&&isBlockStart(lines[i]))){para.push(lines[i].trim());i++;}
      const text=para.join(' ');
      html.push(/^!\[[^\]]*\]\([^)]+\)$/.test(text)?`<figure>${inline(text)}</figure>`:`<p>${inline(text)}</p>`);
    }
    return html.join('\n');
  }
  const html=blocks(source);
  const text=plain(source.replace(/^:::.*$/gm,'').replace(/^[#>|-]+\s?/gm,''));
  return {html,headings,text,words:text.split(/\s+/).filter(Boolean).length};
}
