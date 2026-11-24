// Performance Lab · Poradní okno (vyhledávání podle klíčových slov)
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

// ============================================================================
// PORADNÍ OKNO (vyhledávání podle klíčových slov, ne umělá inteligence)
// ============================================================================
const CHAT_KEY = 'plab_v4_chat';
const USER_MSG_CLS = 'self-end bg-slate-900 text-white rounded-2xl rounded-br-sm px-3.5 py-2 text-[13px] max-w-[85%] whitespace-pre-wrap';
const BOT_MSG_CLS = 'self-start bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm px-3.5 py-2 text-[13px] max-w-[85%]';
let chatHistory = [];

function renderMsg({ who, text }) {
  const div = document.createElement('div');
  div.className = who === 'user' ? USER_MSG_CLS : BOT_MSG_CLS;
  if (who === 'user') div.textContent = text;   // text od uživatele nikdy jako HTML
  else div.innerHTML = text;                    // odpovědi skládá jen náš kód
  document.getElementById('chat-box').appendChild(div);
}

function addMsg(text, who) {
  const msg = { who, text };
  chatHistory.push(msg);
  chatHistory = chatHistory.slice(-60);
  renderMsg(msg);
  const box = document.getElementById('chat-box');
  box.scrollTop = box.scrollHeight;
  safeSet(CHAT_KEY, JSON.stringify(chatHistory));
}

function loadChat() {
  safeRemove('plab_v3_chat'); // stará verze ukládala HTML, už ji nepoužíváme
  try {
    const data = JSON.parse(safeGet(CHAT_KEY, '[]'));
    chatHistory = Array.isArray(data) ? data.filter(m => m && (m.who === 'user' || m.who === 'bot') && typeof m.text === 'string') : [];
  } catch (e) {
    chatHistory = [];
  }
  document.getElementById('chat-box').innerHTML = '';
  chatHistory.forEach(renderMsg);
  if (!chatHistory.length) {
    addMsg('Vítejte v Performance Lab. Nahoře si vyberte pohlaví a profil, zapište si trénink do deníku nebo se zeptejte na cviky, testy kloubů, únavu, výživu, kofein či pitný režim.', 'bot');
  }
}

function askPreset(q) {
  document.getElementById('chat-input').value = q;
  sendChat();
}

// Normalizace pro porovnávání slov: malá písmena bez diakritiky
function norm(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const STOP_WORDS = new Set(['cviky', 'cvik', 'cviku', 'najdi', 'doporuc', 'doporuc', 'doporucte', 'jake', 'jsou', 'pro', 'muj', 'moje', 'mne', 'na', 'a', 'nebo', 'se', 'jak', 'co', 'kde', 'mam', 'chci', 'nejake']);

// Hledá cviky podle slov v názvu a svalech; slovo musí začínat stejným kmenem
function searchExercises(ql) {
  const words = norm(ql).split(/[^a-z0-9]+/).filter(wd => wd.length > 2 && !STOP_WORDS.has(wd));
  if (!words.length) return [];
  const stems = words.map(wd => wd.length > 5 ? wd.slice(0, wd.length - 2) : wd);
  return ALL_EXERCISES
    .map(ex => {
      const tokens = norm(ex.name + ' ' + ex.muscles).split(/[^a-z0-9]+/);
      const score = stems.reduce((sum, st) => sum + (tokens.some(t => t.startsWith(st)) ? 1 : 0), 0);
      return { ex, score };
    })
    .filter(r => r.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, 5)
    .map(r => r.ex);
}

const has = (ql, ...parts) => parts.some(p => ql.includes(p));

function answerFor(q) {
  const ql = norm(q);
  const prof = PROFILES[STATE.condition][STATE.sex];
  const nut = STATE.nut;
  const val = id => escapeHtml(document.getElementById(id).textContent.trim());

  const wq = ' ' + ql;
  if (has(ql, 'plan', 'tyden', 'kdy cvic', 'co cvic', 'rozvrh', 'co mam dnes', 'dnes cvic') && STATE.plan) {
    const todayIdx = (new Date().getDay() + 6) % 7;
    const t = STATE.plan.week[todayIdx];
    const list = STATE.plan.week.filter(w => w.session.key !== 'REST').map(w => `<li><strong>${w.day}:</strong> ${SESSION_LIB[w.session.key].name} (${SESSION_LIB[w.session.key].zone})</li>`).join('');
    return `Plán pro <strong>${SPORT_DB[STATE.sport].name}</strong>. Dnes (${t.day}): <strong>${SESSION_LIB[t.session.key].name}</strong>.<ul class="list-disc pl-4 mt-1 space-y-0.5">${list}</ul>Podrobnosti a sacharidy na každý den jsou v sekci <strong>Můj plán</strong>.`;
  }
  if (wq.includes(' zon') || has(ql, 'tepov', 'hrmax', 'tep ')) {
    const rows = [...document.querySelectorAll('#zone-table tbody tr')].slice(0, 5).map(tr => {
      const c = tr.querySelectorAll('td');
      return `<li><strong>${escapeHtml(c[0].querySelector('span').textContent)}</strong>: ${escapeHtml(c[1].querySelector('strong') ? c[1].querySelector('strong').textContent : '')} tepů/min</li>`;
    }).join('');
    return `Vaše zóny podle tepové frekvence (stupnice Olympiatoppen):<ul class="list-disc pl-4 mt-1">${rows}</ul>Většinu vytrvalostního tréninku dělejte v I1–I2, kvalitu v I3–I5. Celá tabulka s návodem je v sekci <strong>Mikronástroje</strong>.`;
  }
  if (has(ql, 'red-s', 'reds', 'dostupnost energ', 'malo jim', 'menstruac')) {
    return 'Dostupnost energie = (příjem − výdej tréninku) / tukuprostá hmota. Kolem 45 kcal/kg znamená rovnováhu, pod 30 kcal/kg hrozí RED-S (únava, slabší kosti a imunita, u žen vynechání menstruace). Spočítáte si ji ve Výživě u karty <strong>Dostupnost energie</strong>.';
  }
  if (has(ql, 'pokrok', 'vysledk', 'cooper', 'vyskok', 'sprint 20')) {
    return 'Výkonnostní testy (Cooperův test, výskok, sprint 20 m, rovnováha, vstávání ze židle, klidový tep, síla v dřepu) najdete v sekci <strong>Klinické testy</strong> nahoře. Výsledky se ukládají a ukazují změnu proti minulému testu; u Cooperova testu, rovnováhy a vstávání ze židle i hodnocení podle norem.';
  }
  if (has(ql, 'unav', 'acwr', 'hooper', 'pretren')) {
    const acwr = parseFloat(document.getElementById('out-acwr').textContent.replace(',', '.'));
    return `Aktuální <strong>ACWR je ${val('out-acwr')}</strong> a ranní <strong>Hooperův index ${val('out-hooper')}</strong>. ${acwr > 1.3 ? 'Akutní zátěž stoupá příliš rychle, doporučuji snížit týdenní objem o 15–20 %.' : acwr < 0.8 ? 'Zátěž je nižší než obvykle, objem můžete postupně přidat.' : 'Poměr zátěže je v bezpečném rozmezí pro rozvoj.'}`;
  }
  if (has(ql, 'denik', 'dalsi trenink', 'intenzit', 'graf')) {
    return `Podle deníku je teď vhodné: <strong>${val('d-next-workout')}</strong> (povolená intenzita: <strong>${val('d-max-intensity')}</strong>). Raději vynechte: <em>${val('d-avoid-now')}</em>.`;
  }
  if (has(ql, 'kofein', 'kav', 'espresso', 'energetick')) {
    return `Kofein: espresso 30 ml ≈ 75 mg, překapávaná káva 140 ml 110–165 mg, černý čaj 200 ml ≈ 40 mg, energetický nápoj 230 ml ≈ 80 mg. Kofein povzbuzuje a podporuje lipolýzu, ale působí i močopudně. Celou tabulku najdete ve Výživě u karty <strong>Sportovní nápoje a kofein</strong>.`;
  }
  if (has(ql, 'glykemick', 'naloz') || (' ' + ql + ' ').includes(' gi ')) {
    return `Glykemický index říká, jak rychle se cukr z potraviny dostane do krve (nízký pod 55, vysoký od 70). Nálož GN = GI × g sacharidů / 100; pro běžné jídlo jsou vhodné potraviny s GN pod 10, například čočka (5,2) nebo brokolice (0,3). Bílý chléb má GN 32. Tabulka je ve Výživě u karty <strong>Glykemický index</strong>.`;
  }
  if (has(ql, 'pred trenink', 'po trenink', 'behem', 'pred vykon', 'po vykon', 'casovani')) {
    const w = nut ? nut.w : 70;
    return `Pro vaši hmotnost ${fmt(w)} kg: 3–4 h před tréninkem <strong>${fmt(Math.round(w * 4))}–${fmt(Math.round(w * 5))} g sacharidů</strong>, 30–60 min před 50–75 g. Při zátěži nad 60 min pijte nápoj se 6–8 % sacharidů po 200–300 ml každých 15–20 min. Po tréninku do 30–60 min <strong>${fmt(Math.round(w * 1.2))}–${fmt(Math.round(w * 1.5))} g sacharidů</strong> a bílkoviny. Podrobně ve Výživě u karty <strong>Jídlo a pití kolem tréninku</strong>.`;
  }
  if (has(ql, 'pitn', 'piti', 'hydrat', 'tekutin', 'vodu', 'vody', 'napoj')) {
    return `Doporučený příjem tekutin máte <strong>${val('hyd-out')}</strong>. Před tréninkem 200–300 ml, během 200–300 ml každých 15–20 min, po tréninku 300–500 ml do 20 minut. Ztráta 2 % hmotnosti potem už snižuje výkon.`;
  }
  if (has(ql, 'doplnk', 'suplement', 'kreatin', 'protein', 'vitamin', 'zelez')) {
    return `Doplňky dělíme podle účinnosti: <strong>A</strong> (sportovní nápoje, gely, tyčinky, multivitamíny) jsou vhodné v konkrétních situacích, <strong>B</strong> (antioxidanty, probiotika) pravděpodobně, u <strong>C</strong> (koenzym Q10, ženšen) chybí důkazy a <strong>D</strong> (stimulanty, prohormony) jsou zakázané nebo škodlivé. Železo a vysoké dávky vitamínu D užívejte jen po krevním testu. Více ve Výživě u karty <strong>Doplňky stravy</strong>.`;
  }
  if (has(ql, 'superkompenz sachar', 'glykogen', 'zavod', 'maraton')) {
    return `Sacharidová superkompenzace: 6.–4. den před závodem intenzivní trénink a běžná strava, poslední 3 dny jen lehké rozcvičení a strava s vysokým podílem sacharidů. Největší přínos má u maratonu, triatlonu, běhu na lyžích nebo silniční cyklistiky. Viz Výživa, karta <strong>Sacharidová superkompenzace</strong>.`;
  }
  if (has(ql, 'superkompenz', 'odpoc', 'regenerac')) {
    return `Doba regenerace je u vašeho profilu upravena koeficientem <strong>×${fmt(prof.recMult, 2)}</strong>. ATP-CP se obnoví za 3–5 min, svalový glykogen za 24–48 h a CNS po těžké síle nebo výbušnosti za 48–72 h.`;
  }
  if (has(ql, 'ziv', 'jidel', 'kalori', 'bilkovin', 'sachar', 'tuk', 'menopauz', 'kost', 'vapnik', 'mikro', 'strav', 'vyziv')) {
    if (!nut) return 'Výživu spočítá kalkulačka v sekci Výživa.';
    const tips = (NUTRI_TIPS[STATE.condition][STATE.sex] || NUTRI_TIPS[STATE.condition]).tips.slice(0, 2);
    return `Pro profil <strong>${prof.title}</strong> vychází <strong>${fmt(nut.kcal)} kcal</strong>: ${nut.p} g bílkovin (${fmt(nut.protPerKg, 2)} g/kg), ${nut.c} g sacharidů a ${nut.f} g tuků. Klíčové mikroživiny: ${prof.micros.map(x => `<strong>${x[0]}</strong> (${x[1]})`).join(', ')}.<br>${tips.map(t => '• ' + t).join('<br>')}`;
  }
  if (has(ql, 'test', 'vysetr', 'kotnik', 'ramen', 'kycel', 'skolioz', 'pater', 'hrudnik test')) {
    const matched = CLINICAL_TESTS.filter(t => {
      const tgt = norm(t.target + ' ' + t.name);
      return (has(ql, 'kotnik') && tgt.includes('hlezen')) ||
        (has(ql, 'ramen') && tgt.includes('ramen')) ||
        (has(ql, 'kycel') && tgt.includes('kycel')) ||
        (has(ql, 'skolioz') && tgt.includes('adams')) ||
        (has(ql, 'pater') && tgt.includes('pater')) ||
        (has(ql, 'drep') && tgt.includes('drep'));
    });
    const list = matched.length ? matched : CLINICAL_TESTS.slice(0, 3);
    return `V sekci <strong>Klinické testy</strong> doporučuji:<ul class="list-disc pl-4 mt-1 space-y-1">${list.map(t => `<li><strong>${t.name}</strong>: ${t.how} <em>(Náprava: ${t.fix})</em></li>`).join('')}</ul>`;
  }
  if (has(ql, 'profil', 'doporuceni pro')) {
    return `Pro profil <strong>${prof.title}</strong>: ${prof.layman.replace('💡 V praxi: ', '')}<br><br>${prof.exNote}`;
  }
  const found = searchExercises(q);
  if (found.length || has(ql, 'cvik')) {
    const chosen = found.length ? found : ALL_EXERCISES.filter((_, i) => i % 20 === 0);
    return `Z databáze <strong>100 cviků</strong> ${found.length ? 'odpovídá vašemu dotazu' : 'doporučuji začít těmito základy'}:<ul class="list-disc pl-4 mt-1 space-y-1">${chosen.map(e => `<li><strong>${e.name}</strong> (${e.patternLabel}) – ${e.muscles} · <em>${e.dose}</em></li>`).join('')}</ul><div class="mt-1 text-slate-600">${prof.exNote}</div>`;
  }
  return 'Tomu nerozumím. Zkuste se zeptat například na „cviky na hýždě“, „test kotníku“, „únavu“, „kolik bílkovin“, „co jíst před tréninkem“, „kofein“ nebo „pitný režim“.';
}

function sendChat() {
  const inp = document.getElementById('chat-input');
  const q = inp.value.trim();
  if (!q) return;
  inp.value = '';
  addMsg(q, 'user');
  addMsg(answerFor(q), 'bot');
}

function clearChat() {
  chatHistory = [];
  safeRemove(CHAT_KEY);
  document.getElementById('chat-box').innerHTML = '';
  addMsg('Historie vymazána. Ptejte se na cviky, testy kloubů, únavu (ACWR), výživu, kofein nebo pitný režim.', 'bot');
}
