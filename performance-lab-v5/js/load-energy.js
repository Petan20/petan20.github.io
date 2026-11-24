// Performance Lab · Zátěž z deníku (ACWR, graf), dostupnost energie, záloha dat, zdroje
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

// ============================================================================
// ZÁTĚŽ Z DENÍKU: ACWR A TREND
// ============================================================================
function entryTime(e) { return Number.isFinite(e.ts) ? e.ts : e.id; }

function diaryLoads() {
  const entries = getDiaryEntries();
  const now = Date.now();
  const day = 86400000;
  const acute = entries.filter(e => now - entryTime(e) < 7 * day && entryTime(e) <= now).reduce((s, e) => s + (+e.time || 0) * (+e.rpe || 0), 0);
  const chronic28 = entries.filter(e => now - entryTime(e) < 28 * day && entryTime(e) <= now).reduce((s, e) => s + (+e.time || 0) * (+e.rpe || 0), 0);
  const oldest = entries.length ? Math.min(...entries.map(entryTime)) : now;
  return { acute, chronicWeekly: chronic28 / 4, spanDays: Math.floor((now - oldest) / day), count: entries.length };
}

function renderTrend() {
  const host = document.getElementById('trend-chart');
  if (!host) return;
  const entries = getDiaryEntries();
  const day = 86400000;
  const end = new Date(); end.setHours(23, 59, 59, 999);
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const start = new Date(end.getTime() - (i + 1) * day + 1);
    const stop = new Date(end.getTime() - i * day);
    const es = entries.filter(e => entryTime(e) >= start.getTime() && entryTime(e) <= stop.getTime());
    days.push({
      date: stop,
      load: es.reduce((s, e) => s + (+e.time || 0) * (+e.rpe || 0), 0),
      sleep: es.length ? es.reduce((s, e) => s + (+e.sleep || 0), 0) / es.length : null
    });
  }
  const col = chartColors();
  const W = Math.round(Math.max(300, Math.min(1100, host.clientWidth || 700)));
  const H = 200, padL = 44, padR = 36, padT = 12, padB = 26;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const maxLoad = Math.max(600, ...days.map(d => d.load));
  const bw = plotW / days.length;
  const yL = v => padT + plotH - (v / maxLoad) * plotH;
  const yS = v => padT + plotH - ((Math.min(12, Math.max(0, v)) - 0) / 12) * plotH;
  const bars = days.map((d, i) => d.load > 0 ? `<rect x="${(padL + i * bw + bw * 0.15).toFixed(1)}" y="${yL(d.load).toFixed(1)}" width="${(bw * 0.7).toFixed(1)}" height="${(padT + plotH - yL(d.load)).toFixed(1)}" rx="2" fill="${pillarColor('explosive')}" opacity="0.85"><title>${d.date.toLocaleDateString('cs-CZ')}: ${d.load} AU</title></rect>` : '').join('');
  const sleepPts = days.map((d, i) => d.sleep !== null ? `${(padL + i * bw + bw / 2).toFixed(1)},${yS(d.sleep).toFixed(1)}` : null).filter(Boolean);
  const ticks = [0, Math.round(maxLoad / 2), Math.round(maxLoad)].map(v => `<text x="${padL - 6}" y="${yL(v) + 4}" text-anchor="end" font-size="11" fill="${col.text}">${v}</text><line x1="${padL}" x2="${W - padR}" y1="${yL(v)}" y2="${yL(v)}" stroke="${col.grid}" />`).join('');
  const sTicks = [0, 6, 12].map(v => `<text x="${W - padR + 6}" y="${yS(v) + 4}" font-size="11" fill="${col.text}">${v} h</text>`).join('');
  const xl = [0, 7, 14, 21, 27].map(i => `<text x="${(padL + i * bw + bw / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="${col.text}">${days[i].date.getDate()}. ${days[i].date.getMonth() + 1}.</text>`).join('');
  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="w-full h-auto block" role="img" aria-label="Denní zátěž a spánek za 28 dní">
      ${ticks}${sTicks}${bars}
      ${sleepPts.length > 1 ? `<polyline fill="none" stroke="${pillarColor('coord')}" stroke-width="2.2" points="${sleepPts.join(' ')}" />` : ''}
      ${sleepPts.map(p => { const [x, y] = p.split(','); return `<circle cx="${x}" cy="${y}" r="3" fill="${pillarColor('coord')}" />`; }).join('')}
      ${xl}
    </svg>
    ${entries.length ? '' : `<p class="text-[13px] text-slate-600 mt-2">Graf se naplní, jakmile uložíte tréninky do deníku (i zpětně s datem).</p>`}
  `;
  const L = diaryLoads();
  const acwr = L.chronicWeekly > 0 ? L.acute / L.chronicWeekly : null;
  document.getElementById('trend-stats').innerHTML = `
    <span class="px-2 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold">7 dní: ${fmt(L.acute)} AU</span>
    <span class="px-2 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold">Průměr týdne (28 dní): ${fmt(Math.round(L.chronicWeekly))} AU</span>
    ${acwr !== null ? `<span class="px-2 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold">ACWR ${fmt(acwr, 2)}</span>` : ''}`;
}

// ============================================================================
// DOSTUPNOST ENERGIE (RED-S)
// ============================================================================
function calcEA() {
  if (!STATE.nut) return;
  const w = STATE.nut.w;
  const h = num('n-height', 175);
  const age = num('n-age', 30);
  const intakeIn = num('ea-intake', NaN);
  const intake = Number.isNaN(intakeIn) ? STATE.nut.kcal : intakeIn;
  const fatIn = num('ea-fat', NaN);
  const bmi = w / Math.pow(h / 100, 2);
  const fatEst = 1.2 * bmi + 0.23 * age - 10.8 * (STATE.sex === 'male' ? 1 : 0) - 5.4;
  const fat = Number.isNaN(fatIn) ? Math.min(50, Math.max(5, fatEst)) : fatIn;
  const ffm = w * (1 - fat / 100);
  const minutes = num('ea-min', 60);
  const met = num('ea-int', 8);
  const eee = Math.max(0, (met - 1) * w * (minutes / 60));
  const ea = (intake - eee) / ffm;
  const cls = ea < 30 ? ['Nízká', 'bg-rose-100 text-rose-800', 'Riziko RED-S: zvyšte příjem energie nebo snižte objem tréninku a poraďte se se sportovním lékařem.']
    : ea < 45 ? ['Snížená', 'bg-amber-100 text-amber-800', 'Krátkodobě při hubnutí přijatelné, dlouhodobě hrozí únava a horší regenerace.']
    : ['Dostatečná', 'bg-emerald-100 text-emerald-800', 'Energie stačí na trénink i základní funkce těla.'];
  document.getElementById('ea-out').innerHTML = `
    <div class="sub-card p-3"><div class="text-[13px] font-semibold text-slate-600">Dostupnost energie</div>
      <div class="text-xl font-extrabold text-slate-900">${fmt(ea, 0)} <span class="text-[13px] font-semibold text-slate-600">kcal/kg FFM</span></div>
      <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-[12px] font-bold ${cls[1]}">${cls[0]}</span></div>
    <div class="sub-card p-3 text-[13px] text-slate-700"><div class="font-semibold text-slate-600">Výpočet</div>
      Příjem ${fmt(intake)} kcal − trénink ${fmt(Math.round(eee))} kcal, tukuprostá hmota ${fmt(ffm, 1)} kg (tuk ${fmt(fat, 1)} %${Number.isNaN(fatIn) ? ', odhad' : ''}).</div>
    <div class="sub-card p-3 text-[13px] text-slate-800">${cls[2]}${Number.isNaN(intakeIn) ? ' <span class="text-slate-600">Počítáno s vypočtenou potřebou z kalkulačky. Pokud vychází nízko, koeficient aktivity je nejspíš nízký vzhledem k tréninku; zadejte svůj skutečný příjem.</span>' : ''}</div>
  `;
}

// ============================================================================
// ZÁLOHA DAT
// ============================================================================
function exportData() {
  const data = { app: 'Performance Lab', version: 4, exported: new Date().toISOString(), diary: getDiaryEntries(), tests: getPerf(), sport: STATE.sport };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `performance-lab-zaloha-${todayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  document.getElementById('backup-status').textContent = 'Záloha se stahuje do vašeho počítače.';
}

function importData(input) {
  const file = input.files && input.files[0];
  const status = document.getElementById('backup-status');
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || data.app !== 'Performance Lab' || !Array.isArray(data.diary)) throw new Error('format');
      const diary = data.diary.filter(x => x && Number.isFinite(x.id)).slice(0, DIARY_MAX);
      const tests = Array.isArray(data.tests) ? data.tests.filter(r => r && PERF_TESTS[r.test] && Number.isFinite(+r.value) && typeof r.date === 'string') : [];
      safeSet('plab_v3_diary', JSON.stringify(diary));
      safeSet(PERF_KEY, JSON.stringify(tests));
      if (data.sport && SPORT_DB[data.sport]) setSport(data.sport);
      renderDiaryHistory(); renderPerfResults(); calcFatigue(); renderTrend();
      status.textContent = `Obnoveno: ${diary.length} tréninků a ${tests.length} výsledků testů.`;
    } catch (e) {
      status.textContent = 'Soubor se nepodařilo načíst. Vyberte zálohu vytvořenou touto aplikací (.json).';
    }
    input.value = '';
  };
  reader.readAsText(file);
}

function renderReferences() {
  document.getElementById('ref-list').innerHTML = REFERENCES.map(r => `<li>${escapeHtml(r)}</li>`).join('');
}
