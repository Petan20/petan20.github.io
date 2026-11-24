// Performance Lab · Mikronástroje: 1RM, dechový trenažér, hydratace
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

function calc1RM() {
  const w = num('rm-weight', 0);
  const r = num('rm-reps', 1);
  const epley = w * (1 + r / 30);
  const brzycki = w * (36 / (37 - r));
  const rm = r === 1 ? w : (epley + brzycki) / 2;
  document.getElementById('rm-out').textContent = fmt(rm, 1) + ' kg';
  document.getElementById('rm-zones').innerHTML = [60, 70, 75, 80, 85, 90].map(pct => `
    <span class="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[13px] font-bold">
      ${pct} %: ${fmt(rm * pct / 100, 1)} kg
    </span>
  `).join('');
}

let brTimer = null;
function stopBreath() {
  clearInterval(brTimer);
  brTimer = null;
  document.getElementById('breath-btn').textContent = 'Spustit';
  const c = document.getElementById('pacer-circle');
  c.textContent = 'Připraveno';
  c.style.transform = 'scale(1)';
  document.getElementById('breath-phase').textContent = '';
  const m = document.getElementById('breath-mode').value;
  document.getElementById('breath-note').textContent = m === 'cns'
    ? 'Nádech nosem 4 s, zádrž 7 s, pomalý výdech 8 s. Pomalé dýchání s dlouhým výdechem zklidňuje nervový systém a může urychlit pokles tepové frekvence po zátěži.'
    : m === 'box'
    ? '4 s nádech – 4 s zádrž – 4 s výdech – 4 s zádrž pro zklidnění a soustředění před výkonem.'
    : '4 s nádech do spodních žeber – 2 s pauza – 6 s pomalý výdech (ideální pro astma a pectus excavatum).';
}

function toggleBreath() {
  if (brTimer) { stopBreath(); return; }
  document.getElementById('breath-btn').textContent = 'Zastavit';
  const m = document.getElementById('breath-mode').value;
  const steps = m === 'cns'
    ? [['Nádech', 4, 1.28], ['Zádrž', 7, 1.28], ['Výdech', 8, 0.85]]
    : m === 'box'
    ? [['Nádech', 4, 1.28], ['Zádrž', 4, 1.28], ['Výdech', 4, 0.85], ['Zádrž', 4, 0.85]]
    : [['Nádech', 4, 1.28], ['Pauza', 2, 1.28], ['Výdech', 6, 0.85]];
  let idx = 0, sec = steps[0][1];
  const tick = () => {
    const c = document.getElementById('pacer-circle');
    if (sec === steps[idx][1]) {
      // Čtečce obrazovky ohlásíme jen změnu fáze, ne každou sekundu
      document.getElementById('breath-phase').textContent = `${steps[idx][0]} ${steps[idx][1]} sekund`;
    }
    c.textContent = `${steps[idx][0]} (${sec}s)`;
    c.style.transform = `scale(${steps[idx][2]})`;
    sec--;
    if (sec <= 0) {
      idx = (idx + 1) % steps.length;
      sec = steps[idx][1];
    }
  };
  tick();
  brTimer = setInterval(tick, 1000);
}

function calcHydration() {
  const w = num('hyd-weight', 70);
  const m = num('hyd-min', 0);
  const base = w * 0.035;
  const extra = (m / 60) * 0.65;
  document.getElementById('hyd-out').textContent = fmt(base + extra, 2) + ' l / den';
  document.getElementById('hyd-detail').textContent =
    `Základ ${fmt(base, 2)} l + ${fmt(extra, 2)} l při tréninku. Před tréninkem 200–300 ml, během 200–300 ml každých 15–20 min, po tréninku 300–500 ml do 20 minut. Při zátěži nad 2 h nebo velkém pocení pijte nápoj se sodíkem (ACSM 2016).`;
}
