(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const dialog = document.querySelector("#brand-dialog");
  const content = document.querySelector("#dialog-content");
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#mobile-menu");
  const hero = document.querySelector(".hero");
  const journey = document.querySelector(".journey");
  let returnFocus = null;
  let lenis = null;
  let frame = 0;
  const care = {
    puppy: { title:"Primeiros passos", intro:"Um começo acompanhado de perto, com tempo para conhecer seu pet e acolher suas dúvidas.", services:["Primeira consulta","Acompanhamento do desenvolvimento","Orientação sobre vacinação"], label:"Primeiros passos" },
    adult: { title:"Vida adulta", intro:"Cuidado atento à rotina, aos hábitos e às necessidades de quem faz parte da sua família.", services:["Consultas de rotina","Cuidados preventivos","Acompanhamento individual"], label:"Vida adulta" },
    senior: { title:"Melhor idade", intro:"Atenção aos detalhes e um olhar próximo para viver cada fase com carinho.", services:["Acompanhamento contínuo","Avaliação das necessidades do pet","Orientação para a rotina"], label:"Melhor idade" }
  };
  const arrow = '<svg aria-hidden="true"><use href="#arrow"></use></svg>';
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
  function closeMenu() { menu.hidden = true; menuButton.setAttribute("aria-expanded","false"); menuButton.setAttribute("aria-label","Abrir menu"); }
  menuButton.addEventListener("click", () => { const expanded = menuButton.getAttribute("aria-expanded")==="true"; menu.hidden=expanded; menuButton.setAttribute("aria-expanded",String(!expanded)); menuButton.setAttribute("aria-label",expanded?"Abrir menu":"Fechar menu"); });
  document.addEventListener("keydown", event => { if(event.key==="Escape") closeMenu(); });
  document.addEventListener("click", event => {
    if(!event.target.closest(".site-header")) closeMenu();
    const link=event.target.closest("a[href]");
    if(link) closeMenu();
    const trigger=event.target.closest("[data-open]");
    if(!trigger) return;
    closeMenu();
    if(!dialog.open) returnFocus=trigger;
    renderDialog(trigger.dataset.open, trigger.dataset.care);
  });
  function renderDialog(kind, phase) {
    if(kind==="care") {
      const item=care[phase] || care.adult;
      content.innerHTML='<p class="dialog-eyebrow">Em todas as fases</p><h2 id="dialog-title">'+item.title+'</h2><p>'+item.intro+'</p><ul class="care-list">'+item.services.map(service=>"<li>"+service+"</li>").join("")+'</ul><button type="button" class="button" data-open="booking" data-care="'+(phase||"adult")+'">Agendar consulta '+arrow+'</button>';
    } else if(kind==="guide") {
      content.innerHTML='<p class="dialog-eyebrow">Um cuidado para cada momento</p><h2 id="dialog-title">Em qual fase está seu pet?</h2><p>Escolha uma fase para conhecer os cuidados.</p>'+Object.entries(care).map(([key,item])=>'<button class="dialog-choice" type="button" data-open="care" data-care="'+key+'">'+item.title+'<small>'+item.services[0]+'</small></button>').join("");
    } else if(kind==="contact") {
      const channels={
        location:{ title:"Como chegar", message:"O endereço da clínica ainda não foi adicionado a esta prévia." }
      };
      const channel=channels[phase] || { title:"Converse com a equipe", message:"Os canais oficiais da clínica ainda não foram adicionados a esta prévia." };
      content.innerHTML='<p class="dialog-eyebrow">Fale com a gente</p><h2 id="dialog-title">'+channel.title+'</h2><p>'+channel.message+'</p><p class="prototype-note">Esta é uma demonstração. Nenhuma mensagem é enviada.</p>';
    } else if(kind==="privacy") {
      content.innerHTML='<p class="dialog-eyebrow">Sobre esta prévia</p><h2 id="dialog-title">Privacidade</h2><p>Os dados digitados no agendamento demonstrativo não são enviados nem armazenados. Eles são usados apenas para mostrar o resumo na tela.</p><p>A política de privacidade da clínica será incluída com as informações oficiais do negócio.</p>';
    } else if(kind==="about") {
      content.innerHTML='<p class="dialog-eyebrow">Nosso jeito de cuidar</p><h2 id="dialog-title">Carinho também está nos detalhes.</h2><p>Um olhar atento para cada pet. Um atendimento que começa pela escuta, respeita seu tempo e acompanha cada fase da vida.</p><div class="about-signal"><svg aria-hidden="true"><use href="#paw"></use></svg>Cuidado próximo. Em todos os momentos.</div><button class="button" type="button" data-open="guide">Conheça os cuidados '+arrow+'</button>';
    } else {
      content.innerHTML='<p class="dialog-eyebrow">Vamos conhecer seu pet</p><h2 id="dialog-title">Agendar consulta</h2><p>Conte um pouco sobre vocês.</p><form id="booking-form"><label class="field">Seu nome<input name="name" autocomplete="given-name" maxlength="80" required placeholder="Como podemos chamar você?"></label><label class="field">Nome do pet<input name="pet" maxlength="80" required placeholder="O nome de quem você ama"></label><label class="field">Fase do pet<select name="phase">'+Object.entries(care).map(([key,item])=>'<option value="'+key+'" '+(key===phase?"selected":"")+'>'+item.label+'</option>').join("")+'</select></label><button type="submit" class="button">Preparar agendamento '+arrow+'</button><p class="prototype-note">Demonstração do protótipo. Nenhum dado é enviado.</p></form>';
    }
    if(!dialog.open) dialog.showModal();
    else dialog.scrollTop=0;
    document.querySelector(".dialog-close").focus({preventScroll:true});
  }
  document.querySelector(".dialog-close").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",event=>{ if(event.target!==dialog) return; const box=dialog.getBoundingClientRect(); if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom) dialog.close(); });
  dialog.addEventListener("close",()=>{ document.body.style.overflow=""; if(returnFocus?.isConnected) returnFocus.focus({preventScroll:true}); });
  new MutationObserver(()=>{ document.body.style.overflow=dialog.open?"hidden":""; if(lenis){ if(dialog.open) lenis.stop(); else lenis.start(); } }).observe(dialog,{attributes:true,attributeFilter:["open"]});
  content.addEventListener("submit",event=>{
    if(event.target.id!=="booking-form") return;
    event.preventDefault();
    const data=new FormData(event.target);
    const phase=care[data.get("phase")] || care.adult;
    content.innerHTML='<p class="dialog-eyebrow">Prévia do pedido</p><h2 id="dialog-title">Tudo anotado, '+escapeHTML(data.get("name"))+'.</h2><p>Este é o resumo do cuidado para '+escapeHTML(data.get("pet"))+'.</p><dl class="confirmation"><dt>Pet</dt><dd>'+escapeHTML(data.get("pet"))+'</dd><dt>Fase</dt><dd>'+phase.label+'</dd></dl><p class="prototype-note">Esta é uma demonstração. A consulta não foi agendada e nenhum dado foi enviado ou salvo.</p><button class="button" type="button" data-close>Concluir</button>';
    content.querySelector("[data-close]").addEventListener("click",()=>dialog.close());
  });
  hero.addEventListener("pointermove",event=>{
    if(reduceMotion.matches || window.innerWidth<1024 || event.pointerType==="touch") return;
    const box=hero.getBoundingClientRect();
    hero.style.setProperty("--pointer-x",((event.clientX-box.left)/box.width-.5).toFixed(3));
    hero.style.setProperty("--pointer-y",((event.clientY-box.top)/box.height-.5).toFixed(3));
  },{passive:true});
  hero.addEventListener("pointerleave",()=>{hero.style.setProperty("--pointer-x",0);hero.style.setProperty("--pointer-y",0);},{passive:true});
  function updateScroll() {
    frame=0;
    const box=journey.getBoundingClientRect();
    const inCare=box.top<window.innerHeight*.35;
    document.querySelectorAll(".desktop-nav a").forEach(link=>{const active=(link.hash==="#cuidados")===inCare;link.classList.toggle("active",active);if(active)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");});
  }
  function requestScrollUpdate(){if(!frame) frame=requestAnimationFrame(updateScroll);}
  window.addEventListener("scroll",requestScrollUpdate,{passive:true});
  window.addEventListener("resize",()=>{if(window.innerWidth>=1024)closeMenu();requestScrollUpdate();},{passive:true});
  reduceMotion.addEventListener("change",requestScrollUpdate);
  updateScroll();

  /* ---------------------------------------------------------------------
     Movimento — mesma linguagem do vet.2: Lenis (scroll suave), spring reveal
     letra a letra nos títulos e, na jornada, o caminho desenhado pelo scroll
     no ritmo da seção "Três passos para chegar tranquilo".
     --------------------------------------------------------------------- */
  const root=document.documentElement;
  const gsap=window.gsap;
  const ScrollTrigger=window.ScrollTrigger;
  // A classe .js vem do <head>; sem GSAP (offline) ou com movimento reduzido,
  // sai e o conteúdo fica visível e estático.
  if(!gsap || !ScrollTrigger || reduceMotion.matches){ root.classList.remove("js"); return; }
  gsap.registerPlugin(ScrollTrigger);

  // Lenis dirige o ScrollTrigger, e o ticker do GSAP dirige o Lenis.
  if(window.Lenis){
    lenis=new window.Lenis({ duration:1.15, easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)), smoothWheel:true, touchMultiplier:1.8 });
    lenis.on("scroll",ScrollTrigger.update);
    gsap.ticker.add(time=>lenis.raf(time*1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener("click",event=>{
      const link=event.target.closest('a[href^="#"]');
      const target=link && link.hash.length>1 && document.querySelector(link.hash);
      if(!target) return;
      event.preventDefault();
      lenis.scrollTo(target,{ offset:target===hero?0:-20, duration:1.25 });
      history.replaceState(null,"",link.hash);
    });
  }

  /* Spring reveal: letras saem de scale 0 / rotationY 10 com uma mola física
     (k 115, c 11,5, m 1) em 1,5s. O texto original vai num .sr-only e a versão
     quebrada fica com aria-hidden. Spans internos e <br> são preservados. */
  // Resposta ao degrau de um sistema massa-mola subamortecido, 0 → 1.
  function makeSpring(stiffness,damping,duration){
    const w0=Math.sqrt(stiffness), zeta=damping/(2*Math.sqrt(stiffness));
    const wd=w0*Math.sqrt(1-zeta*zeta), zw0=zeta*w0;
    return progress=>{ const t=progress*duration; return 1-Math.exp(-zw0*t)*(Math.cos(wd*t)+(zw0/wd)*Math.sin(wd*t)); };
  }
  const SPRING_DURATION=1.5;
  const springEase=makeSpring(115,11.5,SPRING_DURATION);
  // Pets: mola mais macia e lenta que a das letras (massa maior, mesmo "quique").
  const PET_DURATION=2;
  const petEase=makeSpring(38,8.4,PET_DURATION);
  function splitTextNodes(node){
    Array.from(node.childNodes).forEach(child=>{
      if(child.nodeType===1){ if(child.tagName!=="BR") splitTextNodes(child); return; }
      if(child.nodeType!==3 || !child.textContent.trim()) return;
      const frag=document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach(part=>{
        if(!part) return;
        if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; }
        const word=document.createElement("span");
        word.className="split-word";
        Array.from(part).forEach(ch=>{ const c=document.createElement("span"); c.className="split-char"; c.textContent=ch; word.appendChild(c); });
        frag.appendChild(word);
      });
      child.replaceWith(frag);
    });
  }
  function splitChars(el){
    const label=document.createElement("span");
    label.className="sr-only";
    // Junta os nós de texto com espaço: spans em bloco e <br> não viram "fazo rabinho".
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT), parts=[];
    while(walker.nextNode()) parts.push(walker.currentNode.textContent);
    label.textContent=parts.join(" ").replace(/\s+/g," ").trim();
    const visual=document.createElement("span");
    visual.className="split-visual";
    visual.setAttribute("aria-hidden","true");
    while(el.firstChild) visual.appendChild(el.firstChild);
    splitTextNodes(visual);
    el.append(label,visual);
    const chars=visual.querySelectorAll(".split-char");
    gsap.set(chars,{ scale:0, rotationY:10, transformPerspective:1200 });
    el.style.visibility="visible";
    return chars;
  }
  function springIn(chars,stagger){
    return gsap.to(chars,{ scale:1, rotationY:0, duration:SPRING_DURATION, stagger, ease:springEase, force3D:true,
      onComplete:()=>gsap.set(chars,{ clearProps:"transform,willChange" }) });
  }
  // Botões têm transition em transform (hover); desligada enquanto o GSAP anima.
  function holdTransition(targets){
    const els=gsap.utils.toArray(targets);
    els.forEach(el=>{ el.style.transition="none"; });
    return ()=>els.forEach(el=>{ el.style.transition=""; gsap.set(el,{ clearProps:"transform" }); });
  }

  /* Entrada da abertura
     Pets: o recorte inteiro (pet + blob azul) sobe de trás da onda com a mesma
     mola dos títulos. O GSAP anima o <image> (e a extensão do blob), e o clip-path acompanha; o <g>
     de fora continua livre para o posicionamento do celular e o parallax do
     ponteiro. A escala parte da borda externa de cada pet (svgOrigin), para o blob
     não se descolar da lateral da tela. */
  const heroHeart=document.querySelector(".hero-heart");
  const heroTitle=document.querySelector("#hero-title");
  const releaseHero=holdTransition(".hero-cta");
  const heroChars=splitChars(heroTitle);

  const petIn=(selector,originX)=>gsap.timeline()
    .fromTo(selector,{ y:170, scale:.94, svgOrigin:originX+" 941" },{ y:0, scale:1, duration:PET_DURATION, ease:petEase })
    .fromTo(selector,{ opacity:0 },{ opacity:1, duration:.5, ease:"power2.out" },0);
  gsap.timeline({ defaults:{ ease:"power3.out" }, delay:.15, onComplete:releaseHero })
    .add(petIn(".hero-pet-dog > *",0),0)
    .add(petIn(".hero-pet-cat > *",1672),.16)
    .add(springIn(heroChars,.03),.2)
    // Tracinhos da foto: entram com o texto, com a mesma mola dos títulos.
    .fromTo(".hero-pet-dog .hero-rays-lines",{ scale:0, rotation:20, svgOrigin:"104 226" },{ scale:1, rotation:0, duration:SPRING_DURATION, ease:springEase },.7)
    .fromTo(".hero-pet-cat .hero-rays-lines",{ scale:0, rotation:-20, svgOrigin:"1528 352" },{ scale:1, rotation:0, duration:SPRING_DURATION, ease:springEase },.85)
    .fromTo(".hero-copy > p[data-hero]",{ y:20, opacity:0 },{ y:0, opacity:1, duration:.6 },.75)
    .fromTo(".hero-cta",{ y:22, opacity:0, scale:.94 },{ y:0, opacity:1, scale:1, duration:.55 },1.05)
    .fromTo(".hero-link",{ y:16, opacity:0 },{ y:0, opacity:1, duration:.55 },1.25)
    .set(heroHeart,{ opacity:1 },1.1)
    .fromTo(heroHeart.querySelector("use"),{ scale:0, transformOrigin:"50% 50%" },{ scale:1, duration:SPRING_DURATION, ease:springEase },1.1);

  /* Títulos das seções: spring reveal ao entrar na tela */
  gsap.utils.toArray("[data-split]").forEach(el=>{
    if(el.closest(".hero")) return;
    const chars=splitChars(el);
    ScrollTrigger.create({ trigger:el, start:"top 88%", once:true, onEnter:()=>springIn(chars,.03) });
  });

  /* Revelar ao rolar. O fim do rodapé nunca sobe até 88% da tela (a página acaba
     antes), então lá o gatilho é a entrada na tela. */
  const revealBatch=batch=>{
    const release=holdTransition(batch.filter(el=>el.matches(".button")));
    gsap.fromTo(batch,{ y:34, opacity:0 },{ y:0, opacity:1, duration:.75, stagger:.09, ease:"power3.out", overwrite:true, onComplete:release });
    const rays=batch.map(el=>el.querySelector(".title-rays")).filter(Boolean);
    if(rays.length) gsap.fromTo(rays,{ scale:0, rotation:-25, transformOrigin:"0% 100%" },{ scale:1, rotation:0, duration:SPRING_DURATION, delay:.35, ease:springEase });
  };
  ScrollTrigger.batch("main [data-reveal]",{ start:"top 88%", once:true, onEnter:revealBatch });
  ScrollTrigger.batch(".site-footer [data-reveal]",{ start:"top bottom", once:true, onEnter:revealBatch });

  /* Jornada: caminho, pegadas e fases revelados no ritmo do scroll.
     Como em "Três passos": o traço avança com o scroll (scrub), cada fase
     "acende" quando o traço chega nela e as legendas surgem junto — tudo
     desfeito ao subir. No celular não há caminho: cada fase acende ao cruzar
     60% da tela, como os números da timeline de referência. */
  const stages=gsap.utils.toArray(".life-stage");
  const paws=gsap.utils.toArray(".track-paw");
  const reveal=journey.querySelector(".track-reveal");
  const captions=stage=>stage.querySelectorAll(".stage-button h3, .stage-button p");
  const mm=gsap.matchMedia();

  mm.add("(min-width: 1024px)",()=>{
    const length=reveal.getTotalLength();
    // Fração do comprimento em que o traço alcança um x do canvas (1672 × 941).
    const at=x=>{ for(let i=0;i<=200;i++){ if(reveal.getPointAtLength(length*i/200).x>=x) return i/200; } return 1; };
    const LINE_START=.12, LINE_SPAN=.8;
    const nodes=[...stages,...paws].map(el=>({ el, time:LINE_START+at(Number(el.dataset.at))*LINE_SPAN }));
    nodes[0].time=.02; // o filhote acende antes do traço sair dele
    reveal.style.strokeDasharray=length+" "+length;
    const tl=gsap.timeline({
      // Começa quando a seção já cobre quase metade da tela e
      // termina quando ela preenche a tela, com a última fase acesa pouco antes.
      scrollTrigger:{ trigger:journey, start:"top 55%", end:"bottom bottom", scrub:.6, invalidateOnRefresh:true },
      onUpdate:()=>{ const time=tl.time(); nodes.forEach(node=>node.el.classList.toggle("is-active",time>=node.time)); }
    });
    tl.fromTo(reveal,{ strokeDashoffset:length },{ strokeDashoffset:0, ease:"none", duration:LINE_SPAN },LINE_START);
    nodes.filter(node=>node.el.matches(".life-stage")).forEach(node=>{
      tl.fromTo(captions(node.el),{ opacity:0, y:28 },{ opacity:1, y:0, ease:"none", stagger:.04, duration:.1 },node.time);
    });
    return ()=>{ reveal.style.strokeDasharray=""; nodes.forEach(node=>node.el.classList.remove("is-active")); };
  });

  mm.add("(max-width: 1023px)",()=>{
    stages.forEach(stage=>{
      ScrollTrigger.create({ trigger:stage.querySelector(".stage-picture"), start:"center 60%",
        onEnter:()=>stage.classList.add("is-active"), onLeaveBack:()=>stage.classList.remove("is-active") });
      gsap.fromTo(captions(stage),{ opacity:0, y:28 },{ opacity:1, y:0, ease:"none", stagger:.15,
        scrollTrigger:{ trigger:stage.querySelector("h3"), start:"top 96%", end:"top 78%", scrub:.6 } });
    });
    return ()=>stages.forEach(stage=>stage.classList.remove("is-active"));
  });

  window.addEventListener("load",()=>ScrollTrigger.refresh());
})();

