// Performance Lab · Výběr sportu, profil sportu a týdenní plán
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

// ============================================================================
// VÝBĚR SPORTU (společný pro plán, profil sportu a zóny)
// ============================================================================
function initSportSelects() {
  const groups = {};
  Object.entries(SPORT_DB).forEach(([k, sp]) => { (groups[sp.group] = groups[sp.group] || []).push([k, sp.name]); });
  const html = Object.entries(groups).map(([g, items]) =>
    `<optgroup label="${g}">${items.map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</optgroup>`
  ).join('');
  ['p-sport', 'sport-select', 'goal-sport'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = html; });
  const saved = safeGet('plab_sport', 'tennis');
  STATE.sport = SPORT_DB[saved] ? saved : 'tennis';
  document.getElementById('p-sport').value = STATE.sport;
  document.getElementById('sport-select').value = STATE.sport;
  if (document.getElementById('goal-sport')) document.getElementById('goal-sport').value = STATE.sport;
}

function setSport(key) {
  if (!SPORT_DB[key]) return;
  STATE.sport = key;
  safeSet('plab_sport', key);
  document.getElementById('p-sport').value = key;
  document.getElementById('sport-select').value = key;
  if (document.getElementById('goal-sport')) document.getElementById('goal-sport').value = key;
  // Zóny: plavání má nižší HRmax, vytrvalostní stroje mírně nižší
  document.getElementById('hr-sport').value = key === 'swimming' ? 'swim' : (key === 'cycling' || key === 'rowing' || key === 'xcski') ? 'bike' : 'run';
  renderSportProfile();
  renderPlan();
  calcHR();
  renderPerfForm();
  if (typeof renderGoals === 'function') renderGoals();
}

function renderSportProfile() {
  const sp = SPORT_DB[STATE.sport];
  if (!sp) return;
  const bars = [['strength', sp.abilities.s], ['endurance', sp.abilities.e], ['explosive', sp.abilities.x], ['agility', sp.abilities.a], ['coord', sp.abilities.c]];
  const vo = (r) => `${r[0]}–${r[1]}`;
  document.getElementById('sport-profile').innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <div class="sub-card p-3">
        <div class="text-[13px] font-semibold text-slate-600">VO2max elitních mužů</div>
        <div class="text-lg font-extrabold text-slate-900">${vo(sp.vo2[0])} <span class="text-[13px] font-semibold text-slate-600">ml/kg/min</span></div>
      </div>
      <div class="sub-card p-3">
        <div class="text-[13px] font-semibold text-slate-600">VO2max elitních žen</div>
        <div class="text-lg font-extrabold text-slate-900">${vo(sp.vo2[1])} <span class="text-[13px] font-semibold text-slate-600">ml/kg/min</span></div>
      </div>
      <div class="sub-card p-3 text-[13px] text-slate-700 flex items-center">${sp.approx ? 'Hrubý odhad z menšího počtu studií.' : 'Typické rozpětí z přehledů sportovní fyziologie.'} Rekreační sportovci mívají o 10–20 jednotek méně.</div>
    </div>
    <div class="space-y-2.5">
      <div class="text-[13px] font-extrabold text-slate-900">Nároky na pilíře <span class="font-semibold text-slate-600">(odborný odhad)</span></div>
      ${bars.map(([k, v]) => `
        <div>
          <div class="flex justify-between text-[13px] font-semibold mb-1">
            <span class="inline-flex items-center gap-1.5 text-slate-700"><span class="pillar-dot" style="background:${pillarColor(k)}"></span>${PILLAR_LABELS[k]}</span>
            <span class="text-slate-900">${v} %</span>
          </div>
          <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full rounded-full metric-fill" style="width:${v}%; background:${pillarColor(k)}"></div></div>
        </div>`).join('')}
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
      <div class="sub-card p-3"><div class="font-extrabold text-slate-900 mb-1">Energetické systémy</div><p class="text-slate-700 leading-relaxed">${sp.energy}</p></div>
      <div class="sub-card p-3"><div class="font-extrabold text-slate-900 mb-1">Nároky výkonu</div><p class="text-slate-700 leading-relaxed">${sp.demands}</p></div>
    </div>
    <div class="text-[13px]">
      <div class="font-extrabold text-slate-900 mb-1">Jak sport trénovat</div>
      <ul class="space-y-1.5">${sp.how.map(t => `<li class="flex gap-2"><span class="text-indigo-500 font-extrabold shrink-0" aria-hidden="true">›</span><span class="text-slate-800">${t}</span></li>`).join('')}</ul>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
      <div class="bg-rose-50 border border-rose-200 rounded-xl p-3">
        <div class="font-extrabold text-rose-800 mb-1">Prevence zranění</div>
        <ul class="space-y-1 text-rose-950">${sp.injuries.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>
      <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
        <div class="font-extrabold text-emerald-800 mb-1">Výživa pro tento sport</div>
        <p class="text-emerald-950">${sp.nutri}</p>
      </div>
    </div>
    <div class="text-[13px] text-slate-700"><strong>Doporučené testy:</strong> ${sp.tests.map(t => PERF_TESTS[t].name).join(', ')} (sekce Klinické testy).</div>
  `;
}

// ============================================================================
// TÝDENNÍ PLÁN
// ============================================================================
function adaptSession(key, level) {
  const cond = STATE.condition;
  let k = key;
  const notes = [];
  if (cond === 'stroke') {
    if (k === 'S_MAX' || k === 'S_HYP') { k = 'S_END'; notes.push('Po CMP místo maximální síly silová vytrvalost.'); }
    if (k === 'E4' || k === 'E5' || k === 'RSA') { k = 'E3'; notes.push('Po CMP bez vysoké intenzity, jen po schválení lékařem.'); }
    if (k === 'X') { k = 'C'; }
  }
  if (cond === 'bone' && k === 'X') notes.push('Jen nízké odrazy s měkkým dopadem (Box Jump, Pogo), žádné seskoky.');
  if (cond === 'asthma' && SESSION_LIB[k].hard) notes.push('Před intenzivní částí 15 min postupného rozcvičení, inhalátor po ruce.');
  if (cond === 'hormonal' && (k === 'S_MAX' || k === 'S_HYP')) notes.push('Silový trénink je pro kosti a svaly klíčový, delší rozcvičení a pauza mezi těžkými dny.');
  // Nové zdravotní skupiny: náhrady jednotek podle CONDITION_INFO.planSwap
  const info = CONDITION_INFO[cond];
  if (info && info.planSwap && info.planSwap[k]) {
    k = info.planSwap[k];
    if (info.planNote && !notes.includes(info.planNote)) notes.push(info.planNote);
  } else if (info && info.planNote && SESSION_LIB[k].hard) {
    notes.push(info.planNote);
  }
  if (level === 'beginner') {
    if (k === 'S_MAX') k = 'S_GEN';
    if (k === 'E5' || k === 'RSA') k = 'E4';
  }
  return { key: k, notes };
}

function planExercises(pillar, n) {
  const pool = (EXERCISES[pillar] || []).filter(ex => exerciseStatusFor(ex, STATE.condition).status !== 'no');
  // Vybereme rovnoměrně z různých pohybových vzorců
  const seen = new Set();
  const out = [];
  for (const ex of pool) { if (!seen.has(ex.pattern)) { seen.add(ex.pattern); out.push(ex); } if (out.length >= n) break; }
  for (const ex of pool) { if (out.length >= n) break; if (!out.includes(ex)) out.push(ex); }
  return out.slice(0, n);
}

function buildPlan() {
  const sp = SPORT_DB[STATE.sport];
  const period = document.getElementById('p-period').value;
  const level = document.getElementById('p-level').value;
  let days = +document.getElementById('p-days').value;
  if (period === 'trans') days = Math.min(days, 4);
  const tpl = PLAN_TEMPLATES[sp.cat][period];
  const picked = tpl.slice(0, days).map(k => adaptSession(k, level));

  // Rozmístění: těžké jednotky nedáváme za sebe, pokud to jde
  const slots = DAY_PATTERNS[days] || DAY_PATTERNS[4];
  const hard = picked.filter(p => SESSION_LIB[p.key].hard);
  const easy = picked.filter(p => !SESSION_LIB[p.key].hard);
  // zápas/závod na víkend
  const isEvent = p => p.key === 'MATCH' || p.key === 'RACE' || p.key === 'E1L';
  const ordered = [];
  let prevHard = false;
  const hq = hard.filter(p => !isEvent(p)), eq = easy.filter(p => !isEvent(p)), events = picked.filter(isEvent);
  for (let i = 0; i < slots.length - events.length; i++) {
    let next;
    if (prevHard && eq.length) next = eq.shift();
    else if (hq.length) next = hq.shift();
    else next = eq.shift() || hq.shift();
    ordered.push(next);
    prevHard = next && SESSION_LIB[next.key].hard;
  }
  events.forEach(e => ordered.push(e));

  const week = DAY_NAMES.map((d, i) => ({ day: d, idx: i, session: null }));
  slots.forEach((dayIdx, i) => { if (ordered[i]) week[dayIdx].session = ordered[i]; });
  week.forEach(w => { if (!w.session) w.session = { key: 'REST', notes: [] }; });
  return { sp, period, level, week };
}

function sessionMinutes(key, level) {
  const [a, b] = SESSION_LIB[key].min;
  if (level === 'beginner') return [a, Math.round((a + b) / 2)];
  if (level === 'advanced') return [Math.round((a + b) / 2), b];
  return [a, b];
}

function dayCarbs(load) {
  const w = (STATE.nut && STATE.nut.w) || 70;
  const strengthSport = SPORT_DB[STATE.sport].cat === 'strength';
  const range = CARB_BY_LOAD[load].range.slice();
  if (strengthSport && load !== 'rest' && load !== 'light') { range[0] = Math.max(3, range[0] - 1); range[1] = Math.max(range[0] + 1, range[1] - 2); }
  return { range, g: [Math.round(w * range[0] / 10) * 10, Math.round(w * range[1] / 10) * 10], label: CARB_BY_LOAD[load].label };
}

function renderPlan() {
  if (!STATE.sport || !document.getElementById('plan-week')) return;
  const plan = buildPlan();
  STATE.plan = plan;
  const todayIdx = (new Date().getDay() + 6) % 7;
  const protRange = PROTEIN_GROUPS[document.getElementById('n-sport') ? document.getElementById('n-sport').value : 'strengthNovice'];

  document.getElementById('plan-week').innerHTML = plan.week.map(w => {
    const ses = SESSION_LIB[w.session.key];
    const col = pillarColor(ses.pillar);
    const mins = sessionMinutes(w.session.key, plan.level);
    const carbs = dayCarbs(ses.load);
    const exs = (w.session.key === 'REST' || w.session.key === 'MATCH' || w.session.key === 'RACE' || w.session.key === 'SPEC') ? []
      : ses.ex ? ses.ex.map(n => ALL_EXERCISES.find(e => e.name === n)).filter(Boolean).filter(e => exerciseStatusFor(e, STATE.condition).status !== 'no')
      : planExercises(ses.pillar, 3);
    const isToday = w.idx === todayIdx;
    return `
      <article class="sub-card p-3.5 space-y-2 ${isToday ? 'ring-2 ring-sky-500' : ''}" style="border-left:4px solid ${col}">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[13px] font-extrabold text-slate-900">${w.day}${isToday ? ' · dnes' : ''}</span>
          <span class="text-[12px] font-bold px-2 py-0.5 rounded-full" style="background:${col}22; color:${col}">${ses.tag || PILLAR_LABELS[ses.pillar]}</span>
        </div>
        <div class="text-sm font-extrabold text-slate-900">${ses.name}</div>
        <div class="flex flex-wrap gap-1.5 text-[12px] font-semibold">
          ${w.session.key !== 'REST' ? `<span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">${mins[0]}–${mins[1]} min</span>` : ''}
          <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">${ses.zone}</span>
        </div>
        <p class="text-[13px] text-slate-700 leading-relaxed">${ses.how}</p>
        ${exs.length ? `<div class="text-[13px] text-slate-700"><strong>Cviky:</strong> ${exs.map(e => e.name).join(' · ')}</div>` : ''}
        ${w.session.notes.length ? `<div class="text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">${w.session.notes.join(' ')}</div>` : ''}
        <div class="text-[13px] border-t border-slate-200 pt-2 text-slate-700">
          <strong>Sacharidy:</strong> ${carbs.range[0]}–${carbs.range[1]} g/kg (${carbs.g[0]}–${carbs.g[1]} g) · ${carbs.label}
        </div>
      </article>`;
  }).join('');

  // Shrnutí
  const counts = {};
  let totalMin = 0, hardCount = 0;
  plan.week.forEach(w => {
    const ses = SESSION_LIB[w.session.key];
    if (w.session.key !== 'REST') { counts[ses.pillar] = (counts[ses.pillar] || 0) + 1; const m = sessionMinutes(w.session.key, plan.level); totalMin += (m[0] + m[1]) / 2; }
    if (ses.hard) hardCount++;
  });
  const sp = plan.sp;
  document.getElementById('plan-summary').innerHTML = `
    <div class="sub-card p-2.5"><div class="text-[12px] font-semibold text-slate-600">Tréninkový čas</div><div class="text-base font-extrabold text-slate-900">${fmt(Math.round(totalMin / 5) * 5)} min</div></div>
    <div class="sub-card p-2.5"><div class="text-[12px] font-semibold text-slate-600">Náročné jednotky</div><div class="text-base font-extrabold text-slate-900">${hardCount} z ${plan.week.filter(w => w.session.key !== 'REST').length}</div></div>
    <div class="sub-card p-2.5"><div class="text-[12px] font-semibold text-slate-600">Bílkoviny</div><div class="text-base font-extrabold text-slate-900">${STATE.nut ? fmt(STATE.nut.protPerKg, 1) : '–'} g/kg</div></div>
    <div class="sub-card p-2.5"><div class="text-[12px] font-semibold text-slate-600">Pilíře</div><div class="flex gap-1 mt-1 flex-wrap">${Object.entries(counts).map(([k, c]) => `<span class="text-[12px] font-bold px-1.5 py-0.5 rounded" style="background:${pillarColor(k)}22;color:${pillarColor(k)}">${PILLAR_LABELS[k]} ${c}×</span>`).join('')}</div></div>
  `;
  const periodText = { prep: 'V přípravném období budujete objem a obecné schopnosti.', comp: 'V sezóně udržujete sílu malým objemem a šetříte síly na zápasy nebo závody.', trans: 'Přechodné období slouží k odpočinku hlavy i těla, jen lehký pohyb (2–4 týdny).' }[plan.period];
  const rules = { why: (CONDITION_INFO[STATE.condition] && CONDITION_INFO[STATE.condition].rules.why) || '' };
  document.getElementById('plan-notes').innerHTML = `
    <p>${periodText} ${sp.cat === 'endurance' || sp.cat === 'middle' ? 'U vytrvalosti držte většinu objemu v zónách I1–I2.' : ''}</p>
    ${rules && rules.why ? `<p class="text-amber-800"><strong>Váš profil:</strong> ${rules.why}</p>` : ''}
    <p>Bílkoviny ${protRange ? fmt(protRange.range[0], 1) + '–' + fmt(protRange.range[1], 1) : '1,2–2,0'} g/kg denně, rozložené do 4–5 jídel po 0,25–0,3 g/kg (ACSM 2016).</p>
  `;
  renderToday();
  if (typeof renderGoals === 'function') renderGoals();
}

// Dnešní jednotka podle plánu, upravená podle připravenosti z deníku
function renderToday() {
  if (!STATE.plan) return;
  const todayIdx = (new Date().getDay() + 6) % 7;
  const w = STATE.plan.week[todayIdx];
  const ses = SESSION_LIB[w.session.key];
  const ready = getDiaryEntries().length ? STATE.readiness : undefined;
  let swap = '';
  if (ready === undefined) swap = `<div class="text-[13px] bg-slate-100 rounded-lg p-2 text-slate-700">Uložte trénink do deníku a plán vám řekne, jestli dnešní jednotku upravit podle připravenosti.</div>`;
  if (ses.hard && ready !== undefined && ready < 90) {
    swap = `<div class="text-[13px] bg-rose-50 border border-rose-200 rounded-lg p-2 text-rose-950"><strong>Připravenost z deníku je ${ready} %.</strong> Dnes raději vyměňte za lehkou jednotku: ${SESSION_LIB.C.name.toLowerCase()} nebo ${SESSION_LIB.E1.name.toLowerCase()} v I1. Náročný trénink posuňte o den.</div>`;
  } else if (ses.hard && ready !== undefined && ready < 97) {
    swap = `<div class="text-[13px] bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-950"><strong>Připravenost ${ready} %.</strong> Trénink udělejte, ale zkraťte o 20–30 % nebo snižte intenzitu o jednu zónu.</div>`;
  } else if (ready !== undefined) {
    swap = `<div class="text-[13px] bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-emerald-950">Připravenost ${ready} %: trénink můžete udělat podle plánu.</div>`;
  }
  const carbs = dayCarbs(ses.load);
  document.getElementById('plan-today').innerHTML = `
    <div class="text-[12px] font-bold uppercase tracking-wider text-sky-600">Dnes · ${w.day}</div>
    <div class="text-base font-extrabold text-slate-900">${ses.name}</div>
    <div class="text-[13px] text-slate-700">${ses.zone}${w.session.key !== 'REST' ? ' · ' + sessionMinutes(w.session.key, STATE.plan.level).join('–') + ' min' : ''}</div>
    ${swap}
    <div class="text-[13px] text-slate-700"><strong>Jídlo dnes:</strong> sacharidy ${carbs.g[0]}–${carbs.g[1]} g. ${ses.hard || ses.load === 'high' ? 'Lehké jídlo se sacharidy 2–3 h před tréninkem, po tréninku sacharidy a bílkoviny do 1 hodiny.' : 'Běžné rozložení jídel během dne.'}</div>
  `;
}
