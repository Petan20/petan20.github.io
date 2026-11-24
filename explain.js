// Performance Lab · Rozbalovací vysvětlení grafů a odborných ukazatelů
// Klasický skript. Nadpis s atributem data-explain="klíč" dostane tlačítko „?“,
// které pod nadpisem rozbalí jednoduché vysvětlení.

const EXPLAIN = {
  'combined-chart': {
    what: 'Křivky ukazují, jak se po tréninku vyčerpají a znovu doplní 4 „systémy“ těla: nervový systém, zásoby cukru ve svalech, svaly se šlachami a rychlá energie na sprint.',
    read: 'Vodorovně je čas od konce tréninku (0–96 hodin), svisle stav systému (100 % = jako před tréninkem). Svislá čára je „teď“ podle posuvníku. Když křivka vystoupá nad 100 %, systém je na tom lépe než před tréninkem (superkompenzace).',
    take: 'Další těžký trénink stejného typu dejte ve chvíli, kdy jsou hlavní křivky nad 100 %. Je to zjednodušený model z vašich údajů, ne měření.'
  },
  'individual-charts': {
    what: 'Stejné křivky jako ve společném grafu, jen každý systém zvlášť, aby se daly lépe přečíst.',
    read: 'Barevná tečka je váš stav teď. Text pod grafem říká, v jaké fázi obnovy systém je.',
    take: 'Stačí se podívat, který systém je nejníž: ten dnes netrénujte naplno.'
  },
  'acwr': {
    what: 'Porovnává, kolik jste trénovali poslední týden, s průměrem posledních 4 týdnů. Zátěž jedné jednotky = minuty × námaha (1–10).',
    read: 'Hodnota 1,0 znamená, že trénujete stejně jako obvykle. 1,5 znamená o polovinu víc než obvykle.',
    take: 'Držte se zhruba mezi 0,8 a 1,3. Prudké navýšení nad 1,5 bývá spojováno s častějšími zraněními. Jde o vodítko, ne přesné pravidlo.'
  },
  'hooper': {
    what: 'Ranní dotazník ze 4 otázek: spánek, únava, bolest svalů a stres. Každou oznámkujte 1 (výborné) až 7 (velmi špatné).',
    read: 'Součet je 4 až 28 bodů. Čím víc, tím hůř.',
    take: 'Důležitější než přesné číslo je změna proti vašemu běžnému stavu. Když je skóre o 3–4 body horší než obvykle, dejte lehčí den.'
  },
  'trend': {
    what: 'Sloupce ukazují zátěž každého dne z deníku, čára hodiny spánku za poslední 4 týdny.',
    read: 'Vysoké sloupce = náročné dny. Hledejte, jestli po náročných dnech nepadá spánek.',
    take: 'Když se střídají vysoké a nízké sloupce, je trénink dobře rozložený. Několik vysokých sloupců za sebou s klesajícím spánkem je varování.'
  },
  'macro-bar': {
    what: 'Barevný pruh ukazuje, jakou část energie dodávají sacharidy, tuky a bílkoviny (trojpoměr S : T : B).',
    read: 'Zelená jsou sacharidy, oranžová tuky, modrá bílkoviny. V závorce je doporučené rozpětí pro zvolený typ stravy.',
    take: 'Bílkoviny počítáme v gramech na kilogram hmotnosti, ne procentem. Při hubnutí proto jejich podíl vyjde vyšší, než říká trojpoměr, a to je v pořádku.'
  },
  'sport-profile': {
    what: 'Pruhy ukazují, jak moc sport vyžaduje sílu, vytrvalost, výbušnost, rychlost a koordinaci. VO2max říká, kolik kyslíku dokážou zpracovat špičkoví sportovci tohoto sportu.',
    read: '100 % znamená, že daná schopnost je pro sport rozhodující. Hodnoty jsou odborný odhad z literatury.',
    take: 'Nejvíc času věnujte schopnostem s nejdelším pruhem, ostatní neopomíjejte kvůli prevenci zranění.'
  },
  'gi': {
    what: 'Glykemický index (GI) říká, jak rychle potravina zvedne cukr v krvi. Glykemická nálož (GN) zohledňuje i to, kolik sacharidů potravina obsahuje.',
    read: 'Pro běžné jídlo sledujte hlavně GN: pod 10 je nízká, nad 20 vysoká. Meloun má vysoký GI, ale nízkou GN, protože obsahuje málo cukru.',
    take: 'Při cukrovce a hubnutí volte jídla s nízkou GN. Těsně po výkonu naopak pomohou potraviny s vyšším GI.'
  },
  'zones': {
    what: 'Tabulka rozděluje intenzitu tréninku do zón I1 až I8 podle tepu, laktátu a pocitu námahy.',
    read: 'Najděte řádek podle toho, co chcete trénovat, a ve sloupci Tep uvidíte své rozmezí. Sloupec Karvonen počítá s vaším klidovým tepem, a je proto přesnější.',
    take: 'Většinu času trénujte v I1–I2 (zvládnete mluvit). Náročné zóny I4–I5 stačí 1–2× týdně. Při betablokátorech se řiďte pocitem námahy.'
  },
  'reds': {
    what: 'Dostupnost energie = kolik energie z jídla zbude tělu po odečtení tréninku, na kilogram svalů a kostí (bez tuku).',
    read: 'Kolem 45 kcal/kg je rovnováha. 30–45 je mírný deficit. Pod 30 kcal/kg tělo začne šetřit na kostech, hormonech a imunitě.',
    take: 'Dlouhodobě nízká hodnota vede k únavovým zlomeninám a u žen k vynechání menstruace. Jezte víc, hlavně v tréninkové dny.'
  },
  'supercomp': {
    what: 'Ukazuje, kolik hodin po tréninku určitého typu potřebuje tělo na odpočinek a kdy je ideální přidat další podnět.',
    read: 'První karta je doporučený odpočinek, druhá okno, kdy jste na tom lépe než před tréninkem. Číslo je upravené podle vašeho zdravotního profilu.',
    take: 'Lehký trénink jiného typu můžete zařadit kdykoli, těžký trénink stejného typu raději v okně superkompenzace.'
  },
  'energy': {
    what: 'Tělo má „baterie“ s různou rychlostí dobíjení: rychlou energii na sprint (ATP-CP), pálení svalů při intervalech, zásoby cukru (glykogen) a nervový systém.',
    read: 'Vpravo je čas, za jak dlouho se baterie dobije.',
    take: 'Mezi těžkými sériemi dřepu nebo sprinty dejte 3–5 minut pauzu. Po dlouhém nebo velmi intenzivním tréninku počítejte s 1–3 dny.'
  },
  'readiness': {
    what: 'Číslo 0–100 % shrnuje, jak jste dnes připraveni na trénink, podle únavy, spánku, bolesti a ranního tepu.',
    read: 'Nad 85 % trénujte podle plánu, 70–84 % zkraťte, pod 70 % jen lehký pohyb.',
    take: 'Podle připravenosti se automaticky upraví dávkování cviků v sekci Cviky.'
  },
  'perf': {
    what: 'Výsledky jednoduchých testů zdatnosti. U testů s normami (Cooperův test, stoj na jedné noze, vstávání ze židle) uvidíte hodnocení podle věku a pohlaví.',
    read: 'Malý graf v kartě ukazuje vývoj vašich výsledků. Čára nahoru znamená zlepšení (u tepu naopak dolů).',
    take: 'Testujte jednou za 6–8 týdnů stejným způsobem a ve stejnou denní dobu, jinak výsledky nejde porovnat.'
  },
  'rm': {
    what: '1RM je největší váha, kterou zvednete jednou. Spočítáme ji z váhy a počtu opakování, takže ji nemusíte zkoušet.',
    read: 'Pod výsledkem jsou váhy pro různé cíle, třeba 85 % pro sílu nebo 75 % pro svaly.',
    take: 'Zadejte svou 1RM u cviku v sekci Cviky a předpis se přepočítá na kilogramy.'
  }
};

function initExplainers(root) {
  (root || document).querySelectorAll('[data-explain]').forEach((h, i) => {
    if (h.dataset.explainReady) return;
    const key = h.dataset.explain;
    const e = EXPLAIN[key];
    if (!e) return;
    h.dataset.explainReady = '1';
    const id = `xp-${key}-${i}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'xp-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id);
    btn.innerHTML = '<span aria-hidden="true">?</span><span class="sr-only">Vysvětlit</span>';
    btn.title = 'Co to znamená?';
    const panel = document.createElement('div');
    panel.id = id;
    panel.className = 'xp-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <p><strong>Co ukazuje:</strong> ${e.what}</p>
      <p><strong>Jak číst:</strong> ${e.read}</p>
      <p><strong>Co si odnést:</strong> ${e.take}</p>`;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.hidden = open;
    });
    h.appendChild(btn);
    h.insertAdjacentElement('afterend', panel);
  });
}
