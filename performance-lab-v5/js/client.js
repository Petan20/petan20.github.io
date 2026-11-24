// Performance Lab · Můj profil: jedno místo pro údaje o klientovi
// Klasický skript. Údaje z profilu se propisují do Výživy, Zón, Hydratace a Plánu,
// aby se nemusely zadávat vícekrát.

const CLIENT_DEFAULT = { age: 35, weight: 75, height: 176, level: 'intermediate', hrRest: 62, hrMax: '', bb: false, fatigue: 3, sleep: 7.5, pain: 0, hrToday: '' };

function getClient() {
  const el = id => document.getElementById(id);
  if (!el('c-age')) return { ...CLIENT_DEFAULT };
  const hrMaxRaw = el('c-hrmax').value.trim();
  const hrTodayRaw = el('c-hrtoday').value.trim();
  return {
    age: num('c-age', CLIENT_DEFAULT.age),
    weight: num('c-weight', CLIENT_DEFAULT.weight),
    height: num('c-height', CLIENT_DEFAULT.height),
    level: el('c-level').value || 'intermediate',
    hrRest: num('c-hrrest', CLIENT_DEFAULT.hrRest),
    hrMax: hrMaxRaw ? num('c-hrmax', '') : '',
    bb: el('c-bb').checked,
    fatigue: num('c-fatigue', 3),
    sleep: num('c-sleep', 7.5),
    pain: num('c-pain', 0),
    hrToday: hrTodayRaw ? num('c-hrtoday', '') : ''
  };
}

function hrMaxOf(c) {
  return c.hrMax ? c.hrMax : Math.round(208 - 0.7 * c.age); // Tanaka 2001
}

// Karvonen: cílový tep = klidový tep + % × (max. tep − klidový tep)
function karvonen(c, loPct, hiPct) {
  const max = hrMaxOf(c);
  const reserve = Math.max(20, max - c.hrRest);
  return [Math.round(c.hrRest + reserve * loPct / 100), Math.round(c.hrRest + reserve * hiPct / 100)];
}

// Dnešní připravenost z únavy, spánku, bolesti a ranního tepu
function readinessOf(c) {
  let score = 100;
  const notes = [];
  if (c.fatigue > 3) { score -= (c.fatigue - 3) * 6; notes.push(`únava ${c.fatigue}/10`); }
  if (c.sleep < 7) { score -= Math.round((7 - c.sleep) * 8); notes.push(`spánek ${fmt(c.sleep, 1)} h`); }
  if (c.pain >= 4) { score -= (c.pain - 3) * 5; notes.push(`bolest ${c.pain}/10`); }
  if (c.hrToday !== '' && c.hrToday - c.hrRest >= 5) { score -= (c.hrToday - c.hrRest - 4) * 3; notes.push(`ranní tep o ${c.hrToday - c.hrRest} vyšší`); }
  score = Math.max(20, Math.min(100, Math.round(score)));
  if (score >= 85) return { score, level: 'good', label: 'Plná připravenost', volMult: 1, pctShift: 0, rirAdd: 0, lightOnly: false, notes,
    advice: 'Můžete trénovat podle plánu.' };
  if (score >= 70) return { score, level: 'mid', label: 'Mírná únava', volMult: 0.75, pctShift: -5, rirAdd: 1, lightOnly: false, notes,
    advice: 'Trénujte, ale uberte asi čtvrtinu sérií a nechte si o 1 opakování víc v záloze.' };
  if (score >= 55) return { score, level: 'low', label: 'Výrazná únava', volMult: 0.6, pctShift: -10, rirAdd: 2, lightOnly: true, notes,
    advice: 'Dnes jen lehký trénink: technika, mobilita, chůze. Žádné maximální pokusy, skoky ani intervaly.' };
  return { score, level: 'rest', label: 'Odpočinek', volMult: 0.4, pctShift: -15, rirAdd: 3, lightOnly: true, notes,
    advice: 'Dnes raději odpočívejte: procházka, dech, spánek. Pokud se stav opakuje několik dní, zvažte, zda nejste nemocní nebo přetížení.' };
}

function saveClient() {
  safeSet('plab_client', JSON.stringify(getClient()));
  safeSet('plab_profile', JSON.stringify({ sex: STATE.sex, condition: STATE.condition }));
}

function loadClient() {
  let c = { ...CLIENT_DEFAULT };
  try { c = { ...c, ...JSON.parse(safeGet('plab_client', '{}') || '{}') }; } catch (e) { /* výchozí */ }
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('c-age', c.age); set('c-weight', c.weight); set('c-height', c.height); set('c-level', c.level);
  set('c-hrrest', c.hrRest); set('c-hrmax', c.hrMax); set('c-fatigue', c.fatigue); set('c-sleep', c.sleep);
  set('c-pain', c.pain); set('c-hrtoday', c.hrToday);
  const bb = document.getElementById('c-bb'); if (bb) bb.checked = !!c.bb;
  // Pohlaví a zdravotní skupina
  try {
    const prof = JSON.parse(safeGet('plab_profile', '{}') || '{}');
    if (prof.condition && CONDITION_INFO[prof.condition]) {
      document.getElementById('profile-condition').value = prof.condition;
      STATE.condition = prof.condition;
    }
    if (prof.sex === 'female' || prof.sex === 'male') STATE.sex = prof.sex;
  } catch (e) { /* výchozí */ }
  pushClientToFields(getClient());
}

// Naplní výběr zdravotních skupin podle CONDITION_GROUPS
function initConditionSelect() {
  const sel = document.getElementById('profile-condition');
  sel.innerHTML = CONDITION_GROUPS.map(([group, keys]) =>
    `<optgroup label="${escapeHtml(group)}">${keys.filter(k => CONDITION_INFO[k]).map(k => {
      const info = CONDITION_INFO[k];
      return `<option value="${k}">${escapeHtml(info.label)}${info.sex === 'female' ? ' ♀' : ''}</option>`;
    }).join('')}</optgroup>`
  ).join('');
  sel.value = STATE.condition || 'standard';
}

// Zkopíruje údaje do ostatních polí aplikace (výživa, zóny, hydratace, plán)
function pushClientToFields(c) {
  const set = (id, v) => { const el = document.getElementById(id); if (el && v !== undefined && v !== '') el.value = v; };
  set('n-weight', c.weight); set('n-height', c.height); set('n-age', c.age);
  set('hr-age', c.age); set('hyd-weight', c.weight); set('p-level', c.level);
  const hrMaxEl = document.getElementById('hr-max'); if (hrMaxEl) hrMaxEl.value = c.hrMax || '';
  const hrRestEl = document.getElementById('hr-rest'); if (hrRestEl) hrRestEl.value = c.hrRest;
}

function onClientChange() {
  const c = getClient();
  pushClientToFields(c);
  saveClient();
  renderClientSummary();
  calcNutrition();
  calcHR();
  calcHydration();
  renderPlan();
  renderExercises();
  if (typeof renderSnacks === 'function') renderSnacks();
  if (typeof renderRecipes === 'function') renderRecipes();
}

function renderClientSummary() {
  const out = document.getElementById('client-summary');
  if (!out) return;
  const c = getClient();
  const r = readinessOf(c);
  STATE.clientReady = r;
  const info = CONDITION_INFO[STATE.condition] || CONDITION_INFO.standard;
  const caps = info.caps || {};
  const max = hrMaxOf(c);
  const bmi = c.weight / Math.pow(c.height / 100, 2);
  const zone2 = karvonen(c, 60, 70);
  const useRPE = c.bb || caps.useRPE;
  const lvl = { beginner: 'Začátečník', intermediate: 'Pokročilý', advanced: 'Výkonnostní' }[c.level];
  const cls = { good: 'status-ok', mid: 'status-mod', low: 'status-low', rest: 'status-no' }[r.level];
  out.innerHTML = `
    <div class="ready-card ${cls}">
      <div class="ready-score" aria-hidden="true">${r.score}</div>
      <div class="min-w-0">
        <div class="text-[12px] font-bold uppercase tracking-wider opacity-80">Dnešní připravenost</div>
        <div class="text-base font-extrabold">${r.label} (${r.score} %)</div>
        <p class="text-[13px] leading-relaxed mt-0.5">${r.advice}${r.notes.length ? ` <span class="opacity-80">Snižuje: ${r.notes.join(', ')}.</span>` : ''}</p>
      </div>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div class="sub-card p-2.5"><div class="text-[12px] font-semibold text-slate-600">Max. tep</div><div class="text-base font-extrabold text-slate-900 tabular-nums">${max}</div><div class="text-[12px] text-slate-600">${c.hrMax ? 'změřený' : 'odhad 208 − 0,7 × věk'}</div></div>
      <div class="sub-card p-2.5"><div class="text-[12px] font-semibold text-slate-600">Klidná vytrvalost (I2)</div><div class="text-base font-extrabold text-slate-900 tabular-nums">${zone2[0]}–${zone2[1]}</div><div class="text-[12px] text-slate-600">${useRPE ? 'řiďte se raději pocitem 3–4/10' : 'tepů/min (Karvonen)'}</div></div>
      <div class="sub-card p-2.5"><div class="text-[12px] font-semibold text-slate-600">BMI</div><div class="text-base font-extrabold text-slate-900 tabular-nums">${fmt(bmi, 1)}</div><div class="text-[12px] text-slate-600">u svalnatých lidí nadhodnocuje</div></div>
      <div class="sub-card p-2.5"><div class="text-[12px] font-semibold text-slate-600">Úroveň a stav</div><div class="text-[13px] font-extrabold text-slate-900">${lvl}</div><div class="text-[12px] text-slate-600">${escapeHtml(info.short)}</div></div>
    </div>
    ${useRPE ? `<p class="text-[13px] rounded-xl px-3 py-2 status-mod">${c.bb ? 'Betablokátory snižují tep o 20–30 %. ' : ''}Pro váš stav jsou tepové zóny nespolehlivé. Ve všech předpisech proto uvádíme hlavně <strong>pocit námahy (RPE 0–10)</strong>.</p>` : ''}
  `;
}
