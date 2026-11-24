// Performance Lab · Výpočty výživy, jídelníček, jídlo kolem tréninku
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

// ============================================================================
// VÝŽIVA – VÝPOČTY A VYKRESLENÍ
// ============================================================================

function initNutritionStatic() {
  document.getElementById('n-sport').innerHTML = Object.entries(PROTEIN_GROUPS).map(([k, g]) =>
    `<option value="${k}"${k === 'strengthNovice' ? ' selected' : ''}>${g.label} (${g.range[0] === g.range[1] ? fmt(g.range[0], 1) : fmt(g.range[0], 1) + '–' + fmt(g.range[1], 1)} g/kg)</option>`
  ).join('');
  document.getElementById('n-ratio').innerHTML = Object.entries(MACRO_RATIOS).map(([k, r]) =>
    `<option value="${k}"${k === 'sportBase' ? ' selected' : ''}>${r.label}</option>`
  ).join('');

  const giCls = gi => gi < 55 ? 'bg-emerald-100 text-emerald-800' : gi < 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800';
  document.querySelector('#gi-table tbody').innerHTML = GI_FOODS.map(([name, carbs, gi, gn]) => `
    <tr>
      <td class="py-1.5 pr-2 text-slate-800">${name}</td>
      <td class="py-1.5 px-2 text-right text-slate-700">${fmt(carbs, 1)}</td>
      <td class="py-1.5 px-2 text-right"><span class="px-1.5 py-0.5 rounded-md font-semibold ${giCls(gi)}">${gi}</span></td>
      <td class="py-1.5 pl-2 text-right font-semibold ${gn < 10 ? 'text-emerald-700' : gn < 20 ? 'text-amber-700' : 'text-rose-700'}">${fmt(gn, 1)}</td>
    </tr>
  `).join('');

  document.querySelector('#caffeine-table tbody').innerHTML = CAFFEINE.map(([drink, mg]) => `
    <tr><td class="py-1.5 pr-2 text-slate-800">${drink}</td><td class="py-1.5 pl-2 text-right font-semibold text-slate-900">${mg}</td></tr>
  `).join('');

  document.getElementById('drink-types').innerHTML = DRINK_TYPES.map(([name, conc, use]) => `
    <div class="sub-card p-3">
      <div class="text-[13px] font-extrabold text-slate-900">${name}</div>
      <div class="text-[13px] font-semibold text-blue-700">${conc}</div>
      <div class="text-[13px] text-slate-600 mt-1">${use}</div>
    </div>
  `).join('');

  document.getElementById('supp-list').innerHTML = SUPPLEMENTS.map(([grp, title, examples, cls, dot]) => `
    <div class="border rounded-xl p-3 flex gap-3 ${cls}">
      <span class="w-7 h-7 rounded-lg ${dot} text-white flex items-center justify-center text-[13px] font-extrabold shrink-0" aria-hidden="true">${grp}</span>
      <div class="min-w-0">
        <div class="text-[13px] font-bold">Skupina ${grp}: ${title}</div>
        <div class="text-[13px] opacity-90">${examples}</div>
      </div>
    </div>
  `).join('');
}

function calcNutrition() {
  const w = num('n-weight', 70);
  const h = num('n-height', 175);
  const a = num('n-age', 30);
  const act = num('n-act', 1.55);
  const goal = num('n-goal', 1);
  const diet = document.getElementById('n-diet').value;
  const ratioKey = document.getElementById('n-ratio').value || 'sportBase';
  const sportKey = document.getElementById('n-sport').value || 'strengthNovice';
  const eq = document.getElementById('n-eq').value;
  const prof = PROFILES[STATE.condition][STATE.sex];
  const isFemale = STATE.sex === 'female';

  // Zvláštní období jen u žen
  document.getElementById('n-period-wrap').hidden = !isFemale;
  const period = isFemale ? document.getElementById('n-period').value : 'none';

  // Bazální metabolismus
  const mifflin = isFemale ? (10 * w + 6.25 * h - 5 * a - 161) : (10 * w + 6.25 * h - 5 * a + 5);
  const harris = isFemale ? (9.563 * w + 1.85 * h - 4.676 * a + 655.1) : (13.75 * w + 5.003 * h - 6.775 * a + 66.5);
  const bmr = eq === 'harris' ? harris : mifflin;

  // Energie navíc v těhotenství a při kojení (kJ → kcal)
  const extraKcal = period === 'preg23' ? Math.round(725 / 4.184) : period === 'lact' ? Math.round(1500 / 4.184) : 0;
  const kcal = Math.round(bmr * act * goal + extraKcal);

  // Bílkoviny: střed doporučeného rozpětí × profil, s kontrolou spodních a horních hranic
  // (ACSM/AND/DC 2016, ISSN 2017, ESPEN 2014, KDIGO 2024)
  const range = PROTEIN_GROUPS[sportKey].range;
  const hM = h / 100;
  const bmiNow = w / (hM * hM);
  const refW = bmiNow > 30 ? 25 * hM * hM : w; // při obezitě počítáme z hmotnosti odpovídající BMI 25
  const protNotes = [];
  let protPerKg = ((range[0] + range[1]) / 2) * prof.protMult;
  if (prof.protMult > 1) protNotes.push(`profil ×${fmt(prof.protMult, 2)}`);
  if (goal < 1) {
    const floor = sportKey === 'sedentary' ? 1.0 : 1.2;
    protPerKg = Math.max(protPerKg * 1.1, floor);
    protNotes.push(`hubnutí: +10 %, nejméně ${fmt(floor, 1)} g/kg na ochranu svalů`);
  }
  if (a >= 65) {
    const floor = sportKey === 'sedentary' ? 1.0 : 1.2;
    if (protPerKg < floor) { protPerKg = floor; protNotes.push(`věk 65+: nejméně ${fmt(floor, 1)} g/kg (ESPEN)`); }
  }
  if (prof.protFloor && protPerKg < prof.protFloor) { protPerKg = prof.protFloor; protNotes.push(`zdravotní skupina: nejméně ${fmt(prof.protFloor, 1)} g/kg (ESPEN)`); }
  if ((period === 'preg1' || period === 'preg23') && protPerKg < 1.3) { protPerKg = 1.3; protNotes.push('těhotenství: nejméně 1,3 g/kg'); }
  if (protPerKg > 2.2) { protPerKg = 2.2; protNotes.push('strop 2,2 g/kg (vyšší příjem nepřináší další přínos)'); }
  if (prof.protCap && protPerKg > prof.protCap) { protPerKg = prof.protCap; protNotes.push(`onemocnění ledvin: nejvýše ${fmt(prof.protCap, 1)} g/kg (KDIGO 2024)`); }
  let p = Math.round(refW * protPerKg);
  if (refW !== w) protNotes.push(`obezita: počítáno z hmotnosti ${fmt(Math.round(refW))} kg (BMI 25), ne z ${fmt(w)} kg`);
  if (period === 'lact') { p += 20; protNotes.push('kojení: +20 g'); }
  protPerKg = p / w;
  const protPerRef = p / refW;

  const ratio = MACRO_RATIOS[ratioKey];
  const f = Math.round((kcal * ratio.fat) / 9);
  const c = Math.max(60, Math.round((kcal - p * 4 - f * 9) / 4));

  const pctP = (p * 4 / kcal) * 100, pctF = (f * 9 / kcal) * 100, pctC = (c * 4 / kcal) * 100;

  STATE.nut = { kcal, p, f, c, w, protPerKg, diet, isFemale, age: a, pctP, pctF, pctC };
  const pc = document.getElementById('out-protcheck');
  if (pc) {
    const band = protPerRef < 1.0 ? 'běžné doporučení pro netrénující dospělé (0,8–1,0 g/kg)'
      : protPerRef < 1.2 ? 'mírně nad základní doporučení (1,0–1,2 g/kg), vhodné pro rekreačně aktivní a starší lidi'
      : protPerRef < 1.65 ? 'pásmo pro pravidelně sportující (1,2–1,6 g/kg)'
      : 'horní pásmo 1,6–2,2 g/kg, opodstatněné při budování svalů, hubnutí se zachováním svalů a ve vyšším věku';
    pc.innerHTML = `<strong>Kontrola bílkovin:</strong> ${fmt(protPerRef, 2)} g/kg${refW !== w ? ' (na hmotnost odpovídající BMI 25)' : ''} je ${band}. ${protNotes.length ? 'Úpravy: ' + protNotes.join('; ') + '.' : ''}`;
  }

  document.getElementById('out-kcal').textContent = fmt(kcal) + ' kcal';
  document.getElementById('out-kj').textContent = fmt(Math.round(kcal * 4.184 / 10) * 10) + ' kJ';
  document.getElementById('out-macros').textContent = `${p} g B · ${c} g S · ${f} g T`;
  document.getElementById('out-gkg').textContent = `Bílkoviny ${fmt(protPerKg, 2)} g/kg · sacharidy ${fmt(c / w, 1)} g/kg`;
  document.getElementById('out-gkg').title = 'Gramy na kilogram skutečné hmotnosti';
  document.getElementById('out-nut-explain').textContent =
    (goal < 1 ? 'Šetrný energetický deficit se zvýšenou ochranou svalové hmoty.'
      : goal > 1 ? 'Mírný nadbytek energie pro růst síly a regeneraci.'
      : 'Udržovací příjem pro stabilní výkon a energii během dne.')
    + (period === 'preg23' ? ' Zahrnuje +650–800 kJ pro 2. a 3. trimestr.' : period === 'lact' ? ' Zahrnuje +1 500 kJ pro kojení.' : '');

  // Pruh poměru energie
  const parts = [['Sacharidy', pctC, 'bg-emerald-500', ratio.s], ['Tuky', pctF, 'bg-amber-500', ratio.t], ['Bílkoviny', pctP, 'bg-blue-600', ratio.b]];
  document.getElementById('macro-bar').innerHTML = parts.map(([, pct, cls]) => `<div class="${cls}" style="width:${Math.max(0, pct).toFixed(1)}%"></div>`).join('');
  document.getElementById('macro-legend').innerHTML = parts.map(([name, pct, cls, rec]) =>
    `<span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm ${cls}" aria-hidden="true"></span>${name} <strong>${fmt(pct)} %</strong> <span class="text-slate-600">(doporučeno ${rec[0]}–${rec[1]} %)</span></span>`
  ).join('');
  const outOf = parts.filter(([, pct, , rec]) => pct < rec[0] - 2 || pct > rec[1] + 2).map(([name]) => name.toLowerCase());
  document.getElementById('macro-check').textContent = outOf.length
    ? `Podíl ${outOf.join(' a ')} je mimo zvolený trojpoměr. Bílkoviny totiž počítáme v gramech na kilogram podle zátěže, ne procentem z energie. Při hubnutí klesne energie, ale potřeba bílkovin ne, proto jejich procento vzroste. To je v pořádku, pokud kontrola níže hlásí pásmo do 2,2 g/kg.`
    : 'Poměr živin odpovídá zvolenému typu stravy.';

  document.getElementById('out-bmr').innerHTML =
    `Bazální metabolismus: <strong>${fmt(Math.round(bmr))} kcal</strong> (${eq === 'harris' ? 'Harris-Benedict' : 'Mifflin-St Jeor'}; druhá rovnice dává ${fmt(Math.round(eq === 'harris' ? mifflin : harris))} kcal). ` +
    `Celkový výdej = BMR × koeficient aktivity ${fmt(act, 2)}. Koeficient zahrnuje i termický efekt stravy (5–10 % výdeje).`;

  renderBody(w, h);

  document.getElementById('micro-list').innerHTML = prof.micros.map(([name, dose, why]) => `
    <div class="py-2 text-[13px]">
      <div class="flex flex-wrap justify-between gap-x-3 font-bold text-slate-900">
        <span>${name}</span>
        <span class="text-emerald-700">${dose}</span>
      </div>
      <div class="text-[13px] text-slate-600">${why}</div>
    </div>
  `).join('');

  renderProfileTips();
  renderTargets();
  renderMealSplit();
  renderMeals();
  renderTiming();
  calcEA();
  if (STATE.plan) renderPlan();
}

function renderBody(w, h) {
  const bmi = w / Math.pow(h / 100, 2);
  const [, bmiLabel, bmiCls] = BMI_CLASSES.find(([lim]) => bmi < lim);
  const waist = num('n-waist', NaN);
  const hip = num('n-hip', NaN);
  const female = STATE.sex === 'female';
  const cards = [`
    <div class="sub-card p-3">
      <div class="text-[13px] font-semibold text-slate-600">BMI</div>
      <div class="text-lg font-extrabold text-slate-900">${fmt(bmi, 1)}</div>
      <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[12px] font-bold ${bmiCls}">${bmiLabel}</span>
    </div>`];
  if (!Number.isNaN(waist)) {
    const lim = female ? 85 : 94;
    const risk = waist > lim;
    cards.push(`
    <div class="sub-card p-3">
      <div class="text-[13px] font-semibold text-slate-600">Obvod pasu</div>
      <div class="text-lg font-extrabold text-slate-900">${fmt(waist)} cm</div>
      <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[12px] font-bold ${risk ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">${risk ? `Nad ${lim} cm: riziko břišní obezity` : `Do ${lim} cm: v pořádku`}</span>
    </div>`);
  }
  if (!Number.isNaN(waist) && !Number.isNaN(hip) && hip > 0) {
    const whr = waist / hip;
    const lim = female ? 0.8 : 0.9;
    const risk = whr > lim;
    cards.push(`
    <div class="sub-card p-3">
      <div class="text-[13px] font-semibold text-slate-600">WHR (pas / boky)</div>
      <div class="text-lg font-extrabold text-slate-900">${fmt(whr, 2)}</div>
      <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[12px] font-bold ${risk ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">${risk ? `Nad ${fmt(lim, 1)}: zvýšené zdravotní riziko` : `Do ${fmt(lim, 1)}: nízké riziko`}</span>
    </div>`);
  }
  if (Number.isNaN(waist)) {
    cards.push(`<div class="sub-card p-3 sm:col-span-2 text-[13px] text-slate-600 flex items-center">Zadejte obvod pasu a boků a zobrazí se riziko podle rozložení tuku (WHR).</div>`);
  }
  document.getElementById('body-out').innerHTML = cards.join('');
}

function renderProfileTips() {
  const entry = NUTRI_TIPS[STATE.condition];
  const data = entry[STATE.sex] || entry;
  document.getElementById('tips-subtitle').textContent = data.subtitle;
  document.getElementById('profile-tips').innerHTML = data.tips.map(t => `
    <li class="flex gap-2"><span class="text-emerald-600 font-extrabold shrink-0" aria-hidden="true">✓</span><span>${t}</span></li>
  `).join('');
}

function renderTargets() {
  const { kcal, w, isFemale, age } = STATE.nut;
  const senior = STATE.condition === 'hormonal' || age >= 60;
  const cv = STATE.condition === 'stroke';
  const fluids = senior ? `${fmt(w * 0.03, 1)} l (30 ml/kg)` : '1,5–2 l + pití při sportu';
  const rows = [
    ['Vláknina', 'alespoň 30 g', 'Luštěniny, oves, celozrnné výrobky, zelenina, ovoce'],
    ['Zelenina + ovoce', '600 g (400 g + 200 g)', 'Poměr zeleniny a ovoce zhruba 2 : 1'],
    ['Přidaný cukr', `max. ${Math.round(kcal * 0.10 / 4)} g`, 'Nejvýše 10 % denní energie'],
    ['Nasycené tuky', `max. ${Math.round(kcal * 0.10 / 9)} g`, 'Nejvýše 10 % denní energie'],
    ['Sůl', cv ? 'max. 6 g (2,4 g Na)' : '5–6 g', cv ? 'Mírně omezený režim; při hypertenzi i méně' : 'Používejte sůl s jódem'],
    ['Cholesterol', 'max. 300 mg', 'Hlavně z vaječného žloutku, vnitřností, tučného masa'],
    ['Vitamín C', '100 mg', 'Paprika, citrusy, kiwi, brokolice'],
    ['Tekutiny', fluids, 'Voda, neslazené čaje, minerálky'],
    ['Alkohol', isFemale ? 'max. 10 g' : 'max. 20 g', isFemale ? '≈ 125 ml vína nebo 0,3 l piva' : '≈ 250 ml vína nebo 0,5 l piva']
  ];
  document.getElementById('daily-targets').innerHTML = rows.map(([name, val, hint]) => `
    <div class="sub-card p-2.5">
      <div class="flex flex-wrap justify-between gap-x-2 text-[13px]">
        <span class="font-semibold text-slate-700">${name}</span>
        <strong class="text-slate-900">${val}</strong>
      </div>
      <div class="text-[13px] text-slate-600">${hint}</div>
    </div>
  `).join('');
}

function renderMealSplit() {
  const { kcal } = STATE.nut;
  const notes = ['složené sacharidy', 'složené sacharidy', 'složené sacharidy', 'sacharidy + bílkoviny', 'bílkoviny + zelenina'];
  document.getElementById('meal-split').innerHTML = MEAL_SHARES.map(([name, share], i) => `
    <div class="flex items-center gap-2 text-[13px]">
      <span class="w-36 shrink-0 text-slate-700">${name}</span>
      <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-blue-600 rounded-full" style="width:${share * 100 / 0.30}%"></div></div>
      <span class="w-32 text-right tabular-nums font-semibold text-slate-900">${fmt(Math.round(share * 100))} % · ${fmt(Math.round(kcal * share))} kcal</span>
    </div>
    <div class="pl-36 -mt-1 text-[12px] text-slate-600 hidden sm:block">${notes[i]}</div>
  `).join('') + `<p class="text-[13px] text-slate-600 pt-1">Jezte 5–6× denně po 2,5–3 hodinách. Po silovém tréninku můžete přidat 2. večeři (5–10 %) s bílkovinami, po vytrvalostním spíš se sacharidy.</p>`;
}

function scaleMeal(meal, diet, targetKcal) {
  const swaps = (meal.swaps && meal.swaps[diet]) || {};
  const items = meal.items.map(it => swaps[it[0]] || it);
  const baseKcal = items.reduce((sum, [, g, k100]) => sum + g * k100 / 100, 0);
  const factor = baseKcal > 0 ? targetKcal / baseKcal : 1;
  return items.map(([name, g, k100, piece]) => {
    const grams = Math.max(5, Math.round(g * factor / 5) * 5);
    const label = piece ? `${Math.max(1, Math.round(grams / piece))} ks` : `${grams} g`;
    return { name, label, kcal: grams * k100 / 100 };
  });
}

function renderMeals() {
  const { kcal, diet } = STATE.nut;
  const set = MEAL_SETS[STATE.mealIdx % MEAL_SETS.length];
  const note = document.getElementById('diet-note');
  note.hidden = !DIET_NOTES[diet];
  note.innerHTML = DIET_NOTES[diet] || '';
  document.getElementById('meal-list').innerHTML = set.map((meal, i) => {
    const [title, share] = MEAL_SHARES[i];
    const target = kcal * share;
    const items = scaleMeal(meal, diet, target);
    return `
      <div class="sub-card p-3">
        <div class="flex justify-between text-[13px] font-bold text-blue-700">
          <span>${title} (${Math.round(share * 100)} %)</span>
          <span>~${fmt(Math.round(target))} kcal</span>
        </div>
        <ul class="mt-1 text-[13px] text-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          ${items.map(it => `<li class="flex justify-between gap-2 border-b border-dashed border-slate-200 py-0.5"><span>${it.name}</span><span class="tabular-nums font-semibold shrink-0">${it.label}</span></li>`).join('')}
        </ul>
      </div>
    `;
  }).join('');
}
function rotateMeals() { STATE.mealIdx++; renderMeals(); }

function renderTiming() {
  if (!STATE.nut) return;
  const w = STATE.nut.w;
  const dur = document.getElementById('t-duration').value;
  const g = (lo, hi) => `${fmt(Math.round(w * lo / 5) * 5)}–${fmt(Math.round(w * hi / 5) * 5)} g`;
  const during = dur === 'short'
    ? 'Stačí voda nebo hypotonický nápoj, celkem asi 400–500 ml.'
    : dur === 'mid'
    ? 'Nápoj s 6–8 g sacharidů na 100 ml, 200–300 ml každých 15–20 minut. Během zátěže jen jednoduché cukry (glukóza, fruktóza).'
    : 'Nápoj s 6–8 g sacharidů na 100 ml, 200–300 ml každých 15–20 minut, k tomu gely nebo tyčinky.';
  const steps = [
    ['24 h před', 'Dostatek sacharidů pro plné zásoby glykogenu. Vynechte těžko stravitelná jídla.'],
    ['3–4 h před', `Sacharidy 4–5 g/kg, pro vás <strong>${g(4, 5)}</strong> (těstoviny, rýže, brambory, pečivo). Poslední větší jídlo 2–3 h před, lehce stravitelné, s málo tuky a vlákninou.`],
    ['30–60 min před', `Malá svačina s 50–75 g sacharidů (banán, sacharidový nápoj, sportovní tyčinka). ${dur === 'short' ? 'Při zátěži do 60 min se hodí potraviny s vyšším GI.' : 'Při zátěži nad 60 min volte potraviny s nižším GI.'} K tomu 200–300 ml tekutin.`],
    ['Během', during],
    ['Do 30–60 min po', `Sacharidy 1,2–1,5 g/kg, pro vás <strong>${g(1.2, 1.5)}</strong>, spíš s vyšším GI (ovoce, nápoj, tyčinka). Do 20 minut vypijte 300–500 ml hypotonického nápoje. Přidejte kvalitní bílkoviny (vejce, libové maso, mléčné výrobky, sója).`],
    ['Další 4–6 h', `Každé 2 hodiny dalších ${g(1.2, 1.5)} sacharidů; po 3 hodinách už složené sacharidy v běžném jídle.`]
  ];
  document.getElementById('timing-list').innerHTML = steps.map(([when, what]) => `
    <li class="flex gap-3">
      <span class="w-28 shrink-0 text-[13px] font-extrabold text-blue-700 pt-0.5">${when}</span>
      <span class="text-[13px] text-slate-800 leading-relaxed">${what}</span>
    </li>
  `).join('');
}
