  /* ===== EDITE AQUI: data em que vocês começaram (ano, mês, dia) ===== */
  /* mês começa em 0 -> janeiro=0, fevereiro=1, ... dezembro=11 */
  const DATA_INICIO = new Date(2003, 7, 24); // 24/agosto/2003

  /* ===== contador em tempo real: anos, meses, dias, horas, min, seg ===== */
  (function(){
    const el = {
      anos:  document.getElementById('c-anos'),
      meses: document.getElementById('c-meses'),
      dias:  document.getElementById('c-dias'),
      horas: document.getElementById('c-horas'),
      min:   document.getElementById('c-min'),
      seg:   document.getElementById('c-seg'),
    };

    // decompõe o tempo decorrido respeitando o calendário (meses têm tamanhos diferentes)
    function decompor(inicio, agora){
      let anos  = agora.getFullYear() - inicio.getFullYear();
      let meses = agora.getMonth()    - inicio.getMonth();
      let dias  = agora.getDate()     - inicio.getDate();
      let horas = agora.getHours()    - inicio.getHours();
      let min   = agora.getMinutes()  - inicio.getMinutes();
      let seg   = agora.getSeconds()  - inicio.getSeconds();

      if(seg   < 0){ seg   += 60; min--;   }
      if(min   < 0){ min   += 60; horas--; }
      if(horas < 0){ horas += 24; dias--;  }
      if(dias  < 0){
        // empresta os dias do mês anterior ao "agora"
        const diasMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0).getDate();
        dias += diasMesAnterior; meses--;
      }
      if(meses < 0){ meses += 12; anos--; }
      return { anos, meses, dias, horas, min, seg };
    }

    const pad = n => String(n).padStart(2,'0');

    function tick(){
      const t = decompor(DATA_INICIO, new Date());
      el.anos.textContent  = t.anos;
      el.meses.textContent = t.meses;
      el.dias.textContent  = t.dias;
      el.horas.textContent = pad(t.horas);
      el.min.textContent   = pad(t.min);
      el.seg.textContent   = pad(t.seg);
    }

    tick();
    setInterval(tick, 1000);
  })();

  /* ===== nº de anos dinâmico: rodapé + textos por extenso ===== */
  (function(){
    const anoAtual = new Date().getFullYear();
    const anos = anoAtual - DATA_INICIO.getFullYear();

    // rodapé: "23 anos · 2026"
    document.getElementById('f-anos').textContent = anos;
    document.getElementById('f-ano').textContent  = anoAtual;

    // título da aba: "23 Anos · Nossa História"
    document.title = anos + ' Anos · Nossa História';

    // converte 0–99 em palavras (PT-BR), 1ª letra maiúscula
    function porExtenso(n){
      const u = ['zero','um','dois','três','quatro','cinco','seis','sete','oito','nove'];
      const dez = ['dez','onze','doze','treze','catorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
      const dezenas = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
      let t;
      if(n < 10) t = u[n];
      else if(n < 20) t = dez[n-10];
      else { const d = Math.floor(n/10), r = n%10; t = r ? dezenas[d]+' e '+u[r] : dezenas[d]; }
      return t.charAt(0).toUpperCase() + t.slice(1);
    }

    // aplica o texto por extenso em todos os <span class="anos-ext">
    const ext = porExtenso(anos);
    document.querySelectorAll('.anos-ext').forEach(el => el.textContent = ext);
  })();

  /* reveal no scroll */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  },{threshold:.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  /* ===== carrossel ===== */
  (function(){
    const track = document.getElementById('track');
    const slides = Array.from(track.children);
    const dotsBox = document.getElementById('dots');
    let index = 0;

    // cria as bolinhas
    slides.forEach((_,i)=>{
      const b = document.createElement('button');
      if(i===0) b.classList.add('active');
      b.addEventListener('click',()=>go(i));
      dotsBox.appendChild(b);
    });
    const dots = Array.from(dotsBox.children);

    function go(i){
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index*100) + '%)';
      dots.forEach((d,n)=>d.classList.toggle('active', n===index));
    }
    const next = ()=>go(index+1);
    const prev = ()=>go(index-1);

    document.getElementById('next').addEventListener('click',()=>{next();reset();});
    document.getElementById('prev').addEventListener('click',()=>{prev();reset();});

    // autoplay (pausa ao passar o mouse)
    let timer = setInterval(next, 5000);
    function reset(){ clearInterval(timer); timer = setInterval(next, 5000); }
    const car = document.getElementById('carousel');
    car.addEventListener('mouseenter',()=>clearInterval(timer));
    car.addEventListener('mouseleave',reset);

    // swipe no celular
    let x0=null;
    track.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
    track.addEventListener('touchend',e=>{
      if(x0===null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if(Math.abs(dx)>40){ dx<0 ? next() : prev(); reset(); }
      x0=null;
    });
  })();

  /* ===== animações comemorativas (overlay #fogos; uma animação por data) ===== */
  (function(){
    // EDITE AQUI p/ testar: '' usa a data real; ou force um tema p/ ver em qualquer dia:
    //   'fogos' | 'petalas' | 'coracoes' | 'baloes'
    const TEMA_TESTE = '';

    // data → tema (formato "mês-dia", mês base 1)
    const TEMAS_POR_DATA = {
      '2-14': 'fogos',     // 14/fev · Dia dos Namorados (Valentine's)
      '6-12': 'fogos',     // 12/jun · Dia dos Namorados
      '4-17': 'petalas',   // 17/abr · aniversário de casamento
      '8-24': 'coracoes',  // 24/ago · primeiro beijo
      '6-13': 'baloes',    // 13/jun · aniversário da Cleide
      '9-27': 'baloes',    // 27/set · aniversário do Patrick
    };

    const hoje = new Date();
    const chaveHoje = (hoje.getMonth() + 1) + '-' + hoje.getDate();
    // override por URL (?fx=tema) — atalho de preview sem editar o arquivo
    const fx = new URLSearchParams(location.search).get('fx');
    const forcado = TEMA_TESTE || fx;                 // tema forçado p/ teste/preview
    const temaId = forcado || TEMAS_POR_DATA[chaveHoje];

    // respeita quem prefere menos animação — mas o override de teste sempre roda
    const reduzMov = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduzMov && !forcado) return;

    const canvas = document.getElementById('fogos');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, dpr;
    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width  = Math.floor(innerWidth  * dpr);
      H = canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width  = innerWidth  + 'px';
      canvas.style.height = innerHeight + 'px';
    }
    resize();
    addEventListener('resize', resize);

    const rand     = (a,b) => a + Math.random()*(b-a);
    const escolher = arr   => arr[Math.floor(Math.random()*arr.length)];

    // array único de partículas + API entregue a cada tema (W/H/dpr sempre atuais)
    const parts = [];
    const api = {
      ctx, rand, parts,
      get W(){ return W; }, get H(){ return H; }, get dpr(){ return dpr; },
      add: p => parts.push(p),
    };

    // =================== TEMAS ===================
    const TEMAS = {
      // -------- fogos de artifício (vinho/rosa/dourado, com rastro aditivo) --------
      fogos: {
        cores: ['#9c3a4d','#C9A876','#E7D4C4','#D9B26A','#5A1A29'],
        duracao: 4500,
        trilha(ctx, W, H){               // apaga o quadro só um pouco → rastro
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = 'rgba(0,0,0,0.20)';
          ctx.fillRect(0, 0, W, H);
          ctx.globalCompositeOperation = 'lighter';
        },
        init(api){ this.lancar(api); this.lancar(api); },
        cadencia(){ return rand(280, 520); },
        spawn(api){ this.lancar(api); if(Math.random() < 0.5) this.lancar(api); },
        lancar(api){
          api.add({ tipo:'foguete',
            x: rand(api.W*0.18, api.W*0.82), y: api.H + 10,
            vy: rand(-13, -10) * api.dpr, alvo: rand(api.H*0.12, api.H*0.45), cor: api.cor() });
        },
        explodir(api, x, y, base){
          const n = Math.floor(rand(50, 80));
          for(let i=0; i<n; i++){
            const ang = (Math.PI*2) * (i/n) + rand(-0.04, 0.04);
            const sp  = rand(1.5, 6) * api.dpr;
            api.add({ tipo:'faisca', x, y,
              vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp,
              cor: Math.random() < 0.72 ? base : api.cor(),
              vida: 1, decay: rand(0.010, 0.020), r: rand(1.3, 2.8) * api.dpr });
          }
        },
        passo(p, api){
          const G = 0.05 * api.dpr;
          if(p.tipo === 'foguete'){
            p.y += p.vy; p.vy += G;
            if(p.vy >= 0 || p.y <= p.alvo){ this.explodir(api, p.x, p.y, p.cor); return false; }
          } else {
            p.x += p.vx; p.y += p.vy;
            p.vx *= 0.985; p.vy = p.vy*0.985 + G;
            p.vida -= p.decay;
            if(p.vida <= 0) return false;
          }
        },
        desenha(p, api){
          const ctx = api.ctx;
          if(p.tipo === 'foguete'){
            ctx.globalAlpha = 1; ctx.fillStyle = p.cor;
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.2*api.dpr, 0, Math.PI*2); ctx.fill();
          } else {
            ctx.globalAlpha = Math.max(p.vida, 0); ctx.fillStyle = p.cor;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
          }
        },
      },

      // -------- chuva de pétalas douradas (casamento) --------
      petalas: {
        cores: ['#D9B26A','#C9A876','#B08D57','#E7D4C4','#F4EDE2'],
        duracao: 5000,
        cadencia(){ return rand(90, 170); },
        spawn(api){
          const n = Math.random() < 0.5 ? 2 : 1;
          for(let i=0; i<n; i++){
            const s = rand(7, 13) * api.dpr;
            api.add({
              x: rand(0, api.W), y: -20*api.dpr,
              vy: rand(1.8, 3.8) * api.dpr,
              fase: rand(0, Math.PI*2), freq: rand(0.0010, 0.0022), amp: rand(0.6, 1.6) * api.dpr,
              rot: rand(0, Math.PI*2), vrot: rand(-0.03, 0.03),
              rx: s, ry: s*rand(0.45, 0.62),
              cor: api.cor(), alpha: rand(0.7, 0.95),
            });
          }
        },
        passo(p, api, t){
          p.y += p.vy;
          p.x += Math.sin(t * p.freq + p.fase) * p.amp;
          p.rot += p.vrot;
          if(p.y > api.H + 30*api.dpr) return false;
        },
        desenha(p, api){
          const ctx = api.ctx;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.cor;
          ctx.beginPath(); ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI*2); ctx.fill();
          ctx.restore();
        },
      },

      // -------- corações subindo (primeiro beijo) --------
      coracoes: {
        cores: ['#9c3a4d','#5A1A29','#C26B7A','#E7D4C4'],
        duracao: 6000,
        cadencia(){ return rand(260, 480); },
        spawn(api){
          const s = rand(9, 16) * api.dpr;
          api.add({
            x: rand(api.W*0.08, api.W*0.92), y: api.H + 20*api.dpr,
            vy: rand(-1.6, -0.8) * api.dpr,
            fase: rand(0, Math.PI*2), freq: rand(0.0012, 0.0024), amp: rand(0.5, 1.3) * api.dpr,
            s, cor: api.cor(), vida: 1, decay: rand(0.0026, 0.0046),
          });
        },
        passo(p, api, t){
          p.y += p.vy;
          p.x += Math.sin(t * p.freq + p.fase) * p.amp;
          p.vida -= p.decay;
          if(p.vida <= 0 || p.y < -30*api.dpr) return false;
        },
        desenha(p, api){
          const ctx = api.ctx;
          ctx.save();
          ctx.globalAlpha = Math.max(p.vida, 0) * 0.92;
          ctx.translate(p.x, p.y); ctx.scale(p.s/17, p.s/17);
          ctx.fillStyle = p.cor;
          // curva paramétrica do coração (canvas: y p/ baixo, por isso o sinal negativo)
          ctx.beginPath();
          for(let a=0; a<=Math.PI*2 + 0.01; a+=0.20){
            const hx =  16*Math.pow(Math.sin(a), 3);
            const hy = -(13*Math.cos(a) - 5*Math.cos(2*a) - 2*Math.cos(3*a) - Math.cos(4*a));
            a === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
          }
          ctx.closePath(); ctx.fill();
          ctx.restore();
        },
      },

      // -------- balões subindo (aniversários) --------
      baloes: {
        cores: ['#9c3a4d','#5A1A29','#B08D57','#C9A876','#7A2535'],
        duracao: 5500,
        cadencia(){ return rand(420, 760); },
        spawn(api){
          const r = rand(13, 22) * api.dpr;
          api.add({
            x: rand(api.W*0.1, api.W*0.9), y: api.H + r*3,
            vy: rand(-2.8, -1.6) * api.dpr,
            fase: rand(0, Math.PI*2), freq: rand(0.0008, 0.0016), amp: rand(0.6, 1.5) * api.dpr,
            r, cor: api.cor(), tilt: rand(-0.18, 0.18),
          });
        },
        passo(p, api, t){
          p.y += p.vy;
          p.x += Math.sin(t * p.freq + p.fase) * p.amp;
          if(p.y < -p.r*4) return false;
        },
        desenha(p, api){
          const ctx = api.ctx, r = p.r;
          ctx.save();
          ctx.globalAlpha = 0.92;
          ctx.translate(p.x, p.y); ctx.rotate(p.tilt);
          // cordão
          ctx.strokeStyle = 'rgba(180,150,110,0.55)';
          ctx.lineWidth = Math.max(1, 0.8*api.dpr);
          ctx.beginPath(); ctx.moveTo(0, r*1.15); ctx.quadraticCurveTo(r*0.25, r*2.0, 0, r*2.6); ctx.stroke();
          // corpo
          ctx.fillStyle = p.cor;
          ctx.beginPath(); ctx.ellipse(0, 0, r*0.82, r, 0, 0, Math.PI*2); ctx.fill();
          // bico
          ctx.beginPath();
          ctx.moveTo(-r*0.12, r*0.98); ctx.lineTo(r*0.12, r*0.98); ctx.lineTo(0, r*1.2);
          ctx.closePath(); ctx.fill();
          // brilho
          ctx.globalAlpha = 0.35; ctx.fillStyle = '#FBF7F0';
          ctx.beginPath(); ctx.ellipse(-r*0.28, -r*0.34, r*0.16, r*0.26, -0.4, 0, Math.PI*2); ctx.fill();
          ctx.restore();
        },
      },
    };

    const tema = TEMAS[temaId];
    if(!tema) return;                 // fora das datas e sem override → nada acontece

    api.cor = () => escolher(tema.cores);

    const MAX = 320;                  // teto de partículas (performance)
    const FIM_FADE = 1300;            // ms de fade antes de remover o canvas
    let inicio = null, proxSpawn = 0, parouEm = null;

    function frame(t){
      if(inicio === null){ inicio = t; if(tema.init) tema.init(api, t); }
      const decorrido = t - inicio;

      // fundo do quadro: rastro (fogos) ou limpeza simples (demais)
      if(tema.trilha) tema.trilha(ctx, W, H);
      else ctx.clearRect(0, 0, W, H);

      // novos elementos em cadência, enquanto dentro da janela de spawn
      if(decorrido < tema.duracao && t >= proxSpawn && parts.length < MAX){
        tema.spawn(api, t);
        proxSpawn = t + tema.cadencia();
      }

      for(let i = parts.length - 1; i >= 0; i--){
        const p = parts[i];
        if(tema.passo(p, api, t) === false){ parts.splice(i, 1); continue; }
        tema.desenha(p, api, t);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // encerramento: passou a janela e a tela já esvaziou
      if(decorrido >= tema.duracao && parts.length === 0){
        if(parouEm === null) parouEm = t;
        canvas.style.opacity = '0';
        if(t - parouEm > FIM_FADE){ canvas.remove(); return; }
      }
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  })();

  /* ===== link "mensagem do dia" (surge sobre a tela e desvanece nas datas especiais) ===== */
  (function(){
    // EDITE AQUI p/ testar em qualquer dia: '' usa a data real; ou force um dia "mês-dia" (base 1):
    //   '2-14' | '6-12' | '4-17' | '8-24' | '6-13' | '9-27'
    const MSG_TESTE = '';

    // data → { arquivo da mensagem, texto do link }  (formato "mês-dia", mês base 1 — igual às animações)
    const MENSAGENS_POR_DATA = {
      '2-14': { arquivo:'mensagens/namorados-fev.html',       chamada:'Há algo para você hoje' },      // 14/fev · Dia dos Namorados
      '6-12': { arquivo:'mensagens/namorados-jun.html',       chamada:'Há algo para você hoje' },      // 12/jun · Dia dos Namorados
      '4-17': { arquivo:'mensagens/casamento.html',           chamada:'Uma carta para o nosso dia' },  // 17/abr · casamento
      '8-24': { arquivo:'mensagens/primeiro-beijo.html',      chamada:'Lembra deste dia?' },           // 24/ago · primeiro beijo
      '6-13': { arquivo:'mensagens/aniversario-cleide.html',  chamada:'Uma mensagem para você, Cleide' },  // 13/jun · aniversário da Cleide
      '9-27': { arquivo:'mensagens/aniversario-patrick.html', chamada:'Uma mensagem para você, Patrick' }, // 27/set · aniversário do Patrick
    };

    const hoje = new Date();
    const chaveHoje = (hoje.getMonth() + 1) + '-' + hoje.getDate();
    // override por URL (?msg=mês-dia) — preview sem editar o arquivo
    const msgUrl = new URLSearchParams(location.search).get('msg');
    const chave = MSG_TESTE || msgUrl || chaveHoje;
    const dados = MENSAGENS_POR_DATA[chave];
    if(!dados) return;                 // fora das datas → nenhum link aparece

    // cria o link flutuante, centralizado sobre o canvas das animações
    const a = document.createElement('a');
    a.href = dados.arquivo;
    a.className = 'msg-flutua';
    a.setAttribute('aria-label', dados.chamada);
    a.innerHTML = '<span class="msg-flutua__txt">' + dados.chamada + '</span>'
                + '<span class="msg-flutua__seta" aria-hidden="true">&#10022;</span>';
    document.body.appendChild(a);

    // ciclo: fade-in (~1s) → ~6s visível → fade-out e auto-remoção (some até recarregar)
    const VISIVEL = 6000;
    requestAnimationFrame(() => a.classList.add('on'));
    setTimeout(() => {
      a.classList.remove('on');
      a.classList.add('off');
      a.addEventListener('transitionend', () => a.remove(), { once:true });
    }, 1000 + VISIVEL);
  })();
