// Performance Lab · Osobní předpis cviku: série, opakování, zátěž, pauza, tempo
// Klasický skript. Vychází z výchozího dávkování cviku (pro zdravého trénovaného sportovce)
// a upravuje ho podle profilu klienta: úroveň, věk, zdravotní skupina, dnešní připravenost,
// klidový a maximální tep, betablokátory.
//
// Metodika (zjednodušená):
//  - Úroveň: začátečník méně sérií a nižší % 1RM, víc opakování v záloze (ACSM 2009).
//  - Věk 60+ a 75+: nižší startovní zátěž, delší pauzy (Izquierdo 2021, ICFSR).
//  - Zdravotní skupina: stropy % 1RM, námahy (RPE) a tepové rezervy, zákaz zádrže dechu (CONDITION_INFO.caps).
//  - Připravenost: při únavě a špatném spánku méně sérií a nižší zátěž.
//  - Vytrvalost: tepové pásmo podle Karvonena (% tepové rezervy), při betablokátorech pocit námahy.

const LEVEL_RX = {
  beginner:     { sets: 0.75, pctShift: -10, rpe: [6, 7], label: 'začátečník: méně sérií, nižší zátěž, víc opakování v záloze' },
  intermediate: { sets: 1,    pctShift: -3,  rpe: [7, 8], label: 'pokročilý: standardní objem' },
  advanced:     { sets: 1.15, pctShift: 0,   rpe: [8, 9], label: 'výkonnostní: plný objem' }
};

// Karvonen: % tepové rezervy a pocit námahy (0–10) pro zóny
const ZONE_HRR = { I1: [50, 60], I2: [60, 70], I3: [70, 80], I4: [80, 90], I5: [90, 95] };
const ZONE_RPE = { I1: [2, 3], I2: [3, 4], I3: [5, 6], I4: [7, 8], I5: [9, 9] };

// Odhad 1RM jako násobek hmotnosti pro středně pokročilého muže (orientační startovní hodnota)
const LIFT_RATIO = {
  'Zadní dřep s velkou činkou': 1.25, 'Čelní dřep (Front Squat)': 1.0, 'Mrtvý tah s Trap Barem': 1.5,
  'Rumunský mrtvý tah (RDL)': 1.0, 'Bench press s činkou / jednoručkami': 1.0, 'Tlak nad hlavu ve stoji (OHP)': 0.6,
  'Hip Thrust s osou / jednoručkou': 1.5, 'Přítahy činky v předklonu': 0.8, 'Silové přemístění ze visu (Hang Clean)': 0.8,
  'Výrazový tlak (Push Press)': 0.75, 'Výskok s Trap Barem (Trap Bar Jump)': 1.5
};
const BARBELL_LIFTS = ['Zadní dřep s velkou činkou', 'Čelní dřep (Front Squat)', 'Rumunský mrtvý tah (RDL)', 'Tlak nad hlavu ve stoji (OHP)', 'Přítahy činky v předklonu', 'Silové přemístění ze visu (Hang Clean)', 'Výrazový tlak (Push Press)'];
const UPPER_LIFTS = ['Bench press s činkou / jednoručkami', 'Tlak nad hlavu ve stoji (OHP)', 'Výrazový tlak (Push Press)', 'Přítahy činky v předklonu'];

function getUser1RM() {
  try { return JSON.parse(safeGet('plab_1rm', '{}') || '{}'); } catch (e) { return {}; }
}
function setUser1RM(name, value) {
  const map = getUser1RM();
  const v = parseFloat(String(value).replace(',', '.'));
  if (v > 0) map[name] = v; else delete map[name];
  safeSet('plab_1rm', JSON.stringify(map));
  renderExercises();
}

function estimate1RM(name, c) {
  const ratio = LIFT_RATIO[name];
  if (!ratio) return null;
  const lvl = { beginner: 0.6, intermediate: 1, advanced: 1.35 }[c.level];
  const sex = STATE.sex === 'female' ? (UPPER_LIFTS.includes(name) ? 0.55 : 0.7) : 1;
  const age = c.age > 35 ? Math.max(0.6, 1 - 0.008 * (c.age - 35)) : 1;
  return c.weight * ratio * lvl * sex * age;
}

function repsForPct(pct) {
  if (pct >= 85) return '3–5';
  if (pct >= 80) return '4–6';
  if (pct >= 75) return '6–8';
  if (pct >= 70) return '8–10';
  if (pct >= 65) return '10–12';
  if (pct >= 55) return '12–15';
  return '15–20';
}

function fmtRest(sec) {
  if (sec < 90) return `${Math.round(sec / 5) * 5} s`;
  const t = Math.round(sec / 15) * 15;
  const m = Math.floor(t / 60), r = t % 60;
  return r ? `${m} min ${r} s` : `${m} min`;
}

function round5(v) { return Math.max(5, Math.round(v / 5) * 5); }
function roundKg(v) { return Math.max(2.5, Math.round(v / 2.5) * 2.5); }

// Hlavní funkce: vrátí stav a předpis pro jeden cvik
function prescribeExercise(ex) {
  const c = getClient();
  const info = CONDITION_INFO[STATE.condition] || CONDITION_INFO.standard;
  const caps = info.caps || {};
  const lvl = LEVEL_RX[c.level] || LEVEL_RX.intermediate;
  const ready = readinessOf(c);
  const flags = EX_FLAGS[ex.name] || [];
  const why = [];

  // 1) Vhodnost
  const st = exerciseStatusFor(ex, STATE.condition);
  let status = st.status;
  const reasons = st.reasons.slice();
  if (c.age >= 70 && !status && (flags.includes('impactHigh') || flags.includes('sprint'))) {
    status = 'mod';
    reasons.push('věk 70+: tvrdé dopady a sprinty jen po přípravě');
  }
  if (ready.lightOnly && (ex.pillar === 'explosive' || ex.pillar === 'agility' || flags.includes('hiit') || flags.includes('heavy'))) {
    if (!status) status = 'mod';
    reasons.push('nízká dnešní připravenost');
  }

  // 2) Násobky objemu a zátěže
  const ageSets = c.age >= 75 ? 0.8 : c.age >= 65 ? 0.9 : 1;
  const setsMult = lvl.sets * (caps.setsMult || 1) * ready.volMult * ageSets;
  const agePct = c.age >= 75 ? -10 : c.age >= 60 ? -5 : 0;
  const restMult = Math.max(caps.restMult || 1, c.age >= 65 ? 1.2 : 1);
  why.push(lvl.label.charAt(0).toUpperCase() + lvl.label.slice(1));
  if (agePct || ageSets < 1) why.push(`Věk ${c.age} let: nižší startovní zátěž${restMult > 1 ? ' a delší pauzy' : ''}`);
  if (ready.volMult < 1) why.push(`Připravenost ${ready.score} %: objem ×${fmt(ready.volMult, 2)}`);
  if (caps.setsMult && caps.setsMult < 1) why.push(`${info.short}: menší objem`);

  const dose = ex.dose;
  const out = { status, reasons, lines: [], why, kg: null, oneRM: null, isLoad: false };

  // 3) Série / počet úseků
  let rxDose = dose;
  const setMatch = dose.match(/^(\d+)(\s*(?:série\s*)?×)/);
  if (setMatch) {
    const base = +setMatch[1];
    const n = Math.min(base + 1, Math.max(1, Math.round(base * setsMult)));
    rxDose = rxDose.replace(/^(\d+)/, String(n));
  }
  // Minuty (vytrvalost bez série): 40–75 min → upravit podle objemu
  const minMatch = !setMatch && rxDose.match(/^(\d+)–(\d+) min/);
  if (minMatch) {
    const lo = round5(+minMatch[1] * setsMult), hi = Math.max(lo + 5, round5(+minMatch[2] * setsMult));
    rxDose = rxDose.replace(/^(\d+)–(\d+) min/, `${lo}–${hi} min`);
  }

  // 4) Zátěž v % 1RM
  const pctMatch = rxDose.match(/\((\d+)(?:–(\d+))? % 1RM\)/);
  let pctRange = null;
  if (pctMatch) {
    let lo = +pctMatch[1], hi = +(pctMatch[2] || pctMatch[1]);
    const shift = lvl.pctShift + agePct + ready.pctShift;
    lo += shift; hi += shift;
    if (caps.maxPct && hi > caps.maxPct) { hi = caps.maxPct; why.push(`${info.short}: strop ${caps.maxPct} % 1RM`); }
    lo = Math.max(30, Math.min(lo, hi - 5));
    hi = Math.max(lo + 5, hi);
    pctRange = [lo, hi];
    rxDose = rxDose.replace(pctMatch[0], `(${lo}–${hi} % 1RM)`);
    if (ex.pillar === 'strength') {
      rxDose = rxDose.replace(/^(\d+)×[\d–]+/, `$1×${repsForPct((lo + hi) / 2)}`);
    }
    out.isLoad = true;
  }

  // 5) Kg: vlastní 1RM nebo odhad
  const user = getUser1RM()[ex.name];
  const est = estimate1RM(ex.name, c);
  const oneRM = user || est;
  if (pctRange && oneRM) {
    out.kg = [roundKg(oneRM * pctRange[0] / 100), roundKg(oneRM * pctRange[1] / 100)];
    out.oneRM = { value: oneRM, own: !!user };
    // Velká činka (osa) váží 20 kg; nižší zátěž znamená jednoručky nebo lehčí variantu
    out.belowBar = BARBELL_LIFTS.includes(ex.name) && out.kg[1] < 20;
  }

  // 6) Pauza
  const restMatch = rxDose.match(/pauza (\d+(?:[.,]\d+)?)\s*(min|s)/);
  if (restMatch && restMult > 1) {
    const sec = parseFloat(restMatch[1].replace(',', '.')) * (restMatch[2] === 'min' ? 60 : 1) * restMult;
    rxDose = rxDose.replace(restMatch[0], `pauza ${fmtRest(sec)}`);
  }
  rxDose = rxDose.replace(/(\d)\.(\d)/g, '$1,$2').replace(/,?\s*\d+–\d+ % TFmax/, '').replace(/\(\s*\)/, '').replace(/\(, /, '(');
  out.lines.push(['Dávka', rxDose]);

  // 7) Intenzita podle pilíře
  if (ex.pillar === 'strength' || (ex.pillar === 'explosive' && pctRange)) {
    let rpe = lvl.rpe.slice();
    if (caps.maxRPE) rpe = rpe.map(v => Math.min(v, caps.maxRPE));
    rpe = rpe.map(v => Math.max(3, v - ready.rirAdd));
    const rir = [10 - rpe[1], 10 - rpe[0]];
    out.lines.push(['Námaha', `RPE ${rpe[0] === rpe[1] ? rpe[0] : rpe[0] + '–' + rpe[1]} · ${rir[0] === rir[1] ? rir[0] : rir[0] + '–' + rir[1]} opakování v záloze`]);
    if (caps.maxRPE) why.push(`${info.short}: námaha nejvýše ${caps.maxRPE}/10`);
  }
  if (ex.pillar === 'endurance') {
    const z = (dose.match(/I([1-5])(?:–I?([1-5]))?/) || []);
    let zLo = z[1] ? +z[1] : (flags.includes('hiit') ? 4 : flags.includes('threshold') ? 3 : 2);
    let zHi = z[2] ? +z[2] : zLo;
    const hrr = [ZONE_HRR['I' + zLo][0], ZONE_HRR['I' + zHi][1]];
    let rpe = [ZONE_RPE['I' + zLo][0], ZONE_RPE['I' + zHi][1]];
    if (caps.hrrCap) { hrr[1] = Math.min(hrr[1], caps.hrrCap); hrr[0] = Math.min(hrr[0], hrr[1] - 10); }
    if (caps.maxRPE) { rpe = rpe.map(v => Math.min(v, caps.maxRPE)); }
    if (ready.lightOnly) { hrr[1] = Math.min(hrr[1], 70); hrr[0] = Math.min(hrr[0], 60); rpe = rpe.map(v => Math.min(v, 4)); }
    const hr = karvonen(c, hrr[0], hrr[1]);
    const useRPE = c.bb || caps.useRPE;
    const rpeTxt = `pocit námahy ${rpe[0] === rpe[1] ? rpe[0] : rpe[0] + '–' + rpe[1]}/10`;
    out.lines.push(['Intenzita', useRPE
      ? `${rpeTxt} (tep jen orientačně ${hr[0]}–${hr[1]})`
      : `${hr[0]}–${hr[1]} tepů/min (${hrr[0]}–${hrr[1]} % tepové rezervy) · ${rpeTxt}`]);
    why.push(`Tep podle Karvonena: klidový ${c.hrRest}, max. ${hrMaxOf(c)} tepů/min`);
    if (caps.hrrCap) why.push(`${info.short}: nejvýše ${caps.hrrCap} % tepové rezervy`);
    if (c.bb) why.push('Betablokátory: řiďte se pocitem námahy');
  }
  if (ex.pillar === 'explosive' && !pctRange) out.lines.push(['Intenzita', 'Maximální rychlost, měkký dopad. Série ukončete, když klesá výška nebo rychlost.']);
  if (ex.pillar === 'agility') out.lines.push(['Intenzita', ready.lightOnly ? 'Dnes jen technicky na 60–70 %.' : 'Plná rychlost jen s úplnou pauzou; kvalita před počtem.']);
  if (ex.pillar === 'coord') out.lines.push(['Provedení', flags.includes('endRange') && STATE.condition === 'hypermobility' ? 'Pomalu, zastavte před krajní polohou kloubu.' : 'Pomalu a kontrolovaně, plynulý dech.']);

  // 8) Tempo a dech
  if (ex.pillar === 'strength') {
    const tempo = STATE.condition === 'hypermobility' ? '3-1-3 (pomalu oběma směry)' : c.level === 'beginner' ? '3-1-1 (3 s dolů, krátká pauza, nahoru)' : '2-0-1 (kontrolovaně dolů, rázně nahoru)';
    out.lines.push(['Tempo', tempo]);
  }
  if (caps.noValsalva && (ex.pillar === 'strength' || ex.pillar === 'explosive')) {
    out.lines.push(['Dech', 'Vydechujte při námaze, nikdy nezadržujte dech.']);
  }
  return out;
}

// Pro koho je cvik vhodný (přehled přes všechny skupiny)
function exerciseAudience(ex) {
  const no = [], mod = [];
  Object.entries(CONDITION_INFO).forEach(([k, info]) => {
    if (k === 'standard') return;
    const s = exerciseStatusFor(ex, k).status;
    if (s === 'no') no.push(info.short);
    else if (s === 'mod') mod.push(info.short);
  });
  return { no, mod };
}

// Proužek s aktivními úpravami nad databází cviků
function renderRxStrip() {
  const el = document.getElementById('rx-strip');
  if (!el) return;
  const c = getClient();
  const info = CONDITION_INFO[STATE.condition] || CONDITION_INFO.standard;
  const caps = info.caps || {};
  const r = readinessOf(c);
  const chips = [
    `${{ beginner: 'Začátečník', intermediate: 'Pokročilý', advanced: 'Výkonnostní' }[c.level]}`,
    `${c.age} let · ${fmt(c.weight)} kg`,
    `Připravenost ${r.score} %`,
    info.short
  ];
  if (caps.maxPct) chips.push(`max. ${caps.maxPct} % 1RM`);
  if (caps.maxRPE) chips.push(`námaha max. ${caps.maxRPE}/10`);
  if (caps.noValsalva) chips.push('bez zádrže dechu');
  if (c.bb || caps.useRPE) chips.push('řídit pocitem, ne tepem');
  el.innerHTML = `<span class="text-[13px] font-bold text-slate-900">Dávkování je spočítané pro:</span> ${chips.map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('')}
    <button type="button" class="link-btn" onclick="switchView('sec-start')">Upravit profil</button>`;
}
