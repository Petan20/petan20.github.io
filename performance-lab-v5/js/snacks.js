// Performance Lab · Pohybové svačinky proti dlouhému sezení
// Klasický skript. Krátké 1–3minutové bloky pohybu každých 30–60 minut sezení.
// Přerušování sezení snižuje vzestup cukru a inzulinu po jídle (Dunstan 2012) a krátké
// intenzivní bloky během dne souvisejí s nižší úmrtností (Stamatakis 2022).

const SNACKS = [
  { name: 'Schody nahoru svižně', min: 2, flags: ['threshold'], tag: 'Kondice', how: '2–3 patra nahoru svižně, dolů pomalu. Zadýchání je v pořádku.' },
  { name: 'Vstávání ze židle', min: 1, flags: [], tag: 'Nohy', how: '10–15× vstaňte bez pomoci rukou a pomalu dosedněte.' },
  { name: 'Výpony na špičky', min: 1, flags: [], tag: 'Lýtka a oběh', how: '20× výpon u stolu, nahoře 1 s výdrž. Lýtka pumpují krev zpět k srdci.' },
  { name: 'Kliky o stůl', min: 1, flags: [], tag: 'Horní polovina', how: '10–12 kliků opřených o pevný stůl, tělo rovně.' },
  { name: 'Protažení flexorů kyčle', min: 2, flags: [], tag: 'Mobilita', how: 'Výpad, zadní koleno na zemi nebo na židli, podsaďte pánev. 30–45 s na stranu.' },
  { name: 'Otevření hrudníku ve dveřích', min: 1, flags: ['endRange'], tag: 'Mobilita', how: 'Předloktí o futra, mírný krok vpřed, 30 s. Bez bolesti v rameni.' },
  { name: 'Klouzání paží po zdi', min: 1, flags: [], tag: 'Držení těla', how: 'Záda u zdi, paže v „W“, pomalu nahoru a dolů 10×.' },
  { name: 'Procházka', min: 3, flags: [], tag: 'Kondice', how: '3 minuty chůze: pro vodu, na chodbě, při telefonu.' },
  { name: 'Pochod s vysokými koleny', min: 1, flags: ['threshold'], tag: 'Kondice', how: '60 s rychlý pochod na místě s koleny nahoru, ruce pracují.' },
  { name: 'Předklon v kyčlích', min: 1, flags: [], tag: 'Zadní řetězec', how: 'Ruce na boky, rovná záda, 10× předklon v kyčlích a zpět, hýždě zatnout nahoře.' },
  { name: 'Rotace hrudníku vsedě', min: 1, flags: [], tag: 'Mobilita', how: 'Ruce zkřížené na hrudi, 8× pomalá rotace na každou stranu.' },
  { name: 'Dechová pauza 4-6', min: 1, flags: [], tag: 'Zklidnění', how: '1 minuta: nádech nosem 4 s, výdech 6 s. Pomáhá při stresu.' },
  { name: 'Stoj na jedné noze u stolu', min: 1, flags: ['balance'], tag: 'Rovnováha', how: '30 s na každou nohu, ruka připravená u stolu.' },
  { name: 'Sed u zdi', min: 1, flags: [], tag: 'Nohy a tlak', how: '30–45 s ve sedu u zdi, plynule dýchejte. Izometrie pomáhá snižovat krevní tlak.' },
  { name: 'Skákací panák', min: 1, flags: ['impact', 'hiit'], tag: 'Kondice', how: '30–40 s skákacího panáka. Bez skoků: výkroky do stran se vzpažením.' },
  { name: 'Krčení a kroužení rameny', min: 1, flags: [], tag: 'Krk a ramena', how: '10× pokrčit ramena k uším, 10× kroužit dozadu.' }
];

function snackStatus(snack) {
  const info = CONDITION_INFO[STATE.condition] || CONDITION_INFO.standard;
  const r = info.rules || {};
  if (snack.flags.some(f => (r.no || []).includes(f))) return 'no';
  if (snack.flags.some(f => (r.mod || []).includes(f))) return 'mod';
  return null;
}

function snackDoneKey() { return 'plab_snacks_' + todayISO(); }
function getSnackDone() { try { return JSON.parse(safeGet(snackDoneKey(), '[]') || '[]'); } catch (e) { return []; } }

function toggleSnack(i) {
  const done = getSnackDone();
  const at = done.indexOf(i);
  if (at >= 0) done.splice(at, 1); else done.push(i);
  safeSet(snackDoneKey(), JSON.stringify(done));
  renderSnacks();
}

function timeToMin(t) { const [h, m] = String(t || '08:00').split(':').map(Number); return (h || 0) * 60 + (m || 0); }
function minToTime(m) { return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; }

function renderSnacks() {
  const out = document.getElementById('snack-plan');
  if (!out) return;
  const start = timeToMin(document.getElementById('sn-start').value);
  const end = timeToMin(document.getElementById('sn-end').value);
  const every = +document.getElementById('sn-every').value || 45;
  const ok = SNACKS.filter(s => snackStatus(s) !== 'no');
  const ready = STATE.clientReady || { lightOnly: false };
  const pool = ready.lightOnly ? ok.filter(s => !s.flags.includes('threshold') && !s.flags.includes('hiit')) : ok;
  const slots = [];
  for (let t = start + every; t <= end; t += every) slots.push(t);
  const done = getSnackDone();
  const totalMin = slots.reduce((sum, _, i) => sum + pool[(i * 7) % pool.length].min, 0);
  document.getElementById('snack-count').textContent = `${done.filter(i => i < slots.length).length} z ${slots.length} hotovo dnes`;
  document.getElementById('snack-total').textContent = `${slots.length} přestávek · asi ${totalMin} minut pohybu navíc`;
  out.innerHTML = slots.length ? slots.map((t, i) => {
    const s = pool[(i * 7) % pool.length];
    const st = snackStatus(s);
    const isDone = done.includes(i);
    return `
      <li class="snack-row ${isDone ? 'is-done' : ''}">
        <span class="snack-time tabular-nums">${minToTime(t)}</span>
        <span class="min-w-0">
          <span class="flex flex-wrap items-center gap-1.5"><strong class="text-[13px] text-slate-900">${s.name}</strong><span class="chip">${s.tag} · ${s.min} min</span>${st === 'mod' ? '<span class="chip status-mod">opatrně</span>' : ''}</span>
          <span class="block text-[13px] text-slate-700">${s.how}</span>
        </span>
        <button type="button" class="snack-check" aria-pressed="${isDone}" onclick="toggleSnack(${i})">${isDone ? '✓ Hotovo' : 'Hotovo'}</button>
      </li>`;
  }).join('') : '<li class="text-[13px] text-slate-600">Zvolte delší pracovní dobu nebo kratší interval.</li>';
}

// Odpočet pro jednu svačinku
let snackTimer = null;
function startSnackTimer(sec) {
  const btn = document.getElementById('sn-timer-btn');
  const out = document.getElementById('sn-timer');
  if (snackTimer) { clearInterval(snackTimer); snackTimer = null; btn.textContent = 'Spustit 2 min'; out.textContent = '2:00'; return; }
  let left = sec;
  btn.textContent = 'Zastavit';
  out.textContent = '2:00';
  snackTimer = setInterval(() => {
    left--;
    out.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    if (left <= 0) {
      clearInterval(snackTimer); snackTimer = null;
      btn.textContent = 'Spustit 2 min';
      out.textContent = 'Hotovo!';
    }
  }, 1000);
}
