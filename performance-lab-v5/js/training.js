// Performance Lab · Cviky, klinické testy, únava (sRPE, ACWR, Hooper), superkompenzace
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

// Data cviků jsou kvůli úspornosti zapsaná jako pole. Tady je převedeme na objekty
// s pojmenovanými vlastnostmi, aby se s nimi ve zbytku kódu dobře pracovalo.
const EX_FIELDS = ['name', 'pattern', 'patternLabel', 'muscles', 'dose', 'transfer', 'note'];
const EXERCISES = Object.fromEntries(Object.entries(EXERCISES_100).map(([pillar, rows]) => [
  pillar,
  rows.map((row, i) => {
    const ex = { pillar, num: i + 1 };
    EX_FIELDS.forEach((field, j) => { ex[field] = row[j]; });
    return ex;
  })
]));
const ALL_EXERCISES = Object.values(EXERCISES).flat();

function fmtKg(v) { return fmt(v, v % 1 ? 1 : 0); }

function selectExPillar(k) {
  STATE.exPillar = k;
  renderExercises();
}

function renderExercises() {
  const names = {
    strength: '1. Silový (20)',
    endurance: '2. Vytrvalostní (20)',
    explosive: '3. Výbušný (20)',
    agility: '4. Agility & Rychlost (20)',
    coord: '5. Koordinace & Mobilita (20)'
  };
  const section = document.getElementById('sec-exercises');
  section.style.setProperty('--acc', pillarColor(STATE.exPillar));
  document.getElementById('ex-pillar-tabs').innerHTML = Object.entries(names).map(([k, label]) => {
    const on = STATE.exPillar === k;
    return `
    <button type="button" onclick="selectExPillar('${k}')" aria-pressed="${on}" class="px-3 py-1.5 rounded-full text-[13px] font-semibold border transition-all inline-flex items-center gap-1.5 ${on ? 'pill-on' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}" style="${on ? `background:${pillarColor(k)}` : ''}">
      ${on ? '' : `<span class="pillar-dot" style="background:${pillarColor(k)}"></span>`}${label}
    </button>`;
  }).join('');

  const info = CONDITION_INFO[STATE.condition] || CONDITION_INFO.standard;
  const hide = document.getElementById('ex-hide').checked;
  const patFilter = document.getElementById('ex-pattern-filter').value;
  const q = document.getElementById('ex-search').value.trim().toLowerCase();
  const rxAll = EXERCISES[STATE.exPillar].map(ex => ({ ex, rx: prescribeExercise(ex) }));
  const list = rxAll.filter(({ ex, rx }) => {
    const matchPat = patFilter === 'all' || ex.pattern === patFilter;
    const haystack = [ex.name, ex.patternLabel, ex.muscles, ex.transfer, ex.note].join(' ').toLowerCase();
    const hidden = hide && rx.status === 'no';
    return matchPat && !hidden && (!q || haystack.includes(q));
  });
  const counts = rxAll.reduce((acc, { rx }) => { acc[rx.status || 'ok']++; return acc; }, { ok: 0, mod: 0, no: 0 });

  document.getElementById('ex-count-badge').textContent = `${list.length} / 20 v pilíři`;
  document.getElementById('ex-status-sum').innerHTML =
    `<span class="chip status-ok">Vhodné ${counts.ok}</span><span class="chip status-mod">S úpravou ${counts.mod}</span><span class="chip status-no">Nevhodné ${counts.no}</span>`;
  renderRxStrip();
  const col = pillarColor(STATE.exPillar);
  const statusChip = s => s === 'no' ? '<span class="chip status-no">Nevhodné pro vás</span>'
    : s === 'mod' ? '<span class="chip status-mod">S úpravou</span>' : '<span class="chip status-ok">Vhodné</span>';
  document.getElementById('ex-grid').innerHTML = list.length ? list.map(({ ex, rx }) => {
    const tips = PATTERN_TIPS[ex.pattern];
    const aud = exerciseAudience(ex);
    const safeId = 'rm-' + ex.pillar + '-' + ex.num;
    const reasonTxt = rx.reasons.length ? rx.reasons.filter((v, i, a) => a.indexOf(v) === i).join(', ') : '';
    return `
    <div class="sub-card p-3.5 flex flex-col gap-2.5" style="border-left:3px solid ${rx.status === 'no' ? 'var(--st-no)' : rx.status === 'mod' ? 'var(--st-mod)' : col}">
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-[13px] sm:text-sm font-extrabold text-slate-900">${ex.name}</h3>
        <span class="text-[12px] font-bold px-2 py-0.5 rounded-md shrink-0" style="background:${col}22;color:${col}">${ex.patternLabel}</span>
      </div>
      <div class="flex flex-wrap items-center gap-1.5">${statusChip(rx.status)}${reasonTxt ? `<span class="text-[12px] text-slate-600">${escapeHtml(reasonTxt)}</span>` : ''}</div>
      ${rx.status === 'no' ? `<p class="text-[13px] rounded-lg px-2.5 py-1.5 status-no">${escapeHtml(info.rules.why || 'Pro váš profil raději vynechte a vyberte jiný cvik se stejným pohybovým vzorcem.')}</p>` : ''}
      <div class="rx-box ${rx.status === 'no' ? 'rx-muted' : ''}">
        <div class="text-[12px] font-bold uppercase tracking-wider text-slate-600">Váš předpis</div>
        <dl class="rx-dl">
          ${rx.lines.map(([k, v]) => `<dt>${k}</dt><dd>${escapeHtml(v)}</dd>`).join('')}
          ${rx.kg ? `<dt>Váha</dt><dd>${rx.belowBar
            ? `<strong>méně než prázdná osa (20 kg)</strong> <span class="text-slate-600">: začněte s jednoručkami, kettlebellem nebo vlastní vahou</span>`
            : `<strong class="tabular-nums">${rx.kg[0] === rx.kg[1] ? fmtKg(rx.kg[0]) : fmtKg(rx.kg[0]) + '–' + fmtKg(rx.kg[1])} kg</strong>`} <span class="text-slate-600">${rx.oneRM.own ? '(z vašeho 1RM ' + fmt(rx.oneRM.value) + ' kg)' : '(odhad, ověřte 1–2 zkušebními sériemi)'}</span></dd>` : ''}
        </dl>
      </div>
      <div class="text-[13px] text-slate-600"><strong>Svaly:</strong> ${ex.muscles}</div>
      <details class="text-[13px] text-slate-700">
        <summary class="cursor-pointer font-semibold">Proč takto, pro koho a jak upravit</summary>
        <div class="mt-1.5 space-y-1.5">
          <div><strong>Výchozí dávka pro trénovaného sportovce:</strong> ${ex.dose}</div>
          <ul class="list-disc pl-5">${rx.why.map(w => `<li>${escapeHtml(w)}</li>`).join('')}</ul>
          <div><strong>Pro koho:</strong> ${aud.no.length ? `<span class="text-rose-700">nevhodné při: ${aud.no.join(', ')}</span>. ` : ''}${aud.mod.length ? `S úpravou při: ${aud.mod.join(', ')}. ` : ''}${!aud.no.length && !aud.mod.length ? 'vhodné pro všechny skupiny.' : 'Ostatní skupiny bez omezení.'}</div>
          ${tips ? `<div><strong>Lehčí:</strong> ${tips[0]}<br><strong>Těžší:</strong> ${tips[1]}</div>` : ''}
          <div><strong>Přesah:</strong> ${ex.transfer}</div>
          <div class="text-slate-600"><em>${ex.note}</em></div>
          ${rx.isLoad ? `<div class="flex flex-wrap items-center gap-2 pt-1"><label for="${safeId}" class="font-semibold">Moje 1RM (kg):</label><input id="${safeId}" type="number" min="0" max="500" step="2.5" value="${getUser1RM()[ex.name] || ''}" placeholder="např. 100" class="w-28 border border-slate-300 rounded-xl px-3 py-1 text-[13px] font-semibold" onchange="setUser1RM(${escapeHtml(JSON.stringify(ex.name))}, this.value)" /><span class="text-slate-600">1RM spočítáte v Nástrojích.</span></div>` : ''}
        </div>
      </details>
    </div>`;
  }).join('') : `<div class="col-span-full text-center text-[13px] text-slate-600 py-8">Pro zvolený filtr nebyl v tomto pilíři nalezen žádný cvik. Zkuste přepnout pilíř nebo změnit filtr vzorce.</div>`;
}

// --- RENDER CLINICAL & FUNCTIONAL TESTS ---
function renderTests() {
  const reg = document.getElementById('test-region').value;
  const filtered = CLINICAL_TESTS.filter(t => reg === 'all' || t.region === reg);
  document.getElementById('tests-grid').innerHTML = filtered.map(t => `
    <div class="sub-card p-4 space-y-2">
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-[13px] sm:text-sm font-extrabold text-slate-900">${t.name}</h3>
        <span class="text-[12px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 shrink-0">
          ${t.region === 'spine' ? 'Páteř & Hrudník' : t.region === 'upper' ? 'Rameno' : 'Dolní končetina'}
        </span>
      </div>
      <div class="text-[13px] text-blue-700 font-semibold">Cíl vyšetření: ${t.target}</div>
      <p class="text-[13px] text-slate-700"><strong>Jak provést:</strong> ${t.how}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[13px]">
        <div class="bg-emerald-50/80 border border-emerald-200 rounded-lg p-2 text-emerald-900">
          <strong>✓ Norma:</strong> ${t.norm}
        </div>
        <div class="bg-amber-50/80 border border-amber-200 rounded-lg p-2 text-amber-900">
          <strong>! Deficit:</strong> ${t.deficit}
        </div>
      </div>
      <div class="text-[13px] text-slate-600 pt-1">
        <strong>Doporučená náprava z databáze:</strong> ${t.fix}
      </div>
    </div>
  `).join('');
}

function calcFatigue() {
  const min = num('f-min', 0);
  const rpe = num('f-rpe', 0);
  const auto = document.getElementById('f-auto');
  const note = document.getElementById('f-auto-note');
  const L = diaryLoads();
  const useDiary = auto.checked && L.count > 0;
  document.getElementById('f-acute').disabled = useDiary;
  document.getElementById('f-chronic').disabled = useDiary;
  if (useDiary) {
    document.getElementById('f-acute').value = Math.round(L.acute);
    document.getElementById('f-chronic').value = Math.max(100, Math.round(L.chronicWeekly));
    note.textContent = L.spanDays < 21
      ? `Deník pokrývá jen ${L.spanDays + 1} dní. Spolehlivé ACWR potřebuje aspoň 3–4 týdny záznamů.`
      : 'Hodnoty jsou spočítané z deníku (součet sRPE za 7 dní a týdenní průměr za 28 dní).';
  } else {
    note.textContent = auto.checked ? 'V deníku zatím nejsou záznamy, zadejte hodnoty ručně.' : 'Zadáváte hodnoty ručně.';
  }
  const acute = num('f-acute', 0);
  const chronic = Math.max(1, num('f-chronic', 1));
  const srpe = Math.round(min * rpe);
  const acwr = +(acute / chronic).toFixed(2);
  document.getElementById('out-srpe').textContent = srpe + ' AU';
  document.getElementById('out-acwr').textContent = fmt(acwr, 2);
  const b = document.getElementById('badge-acwr');
  if (acwr < 0.8) {
    b.className = 'inline-block mt-1 px-2 py-0.5 rounded-full text-[12px] font-bold bg-amber-100 text-amber-800';
    b.textContent = 'Podtrénování (< 0,8)';
  } else if (acwr <= 1.3) {
    b.className = 'inline-block mt-1 px-2 py-0.5 rounded-full text-[12px] font-bold bg-emerald-100 text-emerald-800';
    b.textContent = 'Optimální zóna (0,8–1,3)';
  } else if (acwr <= 1.5) {
    b.className = 'inline-block mt-1 px-2 py-0.5 rounded-full text-[12px] font-bold bg-amber-100 text-amber-800';
    b.textContent = 'Zvýšené riziko (1,3–1,5)';
  } else {
    b.className = 'inline-block mt-1 px-2 py-0.5 rounded-full text-[12px] font-bold bg-rose-100 text-rose-800';
    b.textContent = 'Vysoké riziko přetížení (> 1,5)';
  }
}

function calcHooper() {
  const sum = ['h-sleep', 'h-fatigue', 'h-doms', 'h-stress']
    .reduce((acc, id) => acc + num(id, 1), 0);
  document.getElementById('out-hooper').textContent = sum + ' / 28';
  const b = document.getElementById('badge-hooper');
  if (sum <= 12) {
    b.className = 'px-2.5 py-1 rounded-full text-[13px] font-bold bg-emerald-100 text-emerald-800';
    b.textContent = 'Plná připravenost';
  } else if (sum <= 18) {
    b.className = 'px-2.5 py-1 rounded-full text-[13px] font-bold bg-amber-100 text-amber-800';
    b.textContent = 'Mírná únava (-15 % objem)';
  } else {
    b.className = 'px-2.5 py-1 rounded-full text-[13px] font-bold bg-rose-100 text-rose-800';
    b.textContent = 'Vysoká únava (volno)';
  }
}

function renderSupercomp() {
  const pil = document.getElementById('sc-pillar').value;
  const idx = +document.getElementById('sc-load').value;
  const mult = PROFILES[STATE.condition][STATE.sex].recMult;
  const win = recoveryWindow(pil, idx, mult);
  document.getElementById('sc-output').innerHTML = `
    <div class="sub-card p-4">
      <div class="text-[13px] font-semibold text-slate-600">Doporučený odpočinek (upraveno dle profilu)</div>
      <div class="text-xl font-extrabold text-slate-900 mt-0.5">${win.rest} hodin</div>
      <div class="text-[13px] text-slate-600 mt-0.5">Koeficient regenerace profilu: ×${fmt(mult, 2)}</div>
    </div>
    <div class="sub-card p-4">
      <div class="text-[13px] font-semibold text-slate-600">Fáze superkompenzace</div>
      <div class="text-xl font-extrabold text-blue-700 mt-0.5">${win.from}–${win.to} hod</div>
      <div class="text-[13px] text-slate-600 mt-0.5">Ideální okno pro další rozvojový podnět (stejný model jako v deníku)</div>
    </div>
    <div class="sub-card p-4">
      <div class="text-[13px] font-semibold text-slate-600">Přesah (transfer) na ostatní systémy</div>
      <p class="text-[13px] text-slate-700 mt-1 leading-relaxed">${SC_DATA[pil].trans}</p>
    </div>
  `;
}
