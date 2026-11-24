// Performance Lab · Intenzitní zóny a výkonnostní testy
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

// ============================================================================
// INTENZITNÍ ZÓNY
// ============================================================================
function calcHR() {
  const age = num('hr-age', 30);
  const measured = num('hr-max', NaN);
  const mode = document.getElementById('hr-sport').value;
  const estimated = Math.round(208 - 0.7 * age);
  let hrmax = Number.isNaN(measured) ? estimated : measured;
  let basis = Number.isNaN(measured)
    ? `Odhad HRmax podle věku: <strong>${estimated} tepů/min</strong> (Tanaka 2001).`
    : `Změřená HRmax: <strong>${measured} tepů/min</strong>.`;
  if (mode === 'swim' && Number.isNaN(measured)) {
    hrmax -= 12;
    basis += ` Pro plavání snížena o 12 tepů na <strong>${hrmax}</strong> (DiCarlo 1991).`;
  } else if (mode === 'bike') {
    basis += ' Na kole, veslařském trenažéru a běžkách bývá HRmax o několik tepů nižší než při běhu; nejpřesnější je změřit ji přímo v daném sportu.';
  }
  // Karvonen: % tepové rezervy z klidového tepu (ACSM)
  const rest = num('hr-rest', NaN);
  const KARV = { I1: [50, 60], I2: [60, 70], I3: [70, 80], I4: [80, 90], I5: [90, 100] };
  const karv = id => {
    if (Number.isNaN(rest) || !KARV[id]) return '<span class="text-slate-600">–</span>';
    const r = Math.max(20, hrmax - rest);
    return `<strong class="text-slate-900">${Math.round(rest + r * KARV[id][0] / 100)}–${Math.round(rest + r * KARV[id][1] / 100)}</strong><div class="text-slate-600">${KARV[id][0]}–${KARV[id][1]} % rezervy</div>`;
  };
  if (!Number.isNaN(rest)) basis += ` Klidový tep <strong>${rest}</strong>, tepová rezerva <strong>${hrmax - rest}</strong> tepů (Karvonen).`;
  document.getElementById('hr-basis').innerHTML = basis;
  document.querySelector('#zone-table tbody').innerHTML = ZONES.map(z => `
    <tr>
      <td class="py-2 pr-2"><span class="font-extrabold text-slate-900">${z.id}</span><div class="text-slate-600">${z.name}</div></td>
      <td class="py-2 px-2 tabular-nums">${z.hr ? `<strong class="text-slate-900">${Math.round(hrmax * z.hr[0] / 100)}–${Math.round(hrmax * z.hr[1] / 100)}</strong><div class="text-slate-600">${z.hr[0]}–${z.hr[1]} % HRmax</div>` : '<span class="text-slate-600">řídí se časem a rychlostí</span>'}</td>
      <td class="py-2 px-2 tabular-nums">${karv(z.id)}</td>
      <td class="py-2 px-2 tabular-nums text-slate-700">${z.lac}</td>
      <td class="py-2 px-2 text-slate-700">${z.rpe}<div class="text-slate-600">${z.talk}</div></td>
      <td class="py-2 pl-2 text-slate-800"><strong>${z.purpose}</strong><div class="text-slate-700">${z.how}</div><div class="text-slate-600">Příklad: ${z.example}</div></td>
    </tr>
  `).join('');
}

// ============================================================================
// VÝKONNOSTNÍ TESTY
// ============================================================================
const PERF_KEY = 'plab_v4_tests';
function getPerf() {
  try { const d = JSON.parse(safeGet(PERF_KEY, '[]')); return Array.isArray(d) ? d.filter(r => r && PERF_TESTS[r.test] && Number.isFinite(+r.value)) : []; }
  catch (e) { return []; }
}
function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function czDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${+m[3]}. ${+m[2]}. ${m[1]}` : iso;
}

function initPerf() {
  document.getElementById('pt-date').value = todayISO();
  document.getElementById('pt-date').max = todayISO();
  document.getElementById('d-date').max = todayISO();
  renderPerfForm();
  renderPerfResults();
}

function renderPerfForm() {
  const sel = document.getElementById('pt-test');
  const current = sel.value;
  const rec = SPORT_DB[STATE.sport] ? SPORT_DB[STATE.sport].tests : [];
  sel.innerHTML = Object.entries(PERF_TESTS).map(([k, t]) => `<option value="${k}">${t.name}${rec.includes(k) ? ' ★ doporučeno' : ''}</option>`).join('');
  sel.value = PERF_TESTS[current] ? current : (rec[0] || 'cooper');
  const t = PERF_TESTS[sel.value];
  document.getElementById('pt-how').textContent = t.how;
  const inp = document.getElementById('pt-value');
  inp.step = t.step; inp.min = t.min; inp.max = t.max;
  document.getElementById('pt-value-label').textContent = `Výsledek (${t.unit})`;
}

function ageSex() {
  return { age: num('n-age', 30), sex: STATE.sex };
}

function rateTest(test, value) {
  const { age, sex } = ageSex();
  if (test === 'cooper') {
    if (age < 20) return { text: 'Normy Cooper 1968 platí od 20 let', cls: 'bg-slate-100 text-slate-700' };
    const row = COOPER_NORMS[sex].find(([lim]) => age <= lim)[1];
    const labels = ['Výborný', 'Nadprůměrný', 'Průměrný', 'Podprůměrný', 'Slabý'];
    const idx = value > row[0] ? 0 : value >= row[1] ? 1 : value >= row[2] ? 2 : value >= row[3] ? 3 : 4;
    const vo2 = Math.max(0, (value - 504.9) / 44.73);
    return { text: `${labels[idx]} · odhad VO2max ${fmt(vo2, 1)} ml/kg/min`, cls: idx <= 1 ? 'bg-emerald-100 text-emerald-800' : idx === 2 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800' };
  }
  if (test === 'balance') {
    const norm = BALANCE_NORMS.find(([lim]) => age <= lim)[1];
    const ok = value >= norm;
    return { text: `${ok ? 'Na úrovni nebo nad průměrem' : 'Pod průměrem'} věku (průměr ${fmt(norm, 1)} s)`, cls: ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800' };
  }
  if (test === 'chair') {
    if (age < 60) return { text: 'Normy Rikli & Jones platí pro 60+', cls: 'bg-slate-100 text-slate-700' };
    const row = CHAIR_NORMS.find(([lim]) => age <= lim);
    const [lo, hi] = sex === 'male' ? row[1] : row[2];
    const txt = value < lo ? `Pod běžným rozpětím (${lo}–${hi})` : value > hi ? `Nad běžným rozpětím (${lo}–${hi})` : `V běžném rozpětí (${lo}–${hi})`;
    return { text: txt, cls: value < lo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800' };
  }
  return null;
}

function savePerfTest() {
  const test = document.getElementById('pt-test').value;
  const t = PERF_TESTS[test];
  const raw = parseFloat(String(document.getElementById('pt-value').value).replace(',', '.'));
  const status = document.getElementById('pt-status');
  if (Number.isNaN(raw) || raw < t.min || raw > t.max) {
    status.textContent = `Zadejte výsledek v rozmezí ${t.min}–${t.max} ${t.unit}.`;
    return;
  }
  let date = document.getElementById('pt-date').value || todayISO();
  if (date > todayISO()) date = todayISO();
  const list = [...getPerf(), { test, value: raw, date }].sort((a, b) => a.date.localeCompare(b.date)).slice(-300);
  status.textContent = safeSet(PERF_KEY, JSON.stringify(list)) ? 'Výsledek uložen.' : 'Uložení se nepodařilo, prohlížeč blokuje ukládání dat.';
  document.getElementById('pt-value').value = '';
  renderPerfResults();
}

function deletePerf(test, date, value) {
  const list = getPerf();
  const i = list.findIndex(r => r.test === test && r.date === date && +r.value === +value);
  if (i >= 0) list.splice(i, 1);
  safeSet(PERF_KEY, JSON.stringify(list));
  renderPerfResults();
}

function renderPerfResults() {
  const list = getPerf();
  const box = document.getElementById('pt-results');
  if (!list.length) {
    box.innerHTML = `<div class="sm:col-span-2 sub-card p-3 text-[13px] text-slate-600">Zatím žádné výsledky. Vyberte test, změřte se a uložte výsledek. Po dalším testu uvidíte svůj pokrok.</div>`;
    return;
  }
  const byTest = {};
  list.forEach(r => (byTest[r.test] = byTest[r.test] || []).push(r));
  box.innerHTML = Object.entries(byTest).map(([k, rows]) => {
    const t = PERF_TESTS[k];
    const last = rows[rows.length - 1];
    const prev = rows.length > 1 ? rows[rows.length - 2] : null;
    const diff = prev ? last.value - prev.value : null;
    const better = diff === null || diff === 0 ? null : (t.better === 'higher' ? diff > 0 : diff < 0);
    const rating = rateTest(k, last.value);
    const digits = t.step < 1 ? (t.step < 0.1 ? 2 : 1) : 0;
    const spark = rows.slice(-8);
    const minV = Math.min(...spark.map(r => r.value)), maxV = Math.max(...spark.map(r => r.value));
    const pts = spark.map((r, i) => `${(spark.length === 1 ? 50 : i / (spark.length - 1) * 100).toFixed(1)},${(maxV === minV ? 12 : 22 - (r.value - minV) / (maxV - minV) * 20).toFixed(1)}`).join(' ');
    const col = chartColors();
    return `
      <div class="sub-card p-3 space-y-1.5">
        <div class="flex justify-between gap-2"><span class="text-[13px] font-extrabold text-slate-900">${t.name}</span><span class="text-[12px] text-slate-600">${rows.length}×</span></div>
        <div class="flex items-end justify-between gap-2">
          <div class="text-lg font-extrabold text-slate-900 tabular-nums">${fmt(last.value, digits)} <span class="text-[13px] font-semibold text-slate-600">${t.unit}</span></div>
          ${diff !== null ? `<span class="text-[13px] font-bold ${better === null ? 'text-slate-600' : better ? 'text-emerald-700' : 'text-rose-700'}">${diff > 0 ? '+' : ''}${fmt(diff, digits)} ${better === null ? '' : better ? '▲ lepší' : '▼ horší'}</span>` : ''}
        </div>
        ${spark.length > 1 ? `<svg viewBox="0 0 100 24" preserveAspectRatio="none" class="w-full h-6" aria-hidden="true"><polyline fill="none" stroke="${col.ink}" stroke-width="1.5" vector-effect="non-scaling-stroke" points="${pts}"/></svg>` : ''}
        ${rating ? `<span class="inline-block px-2 py-0.5 rounded-full text-[12px] font-bold ${rating.cls}">${rating.text}</span>` : `<span class="text-[12px] text-slate-600">Bez obecné normy, sledujte vlastní pokrok.</span>`}
        <div class="flex justify-between items-center text-[12px] text-slate-600"><span>Poslední: ${escapeHtml(czDate(last.date))}</span>
          <button type="button" class="text-rose-700 font-semibold hover:underline" onclick="deletePerf('${k}', '${escapeHtml(last.date)}', ${+last.value})">Smazat poslední</button></div>
      </div>`;
  }).join('');
}
