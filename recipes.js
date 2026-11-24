// Performance Lab · Recepty: filtr, nutriční hodnoty a přepočet na vaši porci
// Klasický skript.

function recipeMacros(r) {
  const tot = { kcal: 0, p: 0, c: 0, f: 0, fib: 0 };
  r.ing.forEach(([key, g]) => {
    const fd = FOODS[key];
    if (!fd) return;
    tot.kcal += fd[1] * g / 100; tot.p += fd[2] * g / 100; tot.c += fd[3] * g / 100; tot.f += fd[4] * g / 100; tot.fib += fd[5] * g / 100;
  });
  const per = {};
  Object.keys(tot).forEach(k => { per[k] = tot[k] / r.serv; });
  return per;
}

function recipeFits(r, diet) {
  if (diet === 'lactose') return !!r.diet.noLactose;
  if (diet === 'gluten') return !!r.diet.noGluten;
  if (diet === 'veg') return !!r.diet.veg;
  return true;
}

function goalFromNutrition() {
  const g = document.getElementById('n-goal');
  if (!g) return 'all';
  const v = +g.value;
  return v < 1 ? 'hubnuti' : v > 1 ? 'svaly' : 'all';
}

function renderRecipes() {
  const grid = document.getElementById('recipe-grid');
  if (!grid) return;
  const meal = document.getElementById('rc-meal').value;
  const goal = document.getElementById('rc-goal').value;
  const mine = document.getElementById('rc-mine').checked;
  const useDiet = document.getElementById('rc-diet').checked;
  const scale = document.getElementById('rc-scale').checked;
  const q = document.getElementById('rc-search').value.trim().toLowerCase();
  const diet = document.getElementById('n-diet') ? document.getElementById('n-diet').value : 'all';
  const cond = STATE.condition;
  const condHasTags = RECIPES.some(r => r.groups.includes(cond));
  const info = CONDITION_INFO[cond] || CONDITION_INFO.standard;

  const list = RECIPES.filter(r => {
    if (meal !== 'all' && r.meal !== meal) return false;
    if (goal !== 'all' && !r.goals.includes(goal)) return false;
    if (mine && condHasTags && !r.groups.includes(cond)) return false;
    if (useDiet && !recipeFits(r, diet)) return false;
    if (q && !(r.name + ' ' + r.ing.map(([k]) => FOODS[k][0]).join(' ')).toLowerCase().includes(q)) return false;
    return true;
  });

  const nut = STATE.nut;
  document.getElementById('rc-count').textContent = `${list.length} z ${RECIPES.length} receptů`;
  document.getElementById('rc-note').textContent = mine && !condHasTags
    ? `Pro skupinu „${info.short}“ nemáme zvláštní výběr, zobrazují se všechny recepty.`
    : mine ? `Vybrané recepty vhodné pro skupinu „${info.short}“.` : '';

  grid.innerHTML = list.length ? list.map(r => {
    const m = recipeMacros(r);
    let factor = 1;
    let target = null;
    if (scale && nut) {
      target = nut.kcal * MEAL_SHARE_BY_TYPE[r.meal];
      factor = target / m.kcal;
    }
    const k = x => x * factor;
    const pctP = m.p * 4 / m.kcal * 100, pctC = m.c * 4 / m.kcal * 100, pctF = m.f * 9 / m.kcal * 100;
    const protShare = nut ? Math.round(k(m.p) / nut.p * 100) : null;
    const grams = (g) => {
      const v = g / r.serv * factor;
      return v >= 20 ? Math.round(v / 5) * 5 : Math.max(1, Math.round(v));
    };
    const tags = [MEAL_LABEL[r.meal], ...r.goals.map(g => GOAL_LABEL[g])];
    const dietTags = [r.diet.veg ? 'vegetariánské' : '', r.diet.noLactose ? 'bez laktózy' : '', r.diet.noGluten ? 'bez lepku' : ''].filter(Boolean);
    return `
      <article class="sub-card p-3.5 flex flex-col gap-2.5">
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-[13px] sm:text-sm font-extrabold text-slate-900">${r.name}</h3>
          <span class="text-[12px] text-slate-600 shrink-0">${r.time} min</span>
        </div>
        <div class="flex flex-wrap gap-1">${tags.map(t => `<span class="chip">${t}</span>`).join('')}${dietTags.map(t => `<span class="chip status-ok">${t}</span>`).join('')}</div>
        <div class="macro-grid tabular-nums">
          <div><span>Energie</span><strong>${fmt(k(m.kcal))}</strong><em>kcal</em></div>
          <div><span>Bílkoviny</span><strong>${fmt(k(m.p))}</strong><em>g</em></div>
          <div><span>Sacharidy</span><strong>${fmt(k(m.c))}</strong><em>g</em></div>
          <div><span>Tuky</span><strong>${fmt(k(m.f))}</strong><em>g</em></div>
          <div><span>Vláknina</span><strong>${fmt(k(m.fib))}</strong><em>g</em></div>
        </div>
        <div class="flex h-2 rounded-full overflow-hidden bg-slate-100" title="Podíl energie S : T : B">
          <div class="bg-emerald-500" style="width:${pctC.toFixed(1)}%"></div><div class="bg-amber-500" style="width:${pctF.toFixed(1)}%"></div><div class="bg-blue-600" style="width:${pctP.toFixed(1)}%"></div>
        </div>
        <div class="text-[12px] text-slate-600">S : T : B = ${fmt(pctC)} : ${fmt(pctF)} : ${fmt(pctP)} % energie${protShare !== null ? ` · ${protShare} % vašeho denního cíle bílkovin` : ''}</div>
        <p class="text-[12px] text-slate-600">${scale && nut ? `Přepočteno na ${fmt(Math.round(target))} kcal (${Math.round(MEAL_SHARE_BY_TYPE[r.meal] * 100)} % vašeho příjmu).` : `Na 1 porci (recept je pro ${r.serv} ${r.serv === 1 ? 'porci' : 'porce'}).`}</p>
        <details class="text-[13px] text-slate-700">
          <summary class="cursor-pointer font-semibold">Suroviny a postup</summary>
          <ul class="mt-1.5 space-y-0.5">${r.ing.map(([key, g]) => `<li class="flex justify-between gap-2 border-b border-dashed border-slate-200 py-0.5"><span>${FOODS[key][0]}</span><span class="tabular-nums font-semibold shrink-0">${grams(g)} g</span></li>`).join('')}</ul>
          <p class="mt-2 leading-relaxed">${r.steps}</p>
          ${r.note ? `<p class="mt-1 text-slate-600"><em>${r.note}</em></p>` : ''}
        </details>
      </article>`;
  }).join('') : '<p class="col-span-full text-center text-[13px] text-slate-600 py-6">Žádný recept neodpovídá filtrům. Zkuste vypnout některý filtr.</p>';
}

function initRecipes() {
  const g = goalFromNutrition();
  if (g !== 'all') document.getElementById('rc-goal').value = g;
  renderRecipes();
}
