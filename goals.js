// Performance Lab · Trénink podle sportu a cíle
// Klasický skript. Parametry vycházejí z pozičních stanovisek a přehledových studií
// (ACSM 2009, ACSM 2011, NSCA, Seiler 2010, Schoenfeld 2017, Haugen 2019, Lauersen 2014, Kellmann 2018).

const GOALS = {
  endurance: {
    name: 'Vytrvalost', ability: 'e',
    what: 'Zvyšuje VO2max (kolik kyslíku tělo zpracuje), laktátový práh a ekonomiku pohybu.',
    params: [
      ['Intenzita', 'Asi 80 % objemu v nízké intenzitě (I1–I2), 20 % ve vysoké (I3–I5). Takzvaný polarizovaný model.'],
      ['Intervaly', '1–2× týdně: 4 × 4 min v I4 s pauzou 3 min, nebo 5 × 3 min v I5, nebo 3 × 10 min v I3.'],
      ['Objem', 'Začátečník 3 × 30 min týdně, rekreační sportovec 3–6 h, výkonnostní 8–15 h.'],
      ['Frekvence', '3–6× týdně.'],
      ['Progrese', 'Objem přidávejte o 5–10 % týdně, každý 3.–4. týden odlehčete o 30–40 %.']
    ],
    phase: { prep: 'Budujte objem v I1–I2, intervaly postupně od I3 k I4.', comp: 'Objem snižte, udržte 1–2 kvalitní intervalové jednotky týdně.', trans: 'Jen lehký pohyb v I1, jiné sporty.' },
    ex: ['Souvislý běh v zóně I2', 'Norwegian 4×4 min HIIT (I4)', 'Tempový běh na prahu ANP (I3)', 'Cyklistika v zóně I2'],
    sources: ['Seiler 2010', 'Helgerud 2007', 'Garber a kol. 2011 (ACSM)']
  },
  maxStrength: {
    name: 'Maximální síla', ability: 's',
    what: 'Zvyšuje největší sílu, kterou sval vyvine. Je základem pro výbušnost, rychlost i prevenci zranění.',
    params: [
      ['Zátěž', '80–90 % 1RM, 1–3 opakování v záloze.'],
      ['Série × opakování', '3–6 sérií po 1–5 opakováních na hlavní cvik, 2–4 hlavní cviky.'],
      ['Pauza', '3–5 min mezi sériemi.'],
      ['Frekvence', '2–3× týdně na stejnou partii.'],
      ['Progrese', 'Když zvládnete horní hranici opakování ve všech sériích, přidejte 2,5–5 % zátěže.']
    ],
    phase: { prep: '2–3 silové jednotky týdně, od 6–8 opakování k 3–5.', comp: '1–2 krátké jednotky týdně: 2–3 série po 3 opakováních, sílu jen udržujete.', trans: 'Lehčí obecná síla, 8–12 opakování.' },
    ex: ['Zadní dřep s velkou činkou', 'Mrtvý tah s Trap Barem', 'Bench press s činkou / jednoručkami', 'Shyby / Stahování horní kladky'],
    sources: ['ACSM 2009 (Progression models)', 'Haff & Triplett 2016 (NSCA)', 'Suchomel a kol. 2018']
  },
  power: {
    name: 'Výbušnost', ability: 'x',
    what: 'Rychlost nárůstu síly: výskok, odraz, hod, start. Staví na maximální síle.',
    params: [
      ['Zátěž', 'Vlastní tělo nebo 30–60 % 1RM s maximální rychlostí, u přemístění 60–80 %.'],
      ['Opakování', '3–6 opakování, série ukončete při poklesu rychlosti nebo výšky.'],
      ['Plyometrie', 'Začátečník 80–100 dotyků se zemí za jednotku, pokročilý 100–120, výkonnostní 120–140.'],
      ['Pauza', '2–5 min, úplné zotavení.'],
      ['Zařazení', 'Na začátek jednotky po rozcvičení, 2–3× týdně, s odstupem 48 h.']
    ],
    phase: { prep: 'Nejdřív síla a technika dopadu, pak odrazy a balistické cviky.', comp: 'Malý objem, vysoká kvalita, 1–2× týdně.', trans: 'Bez plyometrie.' },
    ex: ['Výskok s protipohybem (CMJ)', 'Výskok na bednu (Box Jump)', 'Švih s kettlebellem (KB Swing)', 'Odhod medicinbalu od hrudníku'],
    sources: ['Haff & Triplett 2016 (NSCA)', 'Suchomel a kol. 2018', 'Ramirez-Campillo a kol. 2020 (plyometrie)']
  },
  speed: {
    name: 'Rychlost a akcelerace', ability: 'a',
    what: 'Start, zrychlení a nejvyšší rychlost. Rozhoduje nervový systém a síla odrazu.',
    params: [
      ['Intenzita', '95–100 % úsilí. Pomalejší úsek už rychlost nerozvíjí.'],
      ['Úseky', 'Akcelerace 10–30 m ze startu, maximální rychlost letmo 10–30 m po rozběhu.'],
      ['Pauza', 'Asi 1 min na každých 10 m úseku, mezi sériemi 4–6 min.'],
      ['Objem', '150–300 m sprintu za jednotku.'],
      ['Frekvence', '2–3× týdně, vždy čerstvý, na začátku jednotky.']
    ],
    phase: { prep: 'Od akcelerace ke krátkým letmým úsekům, k tomu síla.', comp: 'Krátké úseky 1–2× týdně, plná kvalita.', trans: 'Jen herní pohyb.' },
    ex: ['Start na 10–20 m (akcelerace)', 'Letmý sprint na 20 m (Flying Sprint)', 'Odporovaný sprint s gumou / saněmi', 'Běžecká abeceda (A-Skip / High Knees)'],
    sources: ['Haugen a kol. 2019', 'Haff & Triplett 2016 (NSCA)']
  },
  hypertrophy: {
    name: 'Svalová hmota', ability: 's', abilityMult: 0.8,
    what: 'Růst svalů. Rozhoduje dostatek sérií blízko selhání, ne konkrétní počet opakování.',
    params: [
      ['Zátěž', '30–85 % 1RM; podstatné je cvičit 0–3 opakování před selháním.'],
      ['Opakování', 'Nejčastěji 6–15, funguje i 15–30 s lehčí zátěží.'],
      ['Objem', '10–20 pracovních sérií na svalovou partii týdně.'],
      ['Pauza', '1,5–3 min u vícekloubových, 1–2 min u jednokloubových cviků.'],
      ['Frekvence', 'Každou partii aspoň 2× týdně; bílkoviny 1,6–2,2 g/kg.']
    ],
    phase: { prep: 'Hlavní období pro nabírání svalů.', comp: 'U sportů, kde rozhoduje hmotnost nebo vytrvalost, objem snižte.', trans: 'Udržovací objem.' },
    ex: ['Bulharský dělený dřep', 'Hip Thrust s osou / jednoručkou', 'Kliky na bradlech / se zátěží', 'Přítahy jednoručky s oporou o lavici'],
    sources: ['Schoenfeld a kol. 2017 (objem)', 'Schoenfeld a kol. 2017 (zátěž)', 'ACSM 2009']
  },
  injury: {
    name: 'Prevence zranění', ability: null,
    what: 'Silový trénink snižuje sportovní zranění asi o třetinu a zranění z přetížení zhruba na polovinu.',
    params: [
      ['Síla', '2× týdně silový trénink celého těla, hlavně zadní stehna, hýždě, lýtka a trup.'],
      ['Specifické cviky', 'Nordic Hamstring Curl (zadní stehna), Copenhagen (třísla), výpony (Achillova šlacha), Face Pulls (rameno).'],
      ['Program', 'Rozcvičení typu FIFA 11+ 2–3× týdně po 15–20 min snižuje zranění ve fotbale asi o třetinu.'],
      ['Zátěž', 'Týdenní objem zvyšujte postupně, poměr akutní a dlouhodobé zátěže držte orientačně 0,8–1,3.'],
      ['Spánek a energie', 'Spánek pod 7 h a nedostatek energie (RED-S) zvyšují riziko zranění.']
    ],
    phase: { prep: 'Preventivní cviky 2–3× týdně.', comp: '1–2× týdně krátce, nevynechávat.', trans: 'Doléčení drobných potíží.' },
    ex: ['Nordic Hamstring Curl', 'Výpony na lýtka ve stoji i vsedě', 'Face Pulls na kladce / s gumou', 'Boční prkno (Side Plank)'],
    sources: ['Lauersen a kol. 2014', 'Thorborg a kol. 2017 (FIFA 11+)', 'van Dyk a kol. 2019', 'Gabbett 2016']
  },
  recovery: {
    name: 'Regenerace', ability: null,
    what: 'Bez regenerace se trénink nepromění ve výkon. Největší vliv mají spánek a jídlo.',
    params: [
      ['Spánek', '7–9 h denně, sportovci s velkým objemem i víc. Pravidelný čas usínání.'],
      ['Jídlo po tréninku', 'Sacharidy 1–1,2 g/kg a bílkoviny 0,3 g/kg do 1–2 h, hlavně při dvou jednotkách denně.'],
      ['Aktivní regenerace', '20–30 min v I1 den po náročném tréninku.'],
      ['Odlehčení', 'Každé 3–6 týdnů týden s objemem o 30–50 % nižším.'],
      ['Sledování', 'Hooperův index, ranní tep a pocit únavy. Trvale zhoršené hodnoty znamenají ubrat.']
    ],
    phase: { prep: 'Odlehčovací týden každý 3.–4. týden.', comp: 'Po zápase nebo závodě 24–48 h lehce.', trans: '2–4 týdny volnějšího režimu.' },
    ex: ['Souvislý běh v zóně I2', 'Mrtvý brouk (Dead Bug s výdechem)', 'Rotace hrudní páteře v lehu (Open Book)', 'Hluboký odpočinkový dřep s dechem'],
    sources: ['Kellmann a kol. 2018', 'Walsh a kol. 2021 (spánek)', 'Thomas a kol. 2016 (ACSM výživa)']
  }
};

// Jak cíl uplatnit v konkrétním typu sportu
const CAT_GOAL = {
  sprint: {
    endurance: 'Aerobní základ jen v nízké intenzitě (tempové běhy 100–200 m na 60–70 %), aby nebrzdil rychlost. U 400 m přidejte speciální vytrvalost 150–300 m.',
    maxStrength: 'Dřep, mrtvý tah a přemístění 2–3× týdně v přípravě. Silnější odraz zkracuje kontakt se zemí.',
    power: 'Odrazy a skoky (Bounds, Broad Jump, Box Jump) 2× týdně, v sezóně malý objem.',
    speed: 'Hlavní cíl: úseky 20–60 m na 95–100 %, akcelerace z bloků, letmé úseky.',
    hypertrophy: 'Jen tolik svalů, kolik zvedne výkon; větší hmotnost zhoršuje poměr síly a váhy.'
  },
  middle: {
    endurance: 'Hlavní cíl: většina objemu v I1–I2, intervaly I4–I5 a laktátová tolerance v závodním tempu.',
    maxStrength: '1–2× týdně, malý objem; zlepšuje ekonomiku běhu a chrání šlachy.',
    power: 'Kotníkové odrazy a krátké skoky pro tuhost kotníku a ekonomiku.',
    speed: 'Rovinky 6–8 × 80 m 1–2× týdně udrží rychlost a techniku.',
    hypertrophy: 'Nízká priorita, hmotnost navíc zvyšuje energetickou cenu běhu.'
  },
  endurance: {
    endurance: 'Hlavní cíl: polarizovaný trénink, dlouhá jednotka 1× týdně, prahové a VO2max intervaly.',
    maxStrength: 'Těžký silový trénink 2× týdně (3–5 opakování) zlepšuje ekonomiku běhu i kola o 2–8 % bez přírůstku hmotnosti.',
    power: 'Krátké odrazy a výběhy kopců pro ekonomiku a závěrečný spurt.',
    speed: 'Krátké rovinky nebo sprinty na kole 1× týdně.',
    hypertrophy: 'Nízká priorita, kromě veslování a plavání, kde svaly horní poloviny pomáhají.'
  },
  team: {
    endurance: 'Opakované sprinty a herní intervaly (4 × 4 min I4, 15/15 s) zlepšují zotavení mezi akcemi.',
    maxStrength: '2× týdně v přípravě, 1× v sezóně. Základ pro souboje, skoky a prevenci zranění.',
    power: 'Skoky, odhody medicinbalu a švihy; v sezóně 1× týdně krátce.',
    speed: 'Akcelerace 5–20 m, brzdění a změny směru, reakce na podnět.',
    hypertrophy: 'Střední priorita podle postu (obránci v hokeji a házené víc).'
  },
  racket: {
    endurance: 'Krátké intervaly 15–30 s s krátkou pauzou odpovídají výměnám; aerobní základ pro zotavení.',
    maxStrength: 'Síla nohou a trupu, rotační síla; u ramene vyvažovat tahové cviky.',
    power: 'Rotační hody medicinbalem, bruslařské skoky, starty do stran.',
    speed: 'První krok, úkroky, změny směru a reakce (Reaction Ball, zrcadlení).',
    hypertrophy: 'Nízká priorita, důležitější je síla a odolnost ramene.'
  },
  combat: {
    endurance: 'Intervaly podle délky kola (3–5 min) s krátkou pauzou; aerobní základ pro zotavení mezi koly.',
    maxStrength: 'Síla celého těla 2× týdně; u váhových kategorií s důrazem na sílu bez přírůstku hmotnosti.',
    power: 'Odhody a hody medicinbalem, výbušné tahy a tlaky.',
    speed: 'Reakce a rychlost úderů a nástupů v technickém tréninku.',
    hypertrophy: 'Podle váhové kategorie; nabírání plánujte mimo sezónu.'
  },
  strength: {
    endurance: 'Aerobní základ 2× týdně po 20–30 min v I1–I2 zrychlí zotavení mezi sériemi, nesníží sílu.',
    maxStrength: 'Hlavní cíl: periodizace od objemu k intenzitě, vrchol 80–95 % 1RM před soutěží.',
    power: 'U vzpírání hlavní cíl (přemístění, trhy); u trojboje skoky a rychlé opakování s 50–60 %.',
    speed: 'Rychlost činky (rychlé opakování) místo běžecké rychlosti.',
    hypertrophy: 'Bloky nabírání svalů mimo soutěžní období, větší sval má větší potenciál síly.'
  },
  crossfit: {
    endurance: 'Kombinace I2 objemu a intervalů I4–I5 na různých strojích.',
    maxStrength: '2× týdně těžké základní cviky, aby síla nezaostávala za kondicí.',
    power: 'Olympijské zvedání a skoky s technikou dřív než s objemem.',
    speed: 'Krátké sprinty a rychlé přechody mezi cviky.',
    hypertrophy: 'Střední priorita, hlídejte celkovou únavu.'
  },
  climbing: {
    endurance: 'Vytrvalost předloktí (dlouhé cesty), k tomu obecný aerobní základ 1–2× týdně.',
    maxStrength: 'Síla prstů (visy na liště) a tahů; nejdřív po 1–2 letech lezení.',
    power: 'Dynamické kroky a kampusování jen u pokročilých, s opatrností na prsty.',
    speed: 'Nízká priorita, kromě rychlostního lezení.',
    hypertrophy: 'Nízká priorita, rozhoduje poměr síly a hmotnosti.'
  },
  health: {
    endurance: 'Hlavní cíl: 150–300 min chůze, kola nebo plavání týdně (WHO 2020).',
    maxStrength: 'Síla celého těla 2× týdně, 8–12 opakování, ve vyšším věku i těžší zátěž.',
    power: 'U starších lidí rychlé vstávání ze židle a výstupy, pomáhá při chůzi a prevenci pádů.',
    speed: 'Nízká priorita.',
    hypertrophy: 'Udržení svalové hmoty je důležité od 40 let výš.'
  }
};

function renderGoals() {
  const out = document.getElementById('goal-out');
  if (!out || !STATE.sport) return;
  const sp = SPORT_DB[STATE.sport];
  const sel = document.getElementById('goal-select');
  const key = sel.value || 'endurance';
  const g = GOALS[key];
  const period = document.getElementById('p-period') ? document.getElementById('p-period').value : 'prep';
  const ab = { s: sp.abilities.s, e: sp.abilities.e, x: sp.abilities.x, a: sp.abilities.a };
  const prio = k => {
    const goal = GOALS[k];
    if (!goal.ability) return 100;
    return Math.round(ab[goal.ability] * (goal.abilityMult || 1));
  };
  const prioLabel = v => v >= 80 ? ['vysoká', 'status-ok'] : v >= 55 ? ['střední', 'status-mod'] : ['nízká', 'status-low'];
  const ranking = Object.keys(GOALS).filter(k => GOALS[k].ability).map(k => [k, prio(k)]).sort((a, b) => b[1] - a[1]);
  const exs = g.ex.map(n => ALL_EXERCISES.find(e => e.name === n)).filter(Boolean);
  const blocked = exs.filter(e => exerciseStatusFor(e, STATE.condition).status === 'no');
  const info = CONDITION_INFO[STATE.condition];
  const catTip = (CAT_GOAL[sp.cat] || {})[key];
  const pl = prioLabel(prio(key));
  const sportSpecific = key === 'injury' ? sp.injuries.join(' ') : key === 'recovery' ? sp.nutri : catTip;
  const phaseName = { prep: 'přípravném období', comp: 'závodním období', trans: 'přechodném období' }[period];

  out.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-sm sm:text-base font-extrabold text-slate-900">${g.name} pro ${escapeHtml(sp.name.toLowerCase())}</h3>
          ${g.ability ? `<span class="chip ${pl[1]}">Priorita pro tento sport: ${pl[0]}</span>` : '<span class="chip status-ok">Důležité pro každý sport</span>'}
        </div>
        <p class="text-[13px] text-slate-700 leading-relaxed">${g.what}</p>
        <div class="sub-card p-3.5">
          <div class="text-[13px] font-extrabold text-slate-900 mb-1.5">Jak trénovat (obecné parametry)</div>
          <dl class="rx-dl">${g.params.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
        </div>
        ${sportSpecific ? `<div class="sub-card p-3.5 border-l-4" style="border-left-color:var(--acc)"><div class="text-[13px] font-extrabold text-slate-900 mb-1">Konkrétně pro ${escapeHtml(sp.name)}</div><p class="text-[13px] text-slate-700 leading-relaxed">${sportSpecific}</p></div>` : ''}
        <div class="text-[13px] text-slate-700"><strong>V ${phaseName}:</strong> ${g.phase[period]} <span class="text-slate-600">(období měníte v sekci Plán.)</span></div>
        <div class="text-[13px] text-slate-700"><strong>Klíčové cviky:</strong> ${exs.map(e => {
          const s = exerciseStatusFor(e, STATE.condition).status;
          return `<span class="${s === 'no' ? 'line-through text-slate-500' : ''}">${e.name}</span>`;
        }).join(' · ')}</div>
        ${blocked.length ? `<p class="text-[13px] rounded-xl px-3 py-2 status-mod"><strong>${escapeHtml(info.short)}:</strong> ${blocked.length} z ${exs.length} klíčových cviků pro vás není vhodných. ${escapeHtml(info.rules.why || '')} Vyberte náhradu ve stejném pohybovém vzorci v sekci Cviky.</p>` : ''}
        <p class="text-[12px] text-slate-600">Zdroje: ${g.sources.join('; ')}.</p>
      </div>
      <div class="sub-card p-3.5 space-y-2">
        <div class="text-[13px] font-extrabold text-slate-900">Co má pro ${escapeHtml(sp.name)} největší přínos</div>
        ${ranking.map(([k, v]) => `
          <button type="button" class="goal-row ${k === key ? 'is-on' : ''}" onclick="document.getElementById('goal-select').value='${k}'; renderGoals()">
            <span class="flex justify-between text-[13px] font-semibold"><span>${GOALS[k].name}</span><span class="tabular-nums">${v}</span></span>
            <span class="goal-bar"><span style="width:${v}%"></span></span>
          </button>`).join('')}
        <p class="text-[12px] text-slate-600">Prevence zranění a regenerace mají vysokou prioritu v každém sportu. Číslo je odborný odhad nároku sportu (0–100), ne měření.</p>
      </div>
    </div>`;
}
