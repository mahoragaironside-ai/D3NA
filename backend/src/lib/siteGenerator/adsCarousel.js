// Carrossel de anúncios: 3 espaços reais (Adsterra, a preencher depois)
// + 1 espaço fixo nosso (D3NA, programa de afiliados). Gira a cada 7s,
// e fica parado no anúncio do D3NA no final do ciclo.
export function adsCarouselCSS(primary) {
  return `
  .ads-box { background: var(--card-bg); border-radius: 16px; padding: 18px; box-shadow: var(--shadow); margin-bottom: 20px; overflow: hidden; }
  .ads-label { font-size: 10px; color: var(--text-soft); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
  .ads-track { position: relative; height: 100px; }
  .ads-slide {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    text-align: center; opacity: 0; transition: opacity 0.5s ease; border-radius: 10px;
    font-size: 12.5px; color: var(--text-soft); background: var(--bg); padding: 10px;
  }
  .ads-slide.on { opacity: 1; }
  .ads-slide.d3na {
    background: linear-gradient(135deg, ${primary} 0%, ${primary}bb 60%, ${primary} 100%);
    color: #fff; font-weight: 700; flex-direction: column; gap: 3px; text-decoration: none;
    box-shadow: 0 4px 14px ${primary}55; border: 1px solid rgba(255,255,255,0.25);
  }
  .ads-slide.d3na .d3na-icon { font-size: 18px; display: inline-block; animation: d3naPulse 1.6s ease-in-out infinite; }
  .ads-slide.d3na strong { font-size: 13.5px; letter-spacing: 0.3px; }
  .ads-slide.d3na small { font-weight: 500; opacity: 0.9; font-size: 11px; }
  @keyframes d3naPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.18); } }
  .ads-dots { display: flex; justify-content: center; gap: 5px; margin-top: 10px; }
  .ads-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--nav-border); }
  .ads-dot.on { background: ${primary}; }
  `;
}

export function adsCarouselHTML() {
  return `
  <div class="ads-box reveal">
    <div class="ads-label">Publicidade</div>
    <div class="ads-track" id="adsTrack">
      <div class="ads-slide on" data-i="0"><script async="async" data-cfasync="false" src="https://pl31350812.profitableratecpmnetwork.com/a9818edad4dfcde3e8fa8cfcbc26cab6/invoke.js"></script><div id="container-a9818edad4dfcde3e8fa8cfcbc26cab6"></div></div>
      <div class="ads-slide" data-i="1"><script>
    atOptions = {
      'key' : 'c9711ff1dd4ba302fc1dd70f8133ab95',
      'format' : 'iframe',
      'height' : 50,
      'width' : 320,
      'params' : {}
    };
  </script><script src="https://www.highrevenueformat.com/c9711ff1dd4ba302fc1dd70f8133ab95/invoke.js"></script></div>
      <div class="ads-slide" data-i="2"><script>
    atOptions = {
      'key' : '5f1543605c4a64ead50bf0bdb38f2658',
      'format' : 'iframe',
      'height' : 60,
      'width' : 468,
      'params' : {}
    };
  </script><script src="https://www.highrevenueformat.com/5f1543605c4a64ead50bf0bdb38f2658/invoke.js"></script></div>
      <a class="ads-slide d3na" data-i="3" href="#" target="_blank">
        <span class="d3na-icon">💸</span>
        <strong>Quer ganhar renda extra?</strong>
        <small>Torna-te afiliado D3NA →</small>
      </a>
    </div>
    <div class="ads-dots" id="adsDots"></div>
  </div>`;
}

export function adsCarouselScript() {
  return `
  (function () {
    const track = document.getElementById("adsTrack");
    const dotsBox = document.getElementById("adsDots");
    const slides = track.querySelectorAll(".ads-slide");
    slides.forEach((_, i) => {
      const d = document.createElement("div");
      d.className = "ads-dot" + (i === 0 ? " on" : "");
      dotsBox.appendChild(d);
    });
    const dots = dotsBox.querySelectorAll(".ads-dot");
    let idx = 0;
    function mostrar(i) {
      slides.forEach((s) => s.classList.remove("on"));
      dots.forEach((d) => d.classList.remove("on"));
      slides[i].classList.add("on");
      dots[i].classList.add("on");
    }
    setInterval(() => {
      idx = (idx + 1) % slides.length;
      mostrar(idx);
    }, 7000);
  })();
  `;
}
