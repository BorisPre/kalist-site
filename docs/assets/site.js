// KALIST site: animations that play when visible (or on tap in the library), library filters, header shadow.
(()=>{
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start=plate=>{
    const video=plate.querySelector('video');if(!video)return;
    if(!video.src)video.src=video.dataset.src;
    video.play().then(()=>plate.classList.add('playing')).catch(()=>{});
  };
  const stop=plate=>{const video=plate.querySelector('video');if(video&&!video.paused)video.pause();};
  // Guide steps and hero plates play while on screen; library tiles wait for a tap or a hover.
  const auto=[...document.querySelectorAll('.plate[data-auto]')];
  if(!still&&'IntersectionObserver'in window){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting?start(e.target):stop(e.target)),{rootMargin:'120px 0px',threshold:.25});
    auto.forEach(p=>io.observe(p));
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest('.plate .play');if(!button)return;
    e.preventDefault();start(button.closest('.plate'));
  });
  if(matchMedia('(hover: hover)').matches&&!still){
    document.querySelectorAll('.move .plate').forEach(p=>{
      p.addEventListener('mouseenter',()=>start(p));p.addEventListener('mouseleave',()=>stop(p));
    });
  }
  // Library filters
  const lib=document.querySelector('[data-library]');
  if(lib){
    const state={cat:'all',level:'all'};
    const count=document.querySelector('[data-count]');
    const apply=()=>{
      let n=0;
      lib.querySelectorAll('.move').forEach(m=>{const show=(state.cat==='all'||m.dataset.cat===state.cat)&&(state.level==='all'||m.dataset.level===state.level);m.hidden=!show;if(show)n++;});
      lib.querySelectorAll('.level-head').forEach(h=>{h.hidden=![...lib.querySelectorAll(`.move[data-level="${h.dataset.level}"]`)].some(m=>!m.hidden);});
      if(count)count.textContent=count.dataset.template.replace('{n}',n);
    };
    document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
      const kind=b.dataset.filter;state[kind]=b.dataset.value;
      document.querySelectorAll(`[data-filter="${kind}"]`).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
      apply();
    }));
  }
  const top=document.querySelector('.top');
  const shade=()=>top&&top.classList.toggle('scrolled',scrollY>8);
  addEventListener('scroll',shade,{passive:true});shade();
})();
