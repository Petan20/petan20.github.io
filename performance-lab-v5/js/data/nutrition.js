// Performance Lab · Výživa: bílkoviny, trojpoměr, tipy, GI, kofein, doplňky, jídelníčky
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

// ============================================================================
// VÝŽIVA – ODBORNÁ DATA
// Zdroj: I. Kinkorová, Aplikovaná výživa (FTVS UK); WHO; Vilikus a kol. (2013)
// ============================================================================

// Doporučený příjem bílkovin (g/kg/den) podle typu populace
const PROTEIN_GROUPS = {
  sedentary:      { label: 'Bez pravidelného tréninku (dospělý)', range: [0.8, 1.0] },
  recreational:   { label: 'Rekreační sportovec (30 min 4–5× týdně)', range: [0.8, 1.0] },
  enduranceMid:   { label: 'Vytrvalec – střední intenzita', range: [1.2, 1.2] },
  enduranceHigh:  { label: 'Vytrvalec – velký objem tréninku', range: [1.6, 1.6] },
  strengthNovice: { label: 'Silové disciplíny – začátečník / nabírání svalů', range: [1.5, 1.7] },
  // Původně 1,0–1,2 g/kg; upraveno na 1,2–1,6 podle ACSM/AND/DC (2016) a ISSN (2017),
  // které pro pravidelně trénující uvádějí spodní hranici 1,2 g/kg.
  strengthSteady: { label: 'Silové disciplíny – udržení dosažené úrovně', range: [1.2, 1.6] },
  teen:           { label: 'Dospívající sportovec v růstovém spurtu', range: [1.5, 1.5] }
};

// Trojpoměr energie ze sacharidů, tuků a bílkovin
const MACRO_RATIOS = {
  general:      { label: 'Běžná populace (S 55–65 %, T 20–30 %, B 10–15 %)', fat: 0.27, s: [55, 65], t: [20, 30], b: [10, 15] },
  sportBase:    { label: 'Sport – základní, dlouhodobá výkonnost (S 60 %, T 25 %, B 15 %)', fat: 0.25, s: [58, 62], t: [23, 27], b: [13, 17] },
  sportIntense: { label: 'Sport – intenzivní, krátkodobá výkonnost (S 70–75 %, T 15–20 %, B 10–12 %)', fat: 0.18, s: [70, 75], t: [15, 20], b: [10, 12] },
  lowerCarb:    { label: 'Snížené sacharidy – inzulinová rezistence, PCOS, ztučnělá játra (S 40–45 %, T 30–35 %, B 20–25 %)', fat: 0.33, s: [40, 45], t: [30, 35], b: [20, 25] }
};

// Kategorie BMI pro dospělé (WHO)
const BMI_CLASSES = [
  [18.5, 'Podváha', 'bg-amber-100 text-amber-800'],
  [25, 'Normální rozmezí', 'bg-emerald-100 text-emerald-800'],
  [30, 'Nadváha', 'bg-amber-100 text-amber-800'],
  [35, 'Obezita 1. stupně', 'bg-rose-100 text-rose-800'],
  [40, 'Obezita 2. stupně', 'bg-rose-100 text-rose-800'],
  [Infinity, 'Obezita 3. stupně', 'bg-rose-100 text-rose-800']
];

// Výživové zásady podle zdravotního profilu
const NUTRI_TIPS = {
  standard: {
    subtitle: 'Obecná doporučení pro dospělou populaci',
    tips: [
      'Denně 600 g zeleniny a ovoce v poměru zhruba 2 : 1, včetně tepelně upravené zeleniny.',
      'Bílou mouku nahrazujte celozrnnou a preferujte potraviny s GI pod 70 (luštěniny, celozrnné výrobky, těstoviny).',
      'Častěji ryby, hlavně tučné mořské (omega-3). Méně tučného masa, uzenin a jemného pečiva.',
      'Živočišné tuky nahrazujte olivovým a řepkovým olejem. Poměr omega-3 : omega-6 má být 1 : 3–5.',
      'Rostlinné a živočišné bílkoviny v poměru zhruba 2 : 1. Luštěniny jsou levný zdroj bílkovin i vlákniny.'
    ]
  },
  hormonal: {
    female: {
      subtitle: 'Menopauza: ochrana kostí, srdce a svalové hmoty',
      tips: [
        'Vápník 1 000–1 500 mg denně: jogurty, tvaroh, sýry, mák, sardinky, brokolice, mandle.',
        'Vitamín D z ryb, masa a vajec; vitamín K ze zelené listové zeleniny a rostlinných olejů (podporuje tvorbu kostní bílkoviny osteokalcinu).',
        'Špenát a rybíz (šťavelany) a pečivo s polyfosfáty snižují vstřebávání vápníku, nejezte je současně s hlavním zdrojem vápníku.',
        'Fytoestrogeny ze sóji a lněného semínka mohou zmírnit potíže v klimakteriu.',
        'Omezte alkohol, kofein a kyselinotvorné potraviny (uzeniny, sladkosti, instantní výrobky, kolové nápoje).',
        'Pijte i bez pocitu žízně, přibližně 30 ml na kg hmotnosti denně.'
      ]
    },
    male: {
      subtitle: 'Věk 50+: kvalitní bílkoviny, méně energie, více živin',
      tips: [
        'S věkem ubývá svalů až o 40 % a přibývá tuku. Energii snižte podle aktivity, ale kvalitní bílkoviny nevynechávejte.',
        'Sacharidy 50–60 % energie, hlavně s nízkým GI: celozrnný chléb, luštěniny, těstoviny, jablka.',
        'Tuky 25–30 % energie s důrazem na ryby (omega-3 působí protizánětlivě a chrání cévy).',
        'Hlídejte zinek, vápník, vitamín D, B12, kyselinu listovou a draslík.',
        'Pijte přibližně 30 ml na kg hmotnosti denně (asi 2 l), pocit žízně s věkem slábne.',
        'Omezte sůl a alkohol, při nemocech srdce nebo cukrovce upravte stravu s lékařem.'
      ]
    }
  },
  bone: {
    subtitle: 'Osteopenie a osteoporóza: výživa pro pevné kosti',
    tips: [
      'Vápník 1 000–1 500 mg denně: mléčné výrobky (jogurty, tvaroh, sýr), mák, sója, sardinky, brokolice.',
      'Vitamín D z masa a ryb, vitamín K ze zelené listové zeleniny a olejů (sójový, olivový, řepkový).',
      'Dostatek bílkovin je pro kost stejně důležitý jako vápník; tvoří její pružnou vnitřní síť.',
      'Šťavelany (špenát, rybíz) a polyfosfáty (pečivo) omezují vstřebávání vápníku; jezte je s rozumem.',
      'Omezte alkohol, kofein a kyselinotvorné potraviny (uzeniny, sladkosti, instantní výrobky, kola).'
    ]
  },
  asthma: {
    subtitle: 'Astma: pestrá strava a dostatek tekutin',
    tips: [
      'Platí obecná doporučení: 600 g zeleniny a ovoce denně, ryby, celozrnné výrobky, rostlinné oleje.',
      'Antioxidanty z potravy (vitamíny A, C, E, karotenoidy, flavonoidy) najdete v barevné zelenině, ovoci, ořeších a olejích.',
      'Omega-3 mastné kyseliny z tučných ryb mají protizánětlivý účinek.',
      'Pokud máte zároveň potravinovou alergii, vyřaďte jen alergeny prokázané alergologem.',
      'Před tréninkem a během něj pijte průběžně; suché dýchací cesty zhoršují zátěžové astma.'
    ]
  },
  stroke: {
    subtitle: 'Po CMP: zásady pro srdce a cévy',
    tips: [
      'Tuky nejvýše 30 % energie, omezte nasycené tuky (tučné maso, uzeniny, tučné mléčné výrobky).',
      'Zvyšte nenasycené tuky a omega-3: tučné mořské ryby, olivový a řepkový olej, ořechy.',
      'Sůl omezte alespoň na 6 g denně (2,4 g sodíku): nedosolujte, vynechte polévkové koření, bujóny a konzervy.',
      'Vláknina 30 g denně a antioxidanty (vitamíny A, C, E, zinek, selen) ze zeleniny, ovoce a celozrnných výrobků.',
      'Vitamíny B6, B12 a kyselina listová pomáhají udržet nízký homocystein, rizikový faktor pro cévy.',
      'Alkohol co nejvíce omezte. Při nadváze snižte energetický příjem.'
    ]
  },
  pectus: {
    subtitle: 'Pectus excavatum: výživa pro regeneraci a posturální svaly',
    tips: [
      'Výživa sama tvar hrudníku nezmění, podpoří ale regeneraci po posilování zad a dýchacích svalů.',
      'Dostatek kvalitních bílkovin rozložených do 4–5 jídel denně.',
      'Vitamín C a bílkoviny jsou potřeba pro tvorbu kolagenu v chrupavkách a vazech.',
      'Platí obecná doporučení: zelenina a ovoce 600 g denně, celozrnné výrobky, ryby, rostlinné oleje.'
    ]
  }
};

// Poznámky k dietním omezením
const DIET_NOTES = {
  lactose: '<strong>Bez laktózy:</strong> kysané mléčné výrobky a zralé sýry mají laktózu z velké části přeměněnou na kyselinu mléčnou a bývají lépe snášeny. Existují i bezlaktózové výrobky (např. značení „Minus L“) a doplňky s enzymem laktázou. Pozor na skrytou laktózu v sušenkách, oplatkách a proteinových výrobcích. Vápník doplníte i z máku, sóji, sardinek, brokolice a mandlí.',
  gluten: '<strong>Bez lepku:</strong> lepek obsahuje pšenice (i špalda), žito, ječmen a oves. Přirozeně bezlepkové jsou brambory, rýže, kukuřice, pohanka, jáhly, amarant, quinoa, luštěniny, maso, vejce, ovoce a zelenina. Lepek se skrývá v uzeninách, instantních polévkách, omáčkách, pivu a modifikovaných škrobech (E 1400–1451). Výrobek označený „bez lepku“ smí mít nejvýše 20 mg lepku na kg.',
  veg: '<strong>Vegetarián:</strong> hlídejte vitamín B12, vitamín D, železo, zinek a vápník. Rostlinné bílkoviny kombinujte (luštěniny s obilovinami), nejhodnotnější je sója. Lakto-ovo vegetariánská strava (s mlékem a vejci) pokryje potřeby dospělého sportovce snáze než veganská.'
};

// Glykemický index a nálož vybraných potravin (na 100 g)
const GI_FOODS = [
  ['Brokolice', 3.0, 10, 0.3],
  ['Sýr Eidam 30 %', 1.5, 5, 0.1],
  ['Mléko polotučné', 4.7, 30, 1.4],
  ['Meloun červený', 4.5, 70, 3.2],
  ['Čočka vařená', 17.2, 30, 5.2],
  ['Mrkev vařená', 9.0, 80, 7.2],
  ['Těstoviny vařené', 25.0, 50, 12.5],
  ['Banán', 23.0, 60, 13.8],
  ['Rýže bílá vařená', 26.0, 65, 16.9],
  ['Čokoláda mléčná', 52.0, 45, 23.4],
  ['Chléb konzumní', 46.2, 70, 32.3],
  ['Buchty povidlové', 64.0, 60, 38.4],
  ['Tyčinka müsli', 65.0, 60, 39.0]
];

// Obsah kofeinu v nápojích
const CAFFEINE = [
  ['Espresso 30 ml', '75 mg'],
  ['Instantní káva 140 ml', '40–108 mg'],
  ['Překapávaná káva 140 ml', '110–165 mg'],
  ['Káva bez kofeinu 140 ml', '2–5 mg'],
  ['Černý čaj 200 ml', '40 mg'],
  ['Zelený čaj 200 ml', '30 mg'],
  ['Kolový nápoj 300 ml', '35 mg'],
  ['Kofola 300 ml', '30 mg'],
  ['Energetický nápoj 230 ml', '80 mg'],
  ['Horká čokoláda 200 ml', '15 mg'],
  ['Čokoláda 50 g', '10–20 mg']
];

const DRINK_TYPES = [
  ['Hypotonický', 'do 5 g sacharidů / 100 ml', 'Řidší než tělní tekutiny, vstřebá se nejrychleji. Zátěž do 60 min a pití po výkonu.'],
  ['Izotonický', '6–10 g sacharidů / 100 ml', 'Stejná koncentrace jako tělní tekutiny. Doplní vodu i energii při zátěži nad 60 min.'],
  ['Hypertonický', 'nad 10 g sacharidů / 100 ml', 'Hlavně energie, vodu doplňuje pomalu. Spíš po výkonu k doplnění glykogenu.']
];

const SUPPLEMENTS = [
  ['A', 'Vhodné v konkrétních situacích ve sportu', 'Sportovní nápoje, gely a tyčinky, tekutá strava, multivitamíny a minerály, probiotika (podpora imunity)', 'bg-emerald-50 border-emerald-200 text-emerald-950', 'bg-emerald-600'],
  ['B', 'Pravděpodobně vhodné, účinek není plně potvrzen', 'Antioxidanty, probiotika (podpora imunity)', 'bg-blue-50 border-blue-200 text-blue-950', 'bg-blue-600'],
  ['C', 'Chybí důkazy o přínosu pro sportovní výkon', 'Přírodní látky, např. koenzym Q10, ženšen, cordyceps', 'bg-amber-50 border-amber-200 text-amber-950', 'bg-amber-500'],
  ['D', 'Zakázané nebo zdraví škodlivé', 'Stimulanty (např. efedrin), prohormony, Tribulus terrestris a další látky „zvyšující testosteron“', 'bg-rose-50 border-rose-200 text-rose-950', 'bg-rose-600']
];

// Jídelníčky: položka = [název, gramy, kcal na 100 g, (volitelně) gramů na kus].
// Varianty pro diety nahrazují položky podle názvu. Gramáž se nakonec přepočítá
// tak, aby jídlo odpovídalo energii, která mu z denního příjmu připadá.
const MEAL_SHARES = [
  ['Snídaně', 0.25],
  ['Dopolední svačina', 0.10],
  ['Oběd', 0.30],
  ['Odpolední svačina', 0.10],
  ['Večeře', 0.25]
];

const MEAL_SETS = [
  [
    { items: [['ovesné vločky', 60, 370], ['řecký jogurt bílý', 150, 120], ['borůvky', 100, 57], ['vlašské ořechy', 15, 654], ['lněné semínko', 10, 534]],
      swaps: { lactose: { 'řecký jogurt bílý': ['bezlaktózový bílý jogurt', 150, 75] }, gluten: { 'ovesné vločky': ['jáhlové vločky', 60, 360] } } },
    { items: [['celozrnný žitný chléb', 60, 230], ['krůtí šunka (95 % masa)', 40, 105], ['paprika', 100, 31]],
      swaps: { gluten: { 'celozrnný žitný chléb': ['bezlepkový chléb', 60, 250] }, veg: { 'krůtí šunka (95 % masa)': ['uzené tofu', 50, 150] } } },
    { items: [['kuřecí prsa', 130, 110], ['jasmínová rýže (syrová)', 80, 350], ['brokolice', 200, 34], ['olivový olej', 10, 884]],
      swaps: { veg: { 'kuřecí prsa': ['tofu přírodní', 150, 120] } } },
    { items: [['tvaroh polotučný', 125, 105], ['banán', 120, 89], ['hořká čokoláda 80 %', 10, 600]],
      swaps: { lactose: { 'tvaroh polotučný': ['bezlaktózový tvaroh', 125, 105] } } },
    { items: [['losos', 120, 200], ['brambory', 250, 77], ['listový salát', 80, 15], ['dýňový olej', 5, 884]],
      swaps: { veg: { 'losos': ['tempeh', 120, 195] } } }
  ],
  [
    { items: [['vejce', 165, 155, 55], ['máslo', 5, 740], ['kváskový chléb', 70, 240], ['avokádo', 50, 160], ['cherry rajčata', 100, 18]],
      swaps: { lactose: { 'máslo': ['řepkový olej', 5, 884] }, gluten: { 'kváskový chléb': ['bezlepkový chléb', 70, 250] } } },
    { items: [['kefírové mléko', 250, 50], ['jablko', 150, 52], ['mandle', 15, 579]],
      swaps: { lactose: { 'kefírové mléko': ['bezlaktózový kefír', 250, 50] } } },
    { items: [['hovězí zadní (syrové)', 130, 120], ['pohanka (syrová)', 80, 343], ['kořenová zelenina', 100, 35], ['okurkový salát', 150, 15], ['řepkový olej', 8, 884]],
      swaps: { veg: { 'hovězí zadní (syrové)': ['červená čočka (syrová)', 60, 340] } } },
    { items: [['cottage sýr', 150, 100], ['rýžové chlebíčky', 20, 380], ['ředkvičky', 80, 16]],
      swaps: { lactose: { 'cottage sýr': ['bezlaktózový tvaroh', 150, 105] } } },
    { items: [['filet z tresky', 160, 80], ['batáty', 250, 86], ['špenát', 150, 23], ['olivový olej', 10, 884]],
      swaps: { veg: { 'filet z tresky': ['vejce', 110, 155, 55] } } }
  ],
  [
    { items: [['tvaroh polotučný', 100, 105], ['ovesné vločky', 40, 370], ['vejce', 55, 155, 55], ['maliny', 100, 52], ['mandlové máslo', 10, 614]],
      swaps: { lactose: { 'tvaroh polotučný': ['bezlaktózový tvaroh', 100, 105] }, gluten: { 'ovesné vločky': ['pohankové vločky', 40, 345] } } },
    { items: [['hummus', 60, 170], ['mrkev a okurka', 150, 28], ['knäckebrot', 20, 340]],
      swaps: { gluten: { 'knäckebrot': ['rýžové chlebíčky', 20, 380] } } },
    { items: [['krůtí prsa', 130, 105], ['celozrnné těstoviny (suché)', 80, 350], ['rajčatová omáčka (passata)', 150, 30], ['parmazán', 10, 400]],
      swaps: { lactose: { 'parmazán': ['dýňová semínka', 10, 560] }, gluten: { 'celozrnné těstoviny (suché)': ['rýžové těstoviny (suché)', 80, 360] }, veg: { 'krůtí prsa': ['tempeh', 120, 195] } } },
    { items: [['bílý jogurt 3 %', 150, 65], ['chia semínka', 10, 486], ['kiwi', 100, 61]],
      swaps: { lactose: { 'bílý jogurt 3 %': ['sójový jogurt', 150, 55] } } },
    { items: [['tofu přírodní', 150, 120], ['zelenina na wok', 200, 30], ['rýžové nudle (suché)', 60, 360], ['sezam', 5, 573], ['řepkový olej', 8, 884]],
      swaps: {} }
  ]
];
