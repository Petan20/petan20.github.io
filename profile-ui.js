// Performance Lab · Horní lišta: pohlaví, profil, přepínání sekcí, pilíře
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

const SEX_ON = 'px-3 py-1 rounded-lg text-[13px] font-bold bg-white text-slate-900 shadow-sm transition-all';
const SEX_OFF = 'px-3 py-1 rounded-lg text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-all';

function applySexButtons() {
  const male = document.getElementById('btn-sex-male');
  const female = document.getElementById('btn-sex-female');
  male.className = STATE.sex === 'male' ? SEX_ON : SEX_OFF;
  female.className = STATE.sex === 'female' ? SEX_ON : SEX_OFF;
  setPressed(male, STATE.sex === 'male');
  setPressed(female, STATE.sex === 'female');
}

function setSex(sex) {
  STATE.sex = sex;
  // Skupiny jen pro ženy (těhotenství, po porodu, PCOS) u muže vrátíme na výchozí
  const info = CONDITION_INFO[document.getElementById('profile-condition').value];
  if (sex === 'male' && info && info.sex === 'female') document.getElementById('profile-condition').value = 'standard';
  applySexButtons();
  updateProfile();
}

function updateProfile() {
  STATE.condition = document.getElementById('profile-condition').value;
  const info = CONDITION_INFO[STATE.condition] || CONDITION_INFO.standard;
  if (info.sex === 'female' && STATE.sex !== 'female') STATE.sex = 'female';
  applySexButtons();
  // Těhotenství: ve Výživě rovnou zapneme energii navíc pro 2.–3. trimestr
  const period = document.getElementById('n-period');
  if (period && STATE.condition === 'pregnancy' && period.value === 'none') { period.value = 'preg23'; STATE.autoPreg = true; }
  else if (period && STATE.condition !== 'pregnancy' && STATE.autoPreg) { period.value = 'none'; STATE.autoPreg = false; }
  const prof = PROFILES[STATE.condition][STATE.sex];
  document.getElementById('banner-title').textContent = prof.title;
  document.getElementById('banner-desc').textContent = prof.desc;
  document.getElementById('banner-layman').textContent = prof.layman;
  document.getElementById('ex-profile-note').textContent = prof.exNote;
  document.getElementById('banner-badges').innerHTML = prof.badges.map((b, i) => {
    const cls = i === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : i === 3 ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-blue-50 text-blue-700 border-blue-200';
    return `<span class="text-[13px] font-semibold px-2.5 py-0.5 rounded-full border ${cls}">${escapeHtml(b)}</span>`;
  }).join('');
  const hdr = document.getElementById('hdr-condition');
  if (hdr) hdr.textContent = info.short;
  renderHealth();
  if (typeof saveClient === 'function') saveClient();
  if (typeof renderClientSummary === 'function') renderClientSummary();
  calcNutrition();
  renderSupercomp();
  updateDiaryModel();
  if (STATE.sport) { renderPlan(); renderExercises(); }
  if (typeof renderSnacks === 'function') renderSnacks();
  if (typeof renderRecipes === 'function') renderRecipes();
}

// Podrobný průvodce zvolenou zdravotní skupinou
function renderHealth() {
  const out = document.getElementById('health-guide');
  if (!out) return;
  const info = CONDITION_INFO[STATE.condition] || CONDITION_INFO.standard;
  const t = info.train;
  const caps = info.caps || {};
  const limits = [];
  if (caps.maxPct) limits.push(`zátěž nejvýše ${caps.maxPct} % 1RM`);
  if (caps.maxRPE) limits.push(`námaha nejvýše ${caps.maxRPE} z 10`);
  if (caps.hrrCap) limits.push(`tep nejvýše ${caps.hrrCap} % tepové rezervy`);
  if (caps.noValsalva) limits.push('nikdy nezadržovat dech');
  if (caps.useRPE) limits.push('řídit se pocitem námahy, ne tepem');
  if (caps.pacing) limits.push('šetřit energii (pacing), nenavyšovat přes únavu');
  const flags = info.redFlags.concat(GLOBAL_RED_FLAGS.filter(f => !info.redFlags.includes(f)));
  const counts = ALL_EXERCISES.reduce((acc, ex) => { acc[exerciseStatusFor(ex, STATE.condition).status || 'ok']++; return acc; }, { ok: 0, mod: 0, no: 0 });
  out.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="sub-card p-4 space-y-2">
        <h3 class="text-sm font-extrabold text-slate-900">Jak trénovat</h3>
        <ol class="guide-list">${t.how.map(x => `<li>${x}</li>`).join('')}</ol>
        ${limits.length ? `<p class="text-[13px] rounded-xl px-3 py-2 status-mod"><strong>Limity, které aplikace hlídá:</strong> ${limits.join(', ')}.</p>` : ''}
      </div>
      <div class="space-y-3">
        <div class="sub-card p-4 space-y-1.5">
          <h3 class="text-sm font-extrabold text-slate-900">Co je vhodné</h3>
          <div class="flex flex-wrap gap-1.5">${t.good.map(x => `<span class="chip status-ok">${x}</span>`).join('')}</div>
        </div>
        <div class="sub-card p-4 space-y-1.5">
          <h3 class="text-sm font-extrabold text-slate-900">Čemu se vyhnout</h3>
          <div class="flex flex-wrap gap-1.5">${t.avoid.map(x => `<span class="chip status-no">${x}</span>`).join('')}</div>
        </div>
        <div class="sub-card p-4 space-y-1">
          <h3 class="text-sm font-extrabold text-slate-900">Ze 100 cviků pro vás</h3>
          <div class="flex flex-wrap gap-1.5"><span class="chip status-ok">vhodných ${counts.ok}</span><span class="chip status-mod">s úpravou ${counts.mod}</span><span class="chip status-no">nevhodných ${counts.no}</span></div>
          <button type="button" class="link-btn" onclick="switchView('sec-exercises')">Zobrazit cviky s vaším dávkováním →</button>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="doctor-box p-4 space-y-1.5">
        <h3 class="text-sm font-extrabold">Kdy a s kým to konzultovat</h3>
        <p class="text-[13px] leading-relaxed">${t.doctor} Obsah je vzdělávací a nenahrazuje lékaře ani fyzioterapeuta.</p>
      </div>
      <div class="redflag-box p-4 space-y-1.5">
        <h3 class="text-sm font-extrabold">Cvičení ihned přerušte, když</h3>
        <ul class="list-disc pl-5 text-[13px] space-y-0.5">${flags.map(f => `<li>${f}</li>`).join('')}</ul>
      </div>
    </div>
    <p class="text-[12px] text-slate-600">Zdroje: ${(info.sources || []).join(' · ')}</p>`;
}

const VIEW_ON = 'view-btn is-on';
const VIEW_OFF = 'view-btn';

// Přepnutí skupiny sekcí. Přijímá skupinu (např. 'training') nebo id sekce (např. 'sec-plan').
function switchView(viewId) {
  const sec = document.getElementById(viewId);
  const group = sec && sec.dataset.group ? sec.dataset.group : viewId;
  document.querySelectorAll('.view-btn').forEach(btn => {
    const active = btn.dataset.view === group;
    btn.className = active ? VIEW_ON : VIEW_OFF;
    setPressed(btn, active);
  });
  document.querySelectorAll('.app-section').forEach(s => {
    s.classList.toggle('hidden', !(group === 'all' || s.dataset.group === group));
  });
  safeSet('plab_view', group);
  const target = sec && sec.classList.contains('app-section') ? sec : document.querySelector('main');
  if (target && document.readyState === 'complete') {
    const header = document.querySelector('header');
    const y = target.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0) - 12;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.max(0, sec && sec.classList.contains('app-section') ? y : 0), behavior: reduce ? 'auto' : 'smooth' });
  }
  // Grafy se ve skryté sekci kreslí s nulovou šířkou, po zobrazení je překreslíme
  if (group === 'recovery' || group === 'all') { requestAnimationFrame(() => { renderCharts(); renderTrend(); }); }
}

function renderPillars() {
  document.getElementById('pillar-pills').innerHTML = Object.entries(PILLARS).map(([k, v]) => `
    <button type="button" onclick="selectPillar('${k}')" aria-pressed="${STATE.pillar === k}" class="px-3 py-1.5 rounded-full text-[13px] font-semibold border transition-all inline-flex items-center gap-1.5 ${STATE.pillar === k ? 'pill-on' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}" style="${STATE.pillar === k ? `background:${pillarColor(k)}` : ''}">
      ${STATE.pillar === k ? '' : `<span class="pillar-dot" style="background:${pillarColor(k)}"></span>`}${v.name}
    </button>
  `).join('');
  const p = PILLARS[STATE.pillar];
  document.getElementById('pillar-detail').innerHTML = `
    <div class="sub-card p-3.5" style="border-left:4px solid ${pillarColor(STATE.pillar)}">
      <div class="text-[13px] font-semibold text-slate-600">Metodické parametry zatížení</div>
      <div class="text-[13px] sm:text-sm font-bold text-slate-900 mt-1">${p.meta}</div>
    </div>
    <p class="text-[13px] sm:text-sm text-slate-600 leading-relaxed">${p.desc}</p>
    <div class="layman-box p-3 text-[13px] leading-relaxed">${p.layman}</div>
  `;
}
function selectPillar(k) { STATE.pillar = k; renderPillars(); }

// --- RENDER 100 EXERCISES ---
