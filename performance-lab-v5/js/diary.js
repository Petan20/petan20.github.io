// Performance Lab · Deník tréninku, model obnovy a grafy superkompenzace
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

// ============================================================================
// LOGIKA MODULU 0: OSOBNÍ PROFIL, DENÍK TRÉNINKU & GRAFY SUPERKOMPENZACE
// ============================================================================
// Jediný model obnovy pro celou aplikaci: [pokles výkonnosti v %, hodiny do návratu na 100 %]
// pro každý systém a pilíř. Z něj počítá deník, grafy i karta Fáze superkompenzace.
const DIARY_WEIGHTS = {
  strength:  { cns: [18, 48], gly: [14, 28], str: [22, 52], atp: [12, 4] },
  explosive: { cns: [20, 48], gly: [8, 18],  str: [16, 38], atp: [14, 4] },
  endurance: { cns: [10, 24], gly: [24, 42], str: [14, 30], atp: [8, 3] },
  agility:   { cns: [18, 40], gly: [15, 30], str: [18, 42], atp: [13, 4] },
  coord:     { cns: [6, 14],  gly: [5, 12],  str: [6, 14],  atp: [4, 2] }
};

const SYSTEM_META = [
  { key: 'cns', name: 'CNS (Nervový systém)', color: '#2563EB', soft: '#EFF6FF', dash: '', desc: 'Řídí výbušnost, rychlost a maximální sílu' },
  { key: 'gly', name: 'Svalový glykogen', color: '#059669', soft: '#ECFDF5', dash: '8 4', desc: 'Zásoby paliva pro vytrvalost a objem' },
  { key: 'str', name: 'Svaly & Šlachy', color: '#D97706', soft: '#FFFBEB', dash: '2 4', desc: 'Oprava svalových vláken a pojiv' },
  { key: 'atp', name: 'ATP-CP (Rychlá energie)', color: '#7C3AED', soft: '#F5F3FF', dash: '12 4 2 4', desc: 'Okamžitá energie pro krátké úseky' }
];

// Okno superkompenzace pro kartu Fáze superkompenzace ze stejného modelu jako deník.
// loadIdx: 0 = krátká, 1 = střední, 2 = vysoká zátěž
function recoveryWindow(pillar, loadIdx, recMult) {
  const w = DIARY_WEIGHTS[pillar];
  const limiting = Math.max(w.cns[1], w.gly[1], w.str[1]);
  const rest = Math.round(limiting * [0.5, 1, 1.4][loadIdx] * recMult);
  return { rest, from: rest, to: Math.round(rest * 1.38) };
}

function evalSystemCurve(t, depletion, tRec) {
  const tPeak = tRec * 1.38;
  const peakAmp = Math.min(10, depletion * 0.42);
  if (t <= tRec) {
    return 100 - depletion * Math.cos((Math.PI / 2) * (t / Math.max(0.5, tRec)));
  }
  if (t <= tPeak) {
    const u = (t - tRec) / Math.max(0.5, tPeak - tRec);
    return 100 + peakAmp * Math.sin((Math.PI / 2) * u);
  }
  const tau = Math.max(6, tRec * 0.85);
  return 100 + peakAmp * Math.exp(-(t - tPeak) / tau);
}

function getPhaseInfo(t, val, tRec) {
  const tPeak = tRec * 1.38;
  if (t < tRec * 0.55) {
    return { label: 'Akutní únava', cls: 'bg-rose-100 text-rose-800', tip: 'Tělo právě opravuje zátěž – nezařazujte těžký trénink tohoto systému.' };
  }
  if (t < tRec) {
    return { label: 'Fáze obnovy', cls: 'bg-amber-100 text-amber-800', tip: 'Systém se dotahuje zpět k výchozí úrovni (100 %).' };
  }
  if (t <= tPeak + tRec * 0.65 && val >= 100.7) {
    return { label: 'Superkompenzace', cls: 'bg-emerald-100 text-emerald-800', tip: 'Ideální okno! Výkonnost systému je nad výchozí úrovní.' };
  }
  return { label: 'Stabilizováno', cls: 'bg-blue-100 text-blue-800', tip: 'Návrat na výchozí hladinu (100 %) – připraveno k zatížení.' };
}

function updateDiaryModel() {
  const pil = document.getElementById('d-pillar').value;
  const w = num('d-weight', 0);
  const reps = num('d-reps', 1);
  const sets = num('d-sets', 1);
  const time = num('d-time', 45);
  const hr = num('d-hr', 135);
  const rpe = num('d-rpe', 7);
  const sleepH = num('d-sleep', 7.5);
  const fatigue = num('d-fatigue', 4);
  const soreness = num('d-soreness', 4);
  const hours = num('d-hours', 0);

  document.getElementById('d-hours-label').textContent = `${hours} hodin po tréninku`;

  const prof = PROFILES[STATE.condition][STATE.sex];
  const srpe = Math.round(time * rpe);
  const tonnage = Math.round(w * reps * sets);

  // Výpočet zátěžového a regeneračního koeficientu
  // Objem: u silového a výbušného pilíře tonáž (váha × opakování × série),
  // u vytrvalosti a agility průměrný tep. Výchozí hodnoty dávají faktor 1.
  let volumeFactor = 1;
  if ((pil === 'strength' || pil === 'explosive') && tonnage > 0) {
    volumeFactor = Math.min(1.35, Math.max(0.7, Math.sqrt(tonnage / 1920)));
  } else if (pil === 'endurance' || pil === 'agility') {
    volumeFactor = Math.min(1.25, Math.max(0.85, hr / 140));
  }
  const stressMult = (0.65 + (rpe / 10) * 0.65) * (0.8 + Math.min(1.5, time / 75) * 0.35) * (0.85 + (soreness / 10) * 0.3) * volumeFactor;
  const sleepFactor = Math.min(1.18, Math.max(0.72, sleepH / 7.5));
  const fatigueFactor = Math.min(1.15, Math.max(0.75, 1.12 - (fatigue - 2) * 0.045));
  const recoverySpeed = (sleepFactor * fatigueFactor) / prof.recMult;

  const weights = DIARY_WEIGHTS[pil];
  const systems = {};

  SYSTEM_META.forEach(sys => {
    const [baseDep, baseRec] = weights[sys.key];
    const dep = Math.min(34, baseDep * stressMult);
    const tRec = Math.max(1.5, baseRec / recoverySpeed);
    const nowVal = evalSystemCurve(hours, dep, tRec);
    const tomorrowVal = evalSystemCurve(hours + 24, dep, tRec);
    const phase = getPhaseInfo(hours, nowVal, tRec);
    systems[sys.key] = { ...sys, dep, tRec, nowVal, tomorrowVal, phase };
  });

  // Celková připravenost
  const avgReady = Math.round((systems.cns.nowVal + systems.gly.nowVal + systems.str.nowVal) / 3);
  const readyBadge = document.getElementById('diary-ready-badge');
  readyBadge.textContent = `Připravenost: ${avgReady} %`;
  STATE.readiness = avgReady;
  if (STATE.plan) renderToday();
  readyBadge.className = avgReady >= 100
    ? 'text-[13px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200'
    : avgReady >= 93
    ? 'text-[13px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200'
    : 'text-[13px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200';

  document.getElementById('d-load-summary').textContent = tonnage > 0
    ? `${srpe} AU · ${tonnage.toLocaleString('cs-CZ')} kg`
    : `${srpe} AU · Tep ${hr} bpm`;

  // Doporučení dalšího tréninku a povolené intenzity
  const doList = [];
  const lightList = [];
  const avoidList = [];
  const tomorrowList = [];

  if (systems.cns.nowVal >= 100 && systems.str.nowVal >= 99) {
    doList.push('Silový trénink (75–85 % 1RM)', 'Výbušnost & RFD');
  } else if (systems.cns.nowVal >= 94) {
    lightList.push('Silový trénink se sníženou vahou (do 65 % 1RM)');
    avoidList.push('Maximální váhy (> 85 % 1RM) a tvrdá plyometrie (Drop Jumps)');
  } else {
    avoidList.push('Těžký silový trénink, sprinty a výbušné odrazy (CNS v únavě)');
  }

  if (systems.gly.nowVal >= 100) {
    doList.push('Vytrvalostní trénink (I2 i prahové intervaly I4)');
  } else if (systems.gly.nowVal >= 93) {
    doList.push('Lehká aerobní vytrvalost v zóně I1–I2 (35–45 min)');
    avoidList.push('Vysokointenzivní intervaly HIIT (I5)');
  } else {
    lightList.push('Klidná regenerační chůze nebo rotoped v I1 (do 30 min)');
    avoidList.push('Dlouhé běhy a intenzivní intervaly (nízký glykogen)');
  }

  if (systems.cns.nowVal >= 98 && systems.str.nowVal >= 97) {
    doList.push('Agility & změny směru');
  } else {
    avoidList.push('Ostré změny směru a brzdná agility');
  }

  // Koordinace & mobilita je vhodná téměř vždy (kromě extrémního vyčerpání)
  if (avgReady >= 86) {
    doList.push('Koordinace, rovnováha & PNF mobilita');
  } else {
    lightList.push('Pouze dechový trenažér a jemné protažení (15–20 min)');
  }

  // Výhled na zítra (+24 h)
  if (systems.cns.tomorrowVal >= 100 && systems.str.tomorrowVal >= 99) tomorrowList.push('Silový a výbušný trénink');
  if (systems.gly.tomorrowVal >= 100) tomorrowList.push('Vytrvalostní trénink (I2–I4)');
  if (!tomorrowList.length) tomorrowList.push('Lehká aerobní aktivita I2 a mobilita');

  let nextWorkout = 'Koordinace, mobilita & dechová regenerace (30–40 min)';
  let maxIntensity = 'Max. 55–60 % 1RM · Tepová zóna I1–I2';
  if (avgReady >= 101 && sleepH >= 7 && fatigue <= 5) {
    nextWorkout = pil === 'strength'
      ? 'Výbušnost (RFD) nebo Navazující silový trénink (55–65 min)'
      : 'Plný rozvojový trénink dle priority sportu (60–75 min)';
    maxIntensity = 'Až 85–90 % 1RM · Zóny I2–I4 (plný rozsah)';
  } else if (avgReady >= 95) {
    nextWorkout = 'Aerobní vytrvalost I2 nebo Technický trénink + Core (45–55 min)';
    maxIntensity = 'Max. 65–72 % 1RM · Tepová zóna I2';
  } else if (avgReady < 90 || sleepH < 6 || fatigue >= 8) {
    nextWorkout = 'Aktivní odpočinek: chůze, dech 4-7-8 a mobilita (20–30 min)';
    maxIntensity = 'Bez zátěže · Tepová zóna I1 (regenerační)';
  }

  // Zohlednění klinických profilů v doporučení
  let profileGuard = '';
  if (STATE.condition === 'stroke') {
    maxIntensity += ' · Bez zádrže dechu!';
    profileGuard = ' U stavu po CMP dodržujte plynulý výdech při každém opakování.';
  } else if (STATE.condition === 'asthma') {
    profileGuard = ' Pro astma zařaďte 15min pozvolné rozcvičení v I1.';
  } else if (STATE.condition === 'bone' || (STATE.condition === 'hormonal' && STATE.sex === 'female')) {
    profileGuard = ' U vašeho profilu upřednostněte bezpečné axiální zatížení kostí s rovnými zády.';
  } else if (CONDITION_INFO[STATE.condition] && STATE.condition !== 'standard') {
    const caps = CONDITION_INFO[STATE.condition].caps || {};
    if (caps.maxPct) maxIntensity = maxIntensity.replace(/(\d+)(–(\d+))? % 1RM/, (m, a, b, c2) => `${Math.min(+(c2 || a), caps.maxPct)} % 1RM`);
    if (caps.noValsalva) maxIntensity += ' · Bez zádrže dechu';
    if (caps.pacing) { nextWorkout = 'Lehký pohyb podle energie (pacing), bez navyšování'; maxIntensity = 'Námaha max. 3–4 z 10'; }
    profileGuard = ` ${CONDITION_INFO[STATE.condition].short}: ${CONDITION_INFO[STATE.condition].train.how[0]}`;
  }

  document.getElementById('d-next-workout').textContent = nextWorkout;
  document.getElementById('d-max-intensity').textContent = maxIntensity;
  document.getElementById('d-advice-text').textContent =
    `💡 V praxi: Po jednotce (${srpe} AU, spánek ${sleepH} h, únava ${fatigue}/10) je nervový systém na ${Math.round(systems.cns.nowVal)} % a svalový glykogen na ${Math.round(systems.gly.nowVal)} %.${profileGuard}`;

  document.getElementById('d-do-now').textContent = ' ' + (doList.length ? doList.join(' • ') : 'Aktivní odpočinek a spánek');
  document.getElementById('d-light-now').textContent = ' ' + (lightList.length ? lightList.join(' • ') : 'Není nutné omezovat');
  document.getElementById('d-avoid-now').textContent = ' ' + (avoidList.length ? avoidList.join(' • ') : 'Žádná omezení – všechny systémy jsou v normě');
  document.getElementById('d-tomorrow').textContent = ' ' + tomorrowList.join(' • ');

  lastDiary = { systems, hours };
  renderCharts();
}

// Poslední vykreslený stav, aby šlo grafy překreslit při změně šířky okna
let lastDiary = null;

function renderCharts() {
  if (!lastDiary) return;
  renderCombinedChart(lastDiary.systems, lastDiary.hours);
  renderIndividualCharts(lastDiary.systems, lastDiary.hours);
}

function renderCombinedChart(systems, currentHours) {
  const host = document.getElementById('d-combined-chart');
  // Šířku SVG bereme z kontejneru, aby písmo mělo i na telefonu skutečnou velikost
  const W = Math.round(Math.max(300, Math.min(900, host.clientWidth - 16 || 760)));
  const narrow = W < 520;
  const H = narrow ? 220 : 240;
  const padL = 40, padR = 12, padT = 16, padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const minY = 65, maxY = 114;
  const FS = 12;
  const C = chartColors();

  const xPos = h => padL + (h / 96) * plotW;
  const yPos = v => padT + ((maxY - Math.max(minY, Math.min(maxY, v))) / (maxY - minY)) * plotH;

  const y100 = yPos(100);
  const yTop = yPos(maxY);
  const yBot = yPos(minY);

  let paths = '';
  let markers = '';

  Object.values(systems).forEach(sys => {
    const pts = [];
    for (let h = 0; h <= 96; h += 2) {
      pts.push(`${xPos(h).toFixed(1)},${yPos(evalSystemCurve(h, sys.dep, sys.tRec)).toFixed(1)}`);
    }
    paths += `<polyline fill="none" stroke="${sys.color}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="${sys.dash}" points="${pts.join(' ')}" />`;
    markers += `<circle cx="${xPos(currentHours).toFixed(1)}" cy="${yPos(sys.nowVal).toFixed(1)}" r="4.5" fill="${sys.color}" stroke="${C.dotStroke}" stroke-width="1.5" />`;
  });

  const curX = xPos(currentHours).toFixed(1);
  const tickHours = narrow ? [0, 24, 48, 72, 96] : [0, 12, 24, 36, 48, 60, 72, 84, 96];
  const xTicks = tickHours.map(h => `
    <line x1="${xPos(h)}" y1="${padT}" x2="${xPos(h)}" y2="${H - padB}" stroke="${C.grid}" stroke-width="1" />
    <text x="${xPos(h)}" y="${H - 8}" text-anchor="${h === 0 ? 'start' : h === 96 ? 'end' : 'middle'}" font-size="${FS}" fill="${C.text}" font-family="Inter, sans-serif">${h} h</text>
  `).join('');

  const yTicks = [70, 85, 100, 110].map(v => `
    <text x="${padL - 6}" y="${yPos(v) + 4}" text-anchor="end" font-size="${FS}" fill="${C.text}" font-family="Inter, sans-serif">${v}%</text>
  `).join('');

  const desc = Object.values(systems).map(s => `${s.name} ${Math.round(s.nowVal)} %`).join(', ');
  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="w-full h-auto block" role="img" aria-label="Společný graf superkompenzace. Po ${currentHours} hodinách: ${desc}.">
      <rect x="${padL}" y="${yTop}" width="${plotW}" height="${y100 - yTop}" fill="${C.up}" />
      <rect x="${padL}" y="${y100}" width="${plotW}" height="${yBot - y100}" fill="${C.down}" />
      ${xTicks}
      ${yTicks}
      <line x1="${padL}" y1="${y100}" x2="${W - padR}" y2="${y100}" stroke="${C.ink}" stroke-width="1.3" stroke-dasharray="4 3" />
      <text x="${W - padR - 4}" y="${y100 - 6}" text-anchor="end" font-size="${FS - 1}" font-weight="700" fill="${C.upText}" font-family="Inter, sans-serif">${narrow ? 'SUPERKOMP. &gt;100 %' : 'SUPERKOMPENZACE (&gt;100 %)'}</text>
      <text x="${W - padR - 4}" y="${y100 + 15}" text-anchor="end" font-size="${FS - 1}" font-weight="600" fill="${C.downText}" font-family="Inter, sans-serif">${narrow ? 'OBNOVA &lt;100 %' : 'ÚNAVA &amp; OBNOVA (&lt;100 %)'}</text>
      ${paths}
      <line x1="${curX}" y1="${padT}" x2="${curX}" y2="${H - padB}" stroke="${C.ink}" stroke-width="1.6" stroke-dasharray="3 3" />
      ${markers}
    </svg>
  `;
}

function renderIndividualCharts(systems, currentHours) {
  const W = 280, H = 130, padL = 38, padR = 10, padT = 12, padB = 22;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const minY = 65, maxY = 114;
  const C = chartColors();
  const xPos = h => padL + (h / 96) * plotW;
  const yPos = v => padT + ((maxY - Math.max(minY, Math.min(maxY, v))) / (maxY - minY)) * plotH;
  const y100 = yPos(100);

  document.getElementById('d-individual-charts').innerHTML = Object.values(systems).map(sys => {
    const pts = [];
    for (let h = 0; h <= 96; h += 3) {
      pts.push(`${xPos(h).toFixed(1)},${yPos(evalSystemCurve(h, sys.dep, sys.tRec)).toFixed(1)}`);
    }
    const cx = xPos(currentHours).toFixed(1);
    const cy = yPos(sys.nowVal).toFixed(1);

    return `
      <div class="sub-card p-3.5 space-y-2">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="text-[13px] font-extrabold text-slate-900">${sys.name}</div>
            <div class="text-[12px] text-slate-600">${sys.desc}</div>
          </div>
          <span class="text-[13px] font-extrabold px-2 py-0.5 rounded-lg whitespace-nowrap shrink-0" style="background:${sys.color}22; color:${sys.color}">
            ${Math.round(sys.nowVal)} %
          </span>
        </div>

        <div class="border border-slate-200 rounded-lg p-1" style="background:${C.panel}">
          <svg viewBox="0 0 ${W} ${H}" class="w-full h-auto block" role="img" aria-label="${sys.name}: ${Math.round(sys.nowVal)} %, ${sys.phase.label}">
            <rect x="${padL}" y="${padT}" width="${plotW}" height="${y100 - padT}" fill="${C.up}" />
            <line x1="${padL}" y1="${y100}" x2="${W - padR}" y2="${y100}" stroke="${C.text}" stroke-width="1" stroke-dasharray="3 2" />
            <text x="${padL - 4}" y="${y100 + 4}" text-anchor="end" font-size="11" fill="${C.text}">100%</text>
            <text x="${xPos(0)}" y="${H - 6}" text-anchor="start" font-size="11" fill="${C.text}">0 h</text>
            <text x="${xPos(48)}" y="${H - 6}" text-anchor="middle" font-size="11" fill="${C.text}">48 h</text>
            <text x="${xPos(96)}" y="${H - 6}" text-anchor="end" font-size="11" fill="${C.text}">96 h</text>
            <polyline fill="none" stroke="${sys.color}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="${sys.dash}" points="${pts.join(' ')}" />
            <line x1="${cx}" y1="${padT}" x2="${cx}" y2="${H - padB}" stroke="${C.ink}" stroke-width="1.2" stroke-dasharray="2 2" />
            <circle cx="${cx}" cy="${cy}" r="4" fill="${sys.color}" stroke="${C.dotStroke}" stroke-width="1.5" />
          </svg>
        </div>

        <div class="flex items-center justify-between gap-1">
          <span class="px-2 py-0.5 rounded-full text-[12px] font-bold ${sys.phase.cls}">${sys.phase.label}</span>
          <span class="text-[12px] text-slate-600">Obnova ~${Math.round(sys.tRec)} h</span>
        </div>
        <p class="text-[13px] text-slate-600 leading-snug">${sys.phase.tip}</p>
      </div>
    `;
  }).join('');
}

const DIARY_MAX = 400;

function getDiaryEntries() {
  try {
    const data = JSON.parse(safeGet('plab_v3_diary', '[]'));
    return Array.isArray(data) ? data.filter(x => x && Number.isFinite(x.id)) : [];
  } catch (e) {
    return [];
  }
}

function saveDiaryEntry() {
  // Datum tréninku: dnes = aktuální čas, jiný den = poledne toho dne
  const dVal = document.getElementById('d-date').value;
  const now = new Date();
  let ts = now.getTime();
  if (dVal && dVal !== todayISO()) {
    const [yy, mm, dd] = dVal.split('-').map(Number);
    ts = new Date(yy, mm - 1, dd, 12, 0, 0).getTime();
  }
  if (ts > now.getTime()) ts = now.getTime();
  const entry = {
    id: Date.now(),
    ts,
    date: new Date(ts).toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    pillar: document.getElementById('d-pillar').value,
    pillarName: document.getElementById('d-pillar').selectedOptions[0].text.split(' (')[0],
    title: document.getElementById('d-title').value.trim() || 'Tréninková jednotka',
    weight: num('d-weight', 0),
    reps: num('d-reps', 1),
    sets: num('d-sets', 1),
    time: num('d-time', 45),
    hr: num('d-hr', 135),
    rpe: num('d-rpe', 7),
    sleep: num('d-sleep', 7.5),
    fatigue: num('d-fatigue', 4),
    soreness: num('d-soreness', 4)
  };
  const list = [entry, ...getDiaryEntries()].sort((a, b) => entryTime(b) - entryTime(a)).slice(0, DIARY_MAX);
  const ok = safeSet('plab_v3_diary', JSON.stringify(list));
  document.getElementById('d-hours').value = Math.min(96, Math.max(0, Math.round((Date.now() - ts) / 3600000)));
  updateDiaryModel();
  renderDiaryHistory();
  calcFatigue();
  renderTrend();
  document.getElementById('d-save-status').textContent = ok
    ? 'Trénink uložen do deníku.'
    : 'Trénink se nepodařilo uložit: prohlížeč blokuje ukládání dat (soukromé okno nebo zakázané cookies).';
}

function loadDiaryEntry(id) {
  const item = getDiaryEntries().find(x => x.id === id);
  if (!item) return;
  document.getElementById('d-pillar').value = item.pillar;
  document.getElementById('d-title').value = item.title;
  document.getElementById('d-weight').value = item.weight;
  document.getElementById('d-reps').value = item.reps;
  document.getElementById('d-sets').value = item.sets;
  document.getElementById('d-time').value = item.time;
  document.getElementById('d-hr').value = item.hr;
  document.getElementById('d-rpe').value = item.rpe;
  document.getElementById('d-sleep').value = item.sleep;
  document.getElementById('d-fatigue').value = item.fatigue;
  document.getElementById('d-soreness').value = item.soreness;
  const elapsed = Math.min(96, Math.max(0, Math.round((Date.now() - entryTime(item)) / 3600000)));
  document.getElementById('d-hours').value = elapsed;
  updateDiaryModel();
}

function deleteDiaryEntry(id) {
  const list = getDiaryEntries().filter(x => x.id !== id);
  safeSet('plab_v3_diary', JSON.stringify(list));
  renderDiaryHistory();
  calcFatigue();
  renderTrend();
}

function resetDiaryDemo() {
  document.getElementById('d-pillar').value = 'strength';
  document.getElementById('d-title').value = 'Silový trénink – dřepy a tlaky';
  document.getElementById('d-weight').value = 80;
  document.getElementById('d-reps').value = 6;
  document.getElementById('d-sets').value = 4;
  document.getElementById('d-time').value = 65;
  document.getElementById('d-hr').value = 142;
  document.getElementById('d-rpe').value = 8;
  document.getElementById('d-sleep').value = 7.5;
  document.getElementById('d-fatigue').value = 4;
  document.getElementById('d-soreness').value = 5;
  document.getElementById('d-hours').value = 22;
  updateDiaryModel();
}

function renderDiaryHistory() {
  const all = getDiaryEntries().sort((x, y) => entryTime(y) - entryTime(x));
  const list = all.slice(0, 12);
  document.getElementById('d-history-count').textContent = `${all.length} uložených tréninků${all.length > 12 ? ' (zobrazeno posledních 12)' : ''}`;
  const container = document.getElementById('d-history-list');
  if (!list.length) {
    container.innerHTML = `<div class="col-span-full text-[13px] text-slate-600 sub-card p-3 text-center">Zatím nemáte uložený žádný vlastní záznam. Vyplňte parametry výše a klikněte na <strong>„+ Uložit trénink do deníku“</strong>.</div>`;
    return;
  }
  container.innerHTML = list.map(item => `
    <div class="sub-card p-3 flex flex-col justify-between gap-2">
      <div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-[12px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">${escapeHtml(item.pillarName || '')}</span>
          <span class="text-[12px] text-slate-500">${escapeHtml(item.date || '')}</span>
        </div>
        <div class="text-[13px] font-extrabold text-slate-900 mt-1">${escapeHtml(item.title || '')}</div>
        <div class="text-[13px] text-slate-600 mt-0.5">
          ${+item.weight > 0 ? `${+item.weight} kg × ${+item.reps} × ${+item.sets} · ` : ''}${+item.time} min · Tep ${+item.hr} · RPE ${+item.rpe}/10
        </div>
        <div class="text-[12px] text-slate-600">Spánek: ${fmt(+item.sleep, 1)} h · Únava: ${+item.fatigue}/10 · Svaly: ${+item.soreness}/10</div>
      </div>
      <div class="flex gap-1.5 pt-1 border-t border-slate-200">
        <button type="button" onclick="loadDiaryEntry(${item.id})" class="flex-1 py-1 rounded-lg bg-white border border-slate-300 text-[13px] font-semibold text-slate-800 hover:bg-slate-50">
          Načíst do grafu
        </button>
        <button type="button" onclick="deleteDiaryEntry(${item.id})" class="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-[13px] font-semibold hover:bg-rose-100">
          Smazat
        </button>
      </div>
    </div>
  `).join('');
}
