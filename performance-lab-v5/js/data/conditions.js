// Performance Lab · Zdravotní skupiny: jak trénovat, čemu se vyhnout, limity zátěže, zdroje
// Klasický skript. Načítá se PO data/profiles.js, data/nutrition.js a data/sports.js,
// protože doplňuje PROFILES, NUTRI_TIPS a EX_RULES o nové skupiny.

// ============================================================================
// VLASTNOSTI CVIKŮ (podle nich se určuje vhodnost pro zdravotní skupiny)
// impactHigh = tvrdé dopady, impact = odrazy, sprint, cod = změny směru,
// heavy = těžká zátěž svádějící k zádrži dechu, flexLoad = předklon se zátěží / švihem,
// flex = hluboký předklon bez zátěže, rotLoad = rotace se zátěží, supine = leh na zádech,
// coreHigh = vysoký nitrobřišní tlak, overhead = paže nad hlavou, hang = vis,
// hiit = vysoká intenzita, threshold = prahová intenzita, run = běh,
// balance = náročná rovnováha, endRange = krajní rozsahy, eccMax = maximální brzdění,
// kneeDeep = hluboký ohyb kolen, water = bazén, floor = přechody na zem
// ============================================================================
const EX_FLAGS = {
  // Silový pilíř
  'Zadní dřep s velkou činkou': ['heavy', 'kneeDeep'],
  'Čelní dřep (Front Squat)': ['heavy', 'kneeDeep'],
  'Goblet dřep s jednoručkou / KB': [],
  'Bulharský dělený dřep': ['balance', 'kneeDeep'],
  'Výstupy na bednu se zátěží': ['balance'],
  'Rumunský mrtvý tah (RDL)': ['heavy', 'flexLoad'],
  'Mrtvý tah s Trap Barem': ['heavy'],
  'Hip Thrust s osou / jednoručkou': ['supine'],
  'Nordic Hamstring Curl': ['eccMax', 'floor'],
  'Bench press s činkou / jednoručkami': ['heavy', 'supine'],
  'Kliky na bradlech / se zátěží': ['coreHigh', 'endRange'],
  'Tlak nad hlavu ve stoji (OHP)': ['heavy', 'overhead'],
  'Tlak jednoručkou v polokleku': ['overhead'],
  'Shyby / Stahování horní kladky': ['hang', 'overhead'],
  'Přítahy činky v předklonu': ['heavy', 'flexLoad'],
  'Přítahy jednoručky s oporou o lavici': [],
  'Face Pulls na kladce / s gumou': [],
  'Farmářská chůze (Farmer’s Walk)': [],
  'Pallof Press (antirotační tlak)': [],
  'Výpony na lýtka ve stoji i vsedě': [],
  // Výbušný pilíř
  'Výskok z dřepu (Squat Jump)': ['impact'],
  'Výskok s protipohybem (CMJ)': ['impact'],
  'Seskok a okamžitý výskok (Drop Jump)': ['impactHigh', 'eccMax'],
  'Výskok na bednu (Box Jump)': ['impact'],
  'Skok daleký z místa (Broad Jump)': ['impactHigh'],
  'Jednonožní poskoky vpřed (Bounds)': ['impactHigh', 'balance'],
  'Kotníkové odrazy na místě (Pogo Jumps)': ['impact'],
  'Výpady s přeskokem (Split Jumps)': ['impactHigh', 'kneeDeep'],
  'Bruslařské skoky do stran (Skater Jumps)': ['impactHigh', 'cod', 'balance'],
  'Švih s kettlebellem (KB Swing)': ['flexLoad'],
  'Silové přemístění ze visu (Hang Clean)': ['heavy', 'flexLoad'],
  'Výskok s Trap Barem (Trap Bar Jump)': ['impact', 'heavy'],
  'Výrazový tlak (Push Press)': ['heavy', 'overhead'],
  'Odhod medicinbalu od hrudníku': [],
  'Odhod medicinbalu přes hlavu vzad': ['flexLoad', 'overhead'],
  'Rotační hod medicinbalem o zeď': ['rotLoad'],
  'Úder medicinbalem o zem (Slam)': ['flexLoad', 'coreHigh', 'overhead'],
  'Plyometrické kliky s odrazem': ['impactHigh', 'coreHigh'],
  'Výbušné přítahy na TRX / kruzích': ['hang'],
  'Švihadlo – rychlá frekvence / dvojšvihy': ['impact', 'hiit'],
  // Vytrvalostní pilíř
  'Souvislý běh v zóně I2': ['run'],
  'Tempový běh na prahu ANP (I3)': ['run', 'threshold'],
  'Norwegian 4×4 min HIIT (I4)': ['run', 'hiit'],
  'Krátké intervaly 30/30 s (Billat)': ['run', 'hiit'],
  'Opakované sprinty (RSA 6×40 m)': ['sprint', 'hiit', 'impactHigh'],
  'Fartlek (hra s rychlostí v terénu)': ['run', 'threshold'],
  'Výběhy mírného kopce (60–90 s)': ['run', 'hiit'],
  'Veslařský trenažér (Concept2)': ['flexLoad'],
  'SkiErg (lyžařský trenažér)': [],
  'Assault / Air Bike (celé tělo)': ['hiit'],
  'Cyklistika v zóně I2': [],
  'Plavání (kraul / znak v I2–I3)': ['water'],
  'Chůze do kopce na pásu (10–12 %)': [],
  'Kettlebell EMOM (12–15 swingů/min)': ['flexLoad', 'hiit'],
  'Tlačení saní (Sled Push)': ['hiit', 'heavy'],
  'Tahání saní vzad (Reverse Sled)': [],
  'Švihadlo v aerobním tempu': ['impact'],
  'Kruhový trénink silové vytrvalosti': ['threshold'],
  'Nordic Walking (chůze s holemi)': [],
  'Výstupy na nízký step (Metronom)': [],
  // Agility a rychlost
  'Start na 10–20 m (akcelerace)': ['sprint'],
  'Letmý sprint na 20 m (Flying Sprint)': ['sprint'],
  'Odporovaný sprint s gumou / saněmi': ['sprint'],
  'Brzdění ze sprintu na signál': ['sprint', 'cod', 'eccMax'],
  'Pro-Agility Shuttle (5–10–5 m)': ['sprint', 'cod'],
  'T-Test (vpřed, úkroky, běh vzad)': ['sprint', 'cod'],
  'Cik-cak slalom kolem kuželů (45°)': ['sprint', 'cod'],
  'Reaktivní zrcadlení ve dvojici': ['cod'],
  'Start na signál z různých poloh': ['sprint', 'floor'],
  'Koordinační žebřík (Icky Shuffle)': ['impact'],
  'Boční úkroky s odporovou gumou': [],
  'Běžecká abeceda (A-Skip / High Knees)': ['impact'],
  'Střídavý výpad vpřed s odrazem zpět': ['impactHigh', 'kneeDeep'],
  'Chytání reaktivního míčku (Reaction Ball)': ['cod'],
  'Sprint vzad a přechod do sprintu vpřed': ['sprint', 'cod'],
  'Illinois Agility Run (slalom + rovinky)': ['sprint', 'cod', 'hiit'],
  'Únikový krok do strany (Crossover Step)': ['sprint', 'cod'],
  'Přeskoky nízkých překážek + sprint 5 m': ['impactHigh', 'sprint'],
  'W-Drill (šikmé sprinty vpřed a vzad)': ['sprint', 'cod'],
  'Herní změna směru s míčem / raketou': ['sprint', 'cod'],
  // Koordinace a mobilita
  'Stoj na jedné noze (se zavřenýma očima)': ['balance'],
  'Y-Balance dosahování nohou ve stoje': ['balance'],
  'Mrtvý brouk (Dead Bug s výdechem)': ['supine', 'floor'],
  'Bird-Dog (vzpažení a zanožení v kleku)': ['floor'],
  'Boční prkno (Side Plank)': ['coreHigh', 'floor'],
  'Turecký vztyk (Turkish Get-Up)': ['coreHigh', 'overhead', 'floor', 'balance'],
  'Největší protažení světa (WGS)': ['endRange', 'floor'],
  'Rotace hrudní páteře v lehu (Open Book)': ['floor'],
  'Extenze hrudní páteře přes pěnový válec': ['supine', 'floor'],
  'Kočka–kráva se segmentální kontrolou': ['flex', 'floor'],
  'PNF protažení hamstringů (6 s + 15 s)': ['endRange', 'flex'],
  'PNF protažení prsních svalů o stěnu': ['endRange'],
  '90/90 přechody v kyčlích v sedu': ['endRange', 'floor'],
  'Mobilizace kotníku (Knee-to-Wall)': [],
  'Protažení flexorů kyčle v kleku': ['floor'],
  'Klouzání paží po zdi (Wall Slides)': [],
  'Bosá chůze po čáře (Tandem Walk)': [],
  'Házení míčkem o zeď (střídání rukou)': [],
  'Křížové lezení (Bear Crawl)': ['coreHigh', 'floor'],
  'Hluboký odpočinkový dřep s dechem': ['kneeDeep', 'endRange']
};

const FLAG_LABEL = {
  impactHigh: 'tvrdé dopady', impact: 'odrazy a dopady', sprint: 'sprint', cod: 'prudké změny směru',
  heavy: 'těžká zátěž (riziko zádrže dechu)', flexLoad: 'předklon se zátěží nebo švihem', flex: 'hluboký předklon páteře',
  rotLoad: 'rotace trupu se zátěží', supine: 'leh na zádech', coreHigh: 'vysoký tlak v břiše', overhead: 'paže nad hlavou',
  hang: 'vis na rukou', hiit: 'vysoká intenzita', threshold: 'prahová intenzita', run: 'běh', balance: 'náročná rovnováha',
  endRange: 'krajní rozsahy kloubů', eccMax: 'maximální brzdivá síla', kneeDeep: 'hluboký ohyb kolen', water: 'bazén',
  floor: 'přechody na zem a zpět'
};

// ============================================================================
// SKUPINY V HORNÍM VÝBĚRU (pořadí a rozdělení)
// ============================================================================
const CONDITION_GROUPS = [
  ['Bez omezení', ['standard', 'sedentary']],
  ['Ženy a životní etapy', ['hormonal', 'pregnancy', 'postpartum', 'pcos']],
  ['Metabolismus a hmotnost', ['obesity', 'diabetes', 'liver', 'thyroid', 'kidney']],
  ['Srdce, cévy a mozek', ['hypertension', 'cardiac', 'stroke']],
  ['Kosti, klouby a záda', ['bone', 'sarcopenia', 'oa', 'backpain', 'scoliosis', 'hypermobility', 'pectus']],
  ['Dýchání', ['asthma', 'copd', 'longcovid']],
  ['Psychika a onkologie', ['mental', 'oncology']]
];

// ============================================================================
// INFORMACE O TRÉNINKU PRO KAŽDOU SKUPINU
// caps: maxPct = strop % 1RM, maxRPE = strop námahy (0–10), hrrCap = strop % tepové rezervy,
//       useRPE = řídit se pocitem námahy místo tepu, noValsalva = nezadržovat dech,
//       restMult = delší pauzy, setsMult = menší objem, pacing = šetření energie (long covid)
// rules: no = nevhodné vlastnosti cviku, mod = jen s úpravou
// planSwap: náhrada jednotek v týdenním plánu
// ============================================================================
const CONDITION_INFO = {
  standard: {
    short: 'Bez omezení', label: 'Sportovec / zdravý dospělý',
    train: {
      how: ['Kombinujte všech 5 pilířů podle sportu a cíle.', 'Po náročném silovém tréninku dopřejte téže partii 48 hodin.', 'Zátěž zvyšujte postupně, o 2–10 % týdně, a každý 3.–4. týden odlehčete.'],
      good: ['Vícekloubové silové cviky', 'Intervaly I4–I5 1–2× týdně', 'Plyometrie po zvládnutí techniky'],
      avoid: ['Prudké navýšení objemu (ACWR nad 1,5)', 'Těžký trénink při nemoci s horečkou'],
      doctor: 'Před začátkem náročného tréninku je vhodná preventivní prohlídka, u závodních sportovců sportovní lékař.'
    },
    redFlags: [],
    caps: {},
    rules: { no: [], mod: [] },
    sources: ['WHO (2020). Guidelines on physical activity and sedentary behaviour.', 'ACSM (2009). Progression models in resistance training for healthy adults. Med Sci Sports Exerc 41(3).']
  },

  sedentary: {
    short: 'Sedavé zaměstnání', label: 'Sedavé zaměstnání / kancelář',
    train: {
      how: ['Přerušujte sezení každých 30–60 minut na 2–3 minuty pohybu (viz Pohybové svačinky).', 'Cílem je 150–300 minut svižné chůze nebo podobné aktivity týdně a síla 2× týdně (WHO 2020).', 'Posilujte zadní řetězec (hýždě, záda) a protahujte flexory kyčle a prsní svaly, které sezením zkracují.'],
      good: ['Chůze, kolo, schody', 'Hip Thrust, Face Pulls, přítahy', 'Protažení flexorů kyčle, Wall Slides, Open Book'],
      avoid: ['Dlouhé bloky sezení bez přestávky', 'Začátek rovnou vysokou intenzitou bez postupné přípravy'],
      doctor: 'Bez zdravotních potíží konzultace není nutná. Při bolestech zad, nadváze nebo vysokém tlaku se poraďte s lékařem.'
    },
    redFlags: [],
    caps: {},
    rules: { no: [], mod: [] },
    profile: {
      desc: 'Dlouhé sezení zpomaluje metabolismus cukrů a tuků, zkracuje flexory kyčle a oslabuje hýždě a záda. Pravidelný trénink to zčásti vyváží, ale přerušování sezení během dne má vlastní přínos.',
      layman: '💡 V praxi: Nejdůležitější je hýbat se často, ne jen jednou denně. Každou půlhodinu až hodinu vstaňte, 2–3 minuty choďte nebo udělejte pár dřepů. K tomu 2× týdně posilujte celé tělo.',
      exNote: '🪑 Pro sedavou práci: přidejte cviky na hýždě a mezilopatkové svaly a protahujte přední stranu kyčlí a hrudník.',
      badges: ['Přerušovat sezení', 'Zadní řetězec', 'Mobilita kyčlí a hrudníku', 'WHO 150–300 min'],
      protMult: 1.0, recMult: 1.0,
      micros: [
        ['Vitamín D3', 'podle hladiny v krvi, často 1000–2000 IU v zimě', 'Lidé pracující uvnitř mívají nízkou hladinu, hlavně od října do března'],
        ['Hořčík ze stravy', '300–400 mg/den', 'Ořechy, semínka, luštěniny, celozrnné výrobky'],
        ['Omega-3 (EPA + DHA)', '250–500 mg/den ze stravy', '1–2 porce tučné ryby týdně']
      ],
      tips: { subtitle: 'Sedavá práce: méně energie, více vlákniny a pravidelnost', tips: [
        'Výdej energie je nižší, proto hlídejte velikost porcí a tekuté kalorie (slazené nápoje, káva se sirupem).',
        'Vláknina alespoň 30 g denně (luštěniny, zelenina, celozrnné výrobky) zpomalí vstřebávání cukrů.',
        'Krátká procházka 10–15 minut po jídle snižuje vzestup cukru v krvi.',
        'Mějte na stole vodu, pocit žízně se při soustředění snadno přehlédne.',
        'Svačiny plánujte předem (ovoce, jogurt, ořechy), ať nekončíte u automatu.'
      ] }
    },
    sources: ['WHO (2020). Guidelines on physical activity and sedentary behaviour.', 'Dunstan, D. W. a kol. (2012). Breaking up prolonged sitting reduces postprandial glucose and insulin responses. Diabetes Care 35(5).', 'Stamatakis, E. a kol. (2022). Association of wearable device-measured vigorous intermittent lifestyle physical activity with mortality. Nat Med 28.']
  },

  hormonal: {
    short: 'Menopauza / 50+', label: 'Menopauza / andropauza (50+)',
    train: {
      how: ['Silový trénink 2–3× týdně s vyšší zátěží (6–10 opakování, 2–3 opakování v záloze).', 'Šetrné odrazy (Box Jump, Pogo) pro kosti, pokud nemáte osteoporózu s prodělanou zlomeninou.', 'Delší rozcvičení a pauza 48–72 h mezi těžkými dny.'],
      good: ['Dřepy, mrtvý tah s Trap Barem, tlaky, tahy', 'Farmářská chůze', 'Box Jump, Pogo (šetrně)', 'Rovnováha'],
      avoid: ['Jen lehké kardio bez síly', 'Drop Jump a vzpírání bez zvládnuté techniky'],
      doctor: 'Při nevysvětlitelném krvácení, bolesti na hrudi nebo prodělané zlomenině se poraďte s lékařem. Denzitometrie (DXA) pomůže určit bezpečnou zátěž.'
    },
    redFlags: ['Bolest na hrudi nebo dušnost nepřiměřená zátěži'],
    caps: { restMult: 1.1 },
    rules: { no: [], mod: [] },
    sources: ['Watson, S. L. a kol. (2018). High-intensity resistance and impact training improves bone mineral density in postmenopausal women with osteopenia (LIFTMOR). J Bone Miner Res 33(2).', 'The Menopause Society (2022). Hormone therapy position statement.']
  },

  pregnancy: {
    short: 'Těhotenství', label: 'Těhotenství', sex: 'female',
    train: {
      how: ['Bez komplikací se doporučuje alespoň 150 minut středně intenzivního pohybu týdně, rozložených do 3 a více dnů.', 'Řiďte se testem řeči: při cvičení byste měla zvládnout mluvit v celých větách (námaha asi 5–7 z 10).', 'Silový trénink 2–3× týdně s plynulým dýcháním, bez zadržování dechu. Po 1. trimestru omezte delší leh na zádech.', 'Každý den cvičte pánevní dno (Kegelovy cviky).'],
      good: ['Chůze, rotoped, plavání', 'Goblet dřep, výstupy na bednu, přítahy, Pallof Press', 'Cvičení pánevního dna', 'Prenatální jóga'],
      avoid: ['Kontaktní sporty a sporty s rizikem pádu (lyže, jízda na koni)', 'Skoky a sprinty se změnou směru', 'Cvičení v horku a do vyčerpání', 'Potápění'],
      doctor: 'Před začátkem cvičení se poraďte s gynekologem. Kontraindikace: placenta praevia po 26. týdnu, riziko předčasného porodu, preeklampsie, závažná srdeční či plicní choroba.'
    },
    redFlags: ['Krvácení z pochvy nebo únik plodové vody', 'Pravidelné bolestivé stahy', 'Dušnost před začátkem zátěže, bolest na hrudi', 'Bolest hlavy, závrať, slabost', 'Bolest nebo otok lýtka', 'Méně pohybů plodu'],
    caps: { maxPct: 70, maxRPE: 7, useRPE: true, noValsalva: true, setsMult: 0.85, restMult: 1.15 },
    rules: { no: ['impactHigh', 'impact', 'sprint', 'cod', 'eccMax'], mod: ['supine', 'heavy', 'hiit', 'flexLoad', 'coreHigh', 'balance', 'hang', 'threshold', 'run'], why: 'V těhotenství se mění těžiště a uvolňují vazy, roste riziko pádu a tlak na pánevní dno.' },
    planSwap: { S_MAX: 'S_GEN', S_HYP: 'S_GEN', E4: 'E1', E5: 'E1', RSA: 'E1', X: 'C', A: 'C', MATCH: 'E1', RACE: 'E1' },
    planNote: 'Těhotenství: intenzita podle testu řeči, bez skoků, sprintů a kontaktu.',
    profile: {
      desc: 'Pravidelný pohyb v těhotenství snižuje riziko těhotenské cukrovky, preeklampsie a nadměrného přibírání a nezvyšuje riziko potratu ani předčasného porodu (kanadské doporučení 2019).',
      layman: '💡 V praxi: Pokud vám lékař pohyb nezakázal, hýbejte se většinu dnů v týdnu. Intenzitu hlídejte tak, abyste při cvičení zvládla mluvit. Vynechte skoky, kontaktní sporty a dlouhé ležení na zádech.',
      exNote: '🤰 Těhotenství: bez skoků a sprintů, plynulé dýchání, test řeči. Leh na zádech nahraďte pozicí v náklonu nebo na boku.',
      badges: ['Test řeči (5–7/10)', 'Bez skoků a kontaktu', 'Pánevní dno denně', 'Kyselina listová + jód'],
      protMult: 1.0, recMult: 1.15,
      micros: [
        ['Kyselina listová', '400 µg/den', 'Ideálně už před početím a v 1. trimestru (prevence vad neurální trubice)'],
        ['Jód', '150–250 µg/den (dle lékaře)', 'Vývoj mozku a štítné žlázy dítěte; jodizovaná sůl, mléčné výrobky, ryby'],
        ['Železo a vitamín D', 'podle krevních testů', 'Doplněk jen podle hladin a doporučení gynekologa']
      ],
      tips: { subtitle: 'Těhotenství: kvalita místo „jídla za dva“', tips: [
        'V 1. trimestru energie navíc není potřeba, ve 2. a 3. trimestru asi +250–300 kcal denně (přepínač Zvláštní období ve Výživě).',
        'Bílkoviny alespoň 1,1–1,3 g/kg, hlavně z mléčných výrobků, vajec, luštěnin, ryb a libového masa.',
        'Vyhněte se syrovému masu, syrovým vejcím, nepasterizovaným sýrům a velkým dravým rybám (rtuť).',
        'Kofein nejvýše 200 mg denně (asi 2 šálky kávy), alkohol vůbec.',
        'Tučné ryby 1–2× týdně (losos, sardinky) jako zdroj DHA.'
      ] }
    },
    sources: ['Mottola, M. F. a kol. (2018). 2019 Canadian guideline for physical activity throughout pregnancy. Br J Sports Med 52(21).', 'ACOG (2020). Physical activity and exercise during pregnancy and the postpartum period. Committee Opinion 804.']
  },

  postpartum: {
    short: 'Po porodu / diastáza', label: 'Po porodu (vč. diastázy)', sex: 'female',
    train: {
      how: ['Prvních 6 týdnů: chůze, dech do žeber a jemné cvičení pánevního dna a hlubokého stabilizačního systému.', 'Po kontrole u gynekologa (asi 6 týdnů) postupně silový trénink s vydechnutím při námaze.', 'Běh a skoky nejdříve kolem 12. týdne a až po testu: 30 s poskoků, 10 výpadů, 1 min běhu na místě bez úniku moči, tlaku v pánvi a bolesti.', 'Při diastáze (rozestup přímých svalů břišních) volte cviky, při kterých se břicho nevyklenuje do „hřebene“.'],
      good: ['Chůze s kočárkem', 'Mrtvý brouk s výdechem, Bird-Dog, Pallof Press', 'Goblet dřep, Hip Thrust, přítahy', 'Cvičení pánevního dna'],
      avoid: ['Sedy-lehy a zkracovačky v prvních měsících', 'Skoky a běh před 12. týdnem a bez testu', 'Těžká zátěž se zadržením dechu'],
      doctor: 'Fyzioterapeut se zaměřením na pánevní dno posoudí diastázu, únik moči a pocit tlaku v pánvi. Po císařském řezu se řiďte pokyny lékaře.'
    },
    redFlags: ['Únik moči nebo pocit tlaku či „bouličky“ v pochvě', 'Obnovené nebo silné krvácení', 'Bolest v jizvě, horečka', 'Vyklenování břicha do hřebene při cvicích'],
    caps: { maxPct: 70, maxRPE: 7, noValsalva: true, setsMult: 0.85, restMult: 1.15 },
    rules: { no: ['impactHigh'], mod: ['impact', 'sprint', 'run', 'coreHigh', 'heavy', 'flexLoad', 'hiit', 'water', 'eccMax'], why: 'Po porodu se pánevní dno a břišní stěna hojí několik měsíců. Tlak a dopady se přidávají postupně.' },
    planSwap: { S_MAX: 'S_GEN', E4: 'E1', E5: 'E1', RSA: 'E1', X: 'C', A: 'C' },
    planNote: 'Po porodu: běh a skoky až po testu návratu (kolem 12. týdne).',
    profile: {
      desc: 'Po porodu se postupně obnovuje funkce pánevního dna a břišní stěny. Rozestup přímých břišních svalů (diastáza) se u většiny žen do roka zmenšuje, správně zvolené cvičení tomu pomáhá.',
      layman: '💡 V praxi: Začněte dechem, pánevním dnem a chůzí. Sílu přidávejte postupně a vydechujte při námaze. Běhat a skákat začněte až kolem 12. týdne, pokud zvládnete test bez úniku moči a bez tlaku v pánvi.',
      exNote: '👶 Po porodu: vynechte sedy-lehy, skoky a těžké zvedání se zadrženým dechem. Pozor na vyklenutí břicha do hřebene.',
      badges: ['Pánevní dno a dech', 'Postupný návrat k běhu', 'Výdech při námaze', 'Fyzioterapeut'],
      protMult: 1.0, recMult: 1.2,
      micros: [
        ['Železo', 'podle krevního obrazu', 'Po porodu bývá častá chudokrevnost'],
        ['Vitamín D', 'podle hladiny, často 1000–2000 IU', 'Důležitý zvlášť při kojení'],
        ['Jód a omega-3 (DHA)', '150–250 µg jódu; 200 mg DHA při kojení', 'Při kojení podle doporučení lékaře']
      ],
      tips: { subtitle: 'Po porodu: regenerace a případné kojení', tips: [
        'Při kojení potřebujete asi o 350–500 kcal víc (přepínač Kojení ve Výživě), hubnutí zrychlujte nejvýše o 0,5 kg týdně.',
        'Pijte k žízni, při kojení obvykle o 0,5–1 l víc.',
        'Bílkoviny 1,2–1,5 g/kg pomohou hojení a obnově svalů.',
        'Jednoduchá jídla připravená dopředu (ovesná kaše, jogurt s ovocem, luštěninové saláty) šetří čas i energii.'
      ] }
    },
    sources: ['Goom, T., Donnelly, G., Brockwell, E. (2019). Returning to running postnatal – guidelines for medical, health and fitness professionals.', 'ACOG (2020). Physical activity and exercise during pregnancy and the postpartum period. Committee Opinion 804.']
  },

  pcos: {
    short: 'PCOS', label: 'Syndrom polycystických ovarií (PCOS)', sex: 'female',
    train: {
      how: ['Kombinujte silový trénink 2–3× týdně s aerobní aktivitou 150–300 min týdně.', 'Intervaly (HIIT) i silový trénink zlepšují citlivost na inzulin.', 'Pohyb pomáhá i bez úbytku hmotnosti, nehodnoťte úspěch jen podle váhy.'],
      good: ['Silový trénink celého těla', 'Intervaly I4', 'Svižná chůze po jídle'],
      avoid: ['Extrémní diety a nadměrný objem tréninku, které mohou zhoršit cyklus'],
      doctor: 'O léčbě (metformin, hormonální antikoncepce) rozhoduje gynekolog nebo endokrinolog.'
    },
    redFlags: [],
    caps: {},
    rules: { no: [], mod: [] },
    profile: {
      desc: 'PCOS je časté hormonální onemocnění žen spojené s inzulinovou rezistencí, nepravidelným cyklem a vyšším rizikem cukrovky 2. typu.',
      layman: '💡 V praxi: Pravidelný silový trénink a intervaly zlepšují citlivost na inzulin a mohou upravit cyklus. Přínos má pohyb i tehdy, když se váha nemění.',
      exNote: '🔄 PCOS: silový trénink a intervaly jsou vhodné; pomáhají metabolismu cukrů.',
      badges: ['Síla 2–3× týdně', 'Intervaly I4', 'Citlivost na inzulin', 'Nízký GI'],
      protMult: 1.05, recMult: 1.0,
      micros: [
        ['Vitamín D', 'podle hladiny v krvi', 'Nedostatek je u PCOS častý'],
        ['Inositol (myo-inositol)', 'jen po domluvě s lékařem', 'Důkazy jsou smíšené, nejde o náhradu léčby'],
        ['Omega-3 ze stravy', '1–2 porce ryb týdně', 'Podpora metabolismu tuků']
      ],
      tips: { subtitle: 'PCOS: stabilní hladina cukru v krvi', tips: [
        'Sacharidy volte s nízkým GI a s vlákninou (luštěniny, celozrnné výrobky, zelenina), jezte je spolu s bílkovinou.',
        'Žádná konkrétní dieta není prokazatelně lepší než jiná; rozhoduje dlouhodobá udržitelnost (mezinárodní doporučení 2023).',
        'Omezte slazené nápoje a sladkosti, které nejvíc zvedají hladinu inzulinu.',
        'Při nadváze má přínos už úbytek 5 % hmotnosti.'
      ] }
    },
    sources: ['Teede, H. J. a kol. (2023). Recommendations from the 2023 International Evidence-based Guideline for the Assessment and Management of PCOS. J Clin Endocrinol Metab 108(10).']
  },

  obesity: {
    short: 'Obezita', label: 'Nadváha a obezita',
    train: {
      how: ['Začněte s pohybem šetrným ke kloubům: chůze, kolo, plavání, veslo. Postupně ke 200–300 min týdně pro udržení úbytku hmotnosti.', 'Silový trénink 2–3× týdně chrání svalovou hmotu při hubnutí.', 'Běh a skoky přidávejte až po zlepšení kondice a bez bolesti kloubů.'],
      good: ['Chůze do kopce, rotoped, plavání', 'Goblet dřep na bednu, Hip Thrust, přítahy, stahování kladky', 'Farmářská chůze'],
      avoid: ['Skoky a běh hned na začátku', 'Příliš rychlé zvyšování objemu'],
      doctor: 'Při BMI nad 35, vysokém tlaku, cukrovce nebo bolestech kloubů se před začátkem poraďte s lékařem.'
    },
    redFlags: ['Bolest na hrudi nebo dušnost nepřiměřená zátěži', 'Bolest kloubů, která trvá déle než 24 h po cvičení'],
    caps: { restMult: 1.1 },
    rules: { no: [], mod: ['impactHigh', 'impact', 'run', 'sprint', 'hang', 'floor'], why: 'Dopady zatěžují klouby násobkem tělesné hmotnosti; vis a přechody na zem bývají zpočátku obtížné.' },
    planSwap: { RSA: 'E1', X: 'S_GEN' },
    planNote: 'Obezita: vytrvalost raději na kole, chůzí nebo v bazénu; skoky až později.',
    profile: {
      desc: 'Obezita zvyšuje riziko cukrovky 2. typu, vysokého tlaku, ztučnělých jater a artrózy. Pohyb tato rizika snižuje i při malém úbytku hmotnosti.',
      layman: '💡 V praxi: Úspěch neměřte jen váhou. Kondice a síla zlepšují zdraví i bez velkého úbytku kil. Začněte chůzí nebo kolem a 2× týdně posilujte, ať při hubnutí neztrácíte svaly.',
      exNote: '⚖️ Obezita: šetrné ke kloubům, bez skoků na začátku. Shyby nahraďte stahováním kladky, dřep na bednu.',
      badges: ['Šetrné ke kloubům', 'Síla chrání svaly', '200–300 min týdně', 'Bílkoviny dle cílové váhy'],
      protMult: 1.0, recMult: 1.1,
      micros: [
        ['Vitamín D', 'podle hladiny v krvi', 'Při obezitě bývá nižší hladina'],
        ['Vláknina', '30 g a více denně', 'Sytí a zpomaluje vstřebávání cukrů'],
        ['Bílkoviny', 'dle kalkulačky (počítá se z cílové hmotnosti)', 'Ochrana svalů při energetickém deficitu']
      ],
      tips: { subtitle: 'Obezita: mírný deficit, který vydržíte', tips: [
        'Deficit asi 500 kcal denně vede k úbytku kolem 0,5 kg týdně. Rychlejší hubnutí víc bere svaly.',
        'Bílkoviny počítáme z hmotnosti odpovídající BMI 25, ne ze skutečné hmotnosti, jinak by vycházely nesmyslně vysoko.',
        'Talíř: polovina zelenina, čtvrtina bílkovina, čtvrtina příloha.',
        'Nejvíc skrytých kalorií bývá v nápojích, sladkostech a pečivu.',
        'Léky na obezitu (např. GLP-1) mají smysl jen spolu se silovým tréninkem a dostatkem bílkovin, jinak hrozí velký úbytek svalů.'
      ] }
    },
    sources: ['Donnelly, J. E. a kol. (2009). ACSM Position Stand: Appropriate physical activity intervention strategies for weight loss and prevention of weight regain. Med Sci Sports Exerc 41(2).', 'Durrer Schutz, D. a kol. (2019). European practical and patient-centred guidelines for adult obesity management in primary care. Obes Facts 12.']
  },

  diabetes: {
    short: 'Diabetes / prediabetes', label: 'Prediabetes a diabetes 2. typu',
    train: {
      how: ['Aerobní aktivita alespoň 150 min týdně, bez pauzy delší než 2 dny.', 'Silový trénink 2–3× týdně na nesouvislé dny.', 'Krátká procházka 10–15 minut po jídle snižuje vzestup cukru.', 'Při léčbě inzulinem nebo deriváty sulfonylurey si měřte glykemii před cvičením a po něm a mějte u sebe rychlý cukr.'],
      good: ['Svižná chůze po jídle', 'Silový trénink celého těla', 'Intervaly (pokud nemáte komplikace)'],
      avoid: ['Cvičení při glykemii nad 14 mmol/l s ketony v moči', 'Skoky a běh bez kontroly chodidel při neuropatii', 'Těžká zátěž se zádrží dechu při proliferativní retinopatii'],
      doctor: 'S diabetologem proberte úpravu léků a jídla kolem tréninku, kontrolu očí (retinopatie) a chodidel (neuropatie).'
    },
    redFlags: ['Třes, pocení, zmatenost (hypoglykemie): přerušte a sněžte 15–20 g rychlého cukru', 'Glykemie nad 14 mmol/l s ketony', 'Otlak nebo rána na chodidle'],
    caps: { noValsalva: true },
    rules: { no: [], mod: ['impactHigh', 'heavy'], why: 'Platí při neuropatii (necitlivá chodidla) nebo retinopatii: dopady a zádrž dechu mohou komplikace zhoršit.' },
    profile: {
      desc: 'Při inzulinové rezistenci svaly hůře přijímají cukr z krve. Každý trénink zlepšuje citlivost na inzulin na 24–72 hodin, proto je důležitá pravidelnost.',
      layman: '💡 V praxi: Hýbejte se většinu dnů v týdnu, nevynechávejte víc než 2 dny po sobě. Po jídle se projděte. Silový trénink zvětšuje svaly, které fungují jako „sklad“ na cukr.',
      exNote: '🩸 Diabetes: silový i vytrvalostní trénink jsou vhodné. Při neuropatii nebo retinopatii vynechte tvrdé dopady a zádrž dechu.',
      badges: ['Nevynechat víc než 2 dny', 'Chůze po jídle', 'Síla 2–3× týdně', 'Kontrola glykemie'],
      protMult: 1.0, recMult: 1.05,
      micros: [
        ['Vitamín B12', 'kontrola hladiny', 'Dlouhodobé užívání metforminu snižuje jeho hladinu'],
        ['Vitamín D', 'podle hladiny v krvi', 'Nedostatek je častý'],
        ['Hořčík ze stravy', '300–400 mg/den', 'Luštěniny, ořechy, celozrnné výrobky']
      ],
      tips: { subtitle: 'Diabetes 2. typu: sacharidy s rozmyslem, ne bez nich', tips: [
        'Sacharidy volte s nízkým GI a hodně vlákniny; jezte je spolu s bílkovinou a tukem, zpomalí to vzestup cukru.',
        'Snížení sacharidů (např. trojpoměr se sníženými sacharidy ve Výživě) může zlepšit glykemii, změny léků ale řešte s lékařem.',
        'Slazené nápoje a džusy vynechte úplně, ovoce jezte celé.',
        'Pravidelný rytmus jídel usnadní kontrolu cukru, zvlášť při léčbě inzulinem.',
        'Při úbytku hmotnosti o 5–10 % se často zlepší glykemie natolik, že lze snížit léky.'
      ] }
    },
    sources: ['Kanaley, J. A. a kol. (2022). Exercise/physical activity in individuals with type 2 diabetes: a consensus statement from the ACSM. Med Sci Sports Exerc 54(2).', 'Colberg, S. R. a kol. (2016). Physical activity/exercise and diabetes: a position statement of the ADA. Diabetes Care 39(11).']
  },

  liver: {
    short: 'Ztučnělá játra', label: 'Ztučnělá játra (MASLD)',
    train: {
      how: ['Aerobní aktivita 150–300 min týdně snižuje tuk v játrech i bez úbytku hmotnosti.', 'Silový trénink 2× týdně jako doplněk.', 'Pravidelnost je důležitější než intenzita.'],
      good: ['Svižná chůze, kolo, plavání', 'Intervaly I4 (pokud je kondice)', 'Silový trénink celého těla'],
      avoid: ['Alkohol', 'Slazené nápoje s fruktózou'],
      doctor: 'O stupni poškození jater (fibróza) informuje hepatolog nebo gastroenterolog.'
    },
    redFlags: ['Zežloutnutí kůže, tmavá moč, otok břicha'],
    caps: {},
    rules: { no: [], mod: [] },
    profile: {
      desc: 'Ztučnění jater spojené s metabolickou poruchou (dříve NAFLD) má asi čtvrtina dospělých. Souvisí s nadváhou, inzulinovou rezistencí a sedavým životem.',
      layman: '💡 V praxi: Pohyb snižuje tuk v játrech i tehdy, když se váha moc nehne. Cílem je 150–300 minut aktivity týdně a strava s méně cukrem a alkoholem.',
      exNote: '🫀 Ztučnělá játra: vhodné jsou všechny druhy pohybu, nejvíc pravidelná aerobní aktivita.',
      badges: ['150–300 min týdně', 'Bez alkoholu', 'Méně fruktózy', 'Úbytek 7–10 %'],
      protMult: 1.0, recMult: 1.0,
      micros: [
        ['Káva', '2–3 šálky denně (bez cukru)', 'Pozorovací studie spojují kávu s menším poškozením jater'],
        ['Omega-3 ze stravy', '1–2 porce ryb týdně', 'Mohou snížit tuk v játrech'],
        ['Vitamín E', 'jen na doporučení lékaře', 'Používá se u vybraných pacientů, ne jako běžný doplněk']
      ],
      tips: { subtitle: 'Ztučnělá játra: méně cukru a alkoholu', tips: [
        'Úbytek 7–10 % hmotnosti výrazně snižuje tuk v játrech a zánět.',
        'Středomořský styl stravy (zelenina, luštěniny, olivový olej, ryby, ořechy) má nejvíc důkazů.',
        'Vynechte slazené nápoje a džusy, fruktóza se v játrech mění na tuk nejsnáze.',
        'Alkohol omezte co nejvíc, ideálně úplně.'
      ] }
    },
    sources: ['EASL–EASD–EASO (2024). Clinical Practice Guidelines on the management of MASLD. J Hepatol 81.', 'Keating, S. E. a kol. (2023). Exercise in the management of MASLD. Hepatology.']
  },

  thyroid: {
    short: 'Štítná žláza', label: 'Onemocnění štítné žlázy',
    train: {
      how: ['Při dobře léčené snížené funkci (hypotyreóze, Hashimoto) trénujte jako zdravý člověk, jen s postupným nástupem.', 'Při neléčené zvýšené funkci (hypertyreóze) je klidový tep vysoký: intenzivní trénink odložte do upravení hladin.', 'Únava při hypotyreóze se s léčbou zlepší; zátěž zvyšujte podle toho, jak se cítíte.'],
      good: ['Silový trénink', 'Aerobní aktivita v I1–I3'],
      avoid: ['Intenzivní trénink při neléčené hypertyreóze (bušení srdce, třes)'],
      doctor: 'Hladiny TSH a fT4 kontroluje endokrinolog. Levothyroxin užívejte nalačno, odděleně od vápníku a železa.'
    },
    redFlags: ['Bušení srdce nebo nepravidelný tep při zátěži', 'Výrazná únava a otoky'],
    caps: { useRPE: true },
    rules: { no: [], mod: ['hiit'], why: 'Platí při neléčené zvýšené funkci štítné žlázy, kdy je srdce už v klidu zrychlené.' },
    profile: {
      desc: 'Snížená funkce štítné žlázy (nejčastěji Hashimotova tyreoiditida) zpomaluje metabolismus a způsobuje únavu, zvýšená funkce naopak zrychluje tep a hubne svaly.',
      layman: '💡 V praxi: S dobře nastavenou léčbou můžete trénovat jako ostatní. Dokud nejsou hladiny v pořádku, řiďte se pocitem námahy a ne tepem.',
      exNote: '🦋 Štítná žláza: při upravených hladinách bez omezení; při neléčené hypertyreóze bez intervalů.',
      badges: ['Řídit se pocitem námahy', 'Postupný nástup', 'Jód a selen ze stravy', 'Kontrola TSH'],
      protMult: 1.0, recMult: 1.1,
      micros: [
        ['Selen ze stravy', '55–70 µg/den', '1–2 para ořechy denně stačí; doplňky jen po domluvě'],
        ['Jód', '150 µg/den', 'Jodizovaná sůl, ryby, mléčné výrobky; u Hashimota nepřehánět'],
        ['Vitamín D a železo', 'podle krevních testů', 'Nedostatek zhoršuje únavu']
      ],
      tips: { subtitle: 'Štítná žláza: pestrá strava a správné užívání léků', tips: [
        'Levothyroxin užívejte nalačno 30–60 minut před snídaní; vápník, železo a sója jeho vstřebávání snižují.',
        'Bezlepková strava pomáhá jen při prokázané celiakii, která je u Hashimota častější.',
        'Syrová brukvovitá zelenina ve velkém množství může ovlivnit štítnou žlázu jen při nedostatku jódu; běžné porce jsou v pořádku.'
      ] }
    },
    sources: ['Jonklaas, J. a kol. (2014). Guidelines for the treatment of hypothyroidism. American Thyroid Association. Thyroid 24(12).']
  },

  kidney: {
    short: 'Ledviny (CKD)', label: 'Chronické onemocnění ledvin',
    train: {
      how: ['Aerobní aktivita 150 min týdně v mírné intenzitě a silový trénink 2× týdně jsou bezpečné a zlepšují kondici i tlak.', 'Začněte pomalu (10–15 min) a postupně přidávejte.', 'Při dialýze cvičte ve dny bez dialýzy nebo v první polovině procedury podle centra.'],
      good: ['Chůze, rotoped', 'Silový trénink s gumou a jednoručkami', 'Rovnováha'],
      avoid: ['Těžkou zátěž se zádrží dechu', 'Cvičení při otocích a dušnosti'],
      doctor: 'Nefrolog doporučí příjem bílkovin, draslíku, fosforu a tekutin podle stadia onemocnění.'
    },
    redFlags: ['Dušnost, otoky nohou, náhlý přírůstek hmotnosti', 'Bušení srdce'],
    caps: { maxPct: 75, maxRPE: 7, noValsalva: true },
    rules: { no: [], mod: ['heavy', 'hiit'], why: 'U onemocnění ledvin bývá vysoký tlak; maximální zátěž a zádrž dechu ho prudce zvedají.' },
    profile: {
      desc: 'Chronické onemocnění ledvin má asi každý desátý dospělý, často souvisí s cukrovkou a vysokým tlakem. Pohyb zlepšuje tlak, svalovou sílu a kvalitu života.',
      layman: '💡 V praxi: Cvičit je bezpečné a užitečné. Volte mírnou intenzitu, nezadržujte dech a bílkoviny jezte jen v množství, které doporučí nefrolog.',
      exNote: '🫘 Ledviny: mírná intenzita, plynulé dýchání, bez maximální zátěže.',
      badges: ['Bílkoviny max. 0,8 g/kg', 'Mírná intenzita', 'Méně soli', 'Nefrolog'],
      protMult: 1.0, recMult: 1.15, protCap: 0.8,
      micros: [
        ['Sůl', 'méně než 5 g/den', 'Snižuje tlak a zátěž ledvin'],
        ['Draslík a fosfor', 'podle laboratoře', 'V pokročilých stadiích je nutné je omezit'],
        ['Doplňky stravy', 'jen po domluvě s nefrologem', 'Některé byliny a vysoké dávky vitamínů ledviny zatěžují']
      ],
      tips: { subtitle: 'Ledviny: méně bílkovin a soli, podle stadia', tips: [
        'Bez dialýzy se doporučuje asi 0,8 g bílkovin na kg (KDIGO 2024); kalkulačka vám vyšší příjem nedovolí.',
        'Při dialýze je potřeba bílkovin naopak vyšší, řiďte se nefrologem.',
        'Omezte sůl, uzeniny a polotovary.',
        'Proteinové doplňky a kreatin bez porady s lékařem nepoužívejte.'
      ] }
    },
    sources: ['KDIGO (2024). Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int 105(4S).', 'Wilkinson, T. J. a kol. (2021). Exercise and CKD. Clin Kidney J.']
  },

  hypertension: {
    short: 'Vysoký tlak', label: 'Vysoký krevní tlak',
    train: {
      how: ['Aerobní aktivita většinu dnů v týdnu (90–150 min týdně) snižuje tlak v průměru o 5–8 mmHg.', 'Silový trénink 2–3× týdně v mírné zátěži (8–12 opakování) s plynulým dýcháním.', 'Izometrická cvičení (např. sed u zdi 4 × 2 min) mají v přehledových studiích výrazný účinek na tlak.', 'Při léčbě betablokátory je tep nižší: řiďte se pocitem námahy (12–14 na Borgově škále, 5–6 z 10).'],
      good: ['Chůze, kolo, plavání', 'Sed u zdi, Pallof Press', 'Silový trénink s 2–3 opakováními v záloze'],
      avoid: ['Zadržování dechu při námaze', 'Maximální zátěž a cviky nad hlavou se zátěží při neléčeném tlaku', 'Cvičení při tlaku nad 160/100 mmHg bez porady s lékařem'],
      doctor: 'Při tlaku nad 160/100 mmHg nebo při poškození srdce či ledvin se před tréninkem poraďte s lékařem.'
    },
    redFlags: ['Bolest hlavy, závrať nebo poruchy vidění při zátěži', 'Bolest na hrudi', 'Tlak před cvičením nad 160/100 mmHg'],
    caps: { maxPct: 75, maxRPE: 7, hrrCap: 80, noValsalva: true },
    rules: { no: [], mod: ['heavy', 'overhead', 'hiit'], why: 'Maximální zátěž, zádrž dechu a práce nad hlavou zvedají krevní tlak nejvíc.' },
    planSwap: { S_MAX: 'S_HYP' },
    planNote: 'Vysoký tlak: bez maximálních pokusů, plynulý výdech při každém opakování.',
    profile: {
      desc: 'Vysoký krevní tlak má asi třetina dospělých. Pravidelný pohyb ho snižuje podobně jako jeden lék a zlepšuje účinek léčby.',
      layman: '💡 V praxi: Hýbejte se většinu dnů v týdnu. Při posilování nikdy nezadržujte dech, vydechujte při námaze a nechte si vždy 2–3 opakování v záloze. Pokud berete betablokátory, řiďte se pocitem, ne tepem.',
      exNote: '❤️ Vysoký tlak: plynulý výdech, bez maximálních vah, opatrně s cviky nad hlavou. Sed u zdi tlak snižuje.',
      badges: ['Bez zádrže dechu', 'Max. 75 % 1RM', 'Sůl pod 5 g', 'Pocit námahy při betablokátorech'],
      protMult: 1.0, recMult: 1.05,
      micros: [
        ['Draslík ze stravy', '3500–4700 mg/den', 'Zelenina, ovoce, luštěniny, brambory (pozor při onemocnění ledvin)'],
        ['Sůl', 'méně než 5 g/den', 'Hlavní zdroj jsou pečivo, uzeniny, sýry a polotovary'],
        ['Hořčík ze stravy', '300–400 mg/den', 'Ořechy, semínka, celozrnné výrobky']
      ],
      tips: { subtitle: 'Vysoký tlak: strava DASH a méně soli', tips: [
        'Strava DASH (hodně zeleniny, ovoce, luštěnin, nízkotučné mléčné výrobky, méně červeného masa) snižuje tlak o 8–14 mmHg.',
        'Sůl pod 5 g denně: nedosolujte, omezte uzeniny, sýry, polévkové koření a pečivo.',
        'Alkohol nejvýše malé množství, ideálně vůbec.',
        'Úbytek 1 kg hmotnosti snižuje tlak zhruba o 1 mmHg.'
      ] }
    },
    sources: ['Pescatello, L. S. a kol. (2019). Physical activity to prevent and treat hypertension: a systematic umbrella review. Med Sci Sports Exerc 51(6).', 'Edwards, J. J. a kol. (2023). Exercise training and resting blood pressure: a large-scale pairwise and network meta-analysis. Br J Sports Med 57(20).', 'Pelliccia, A. a kol. (2021). 2020 ESC Guidelines on sports cardiology and exercise in patients with cardiovascular disease. Eur Heart J 42(1).']
  },

  cardiac: {
    short: 'Po infarktu', label: 'Stav po infarktu / ischemická choroba srdeční',
    train: {
      how: ['Ideální je začít v programu kardiorehabilitace pod dohledem, obvykle 2–6 týdnů po infarktu.', 'Aerobní aktivita 3–5× týdně 20–60 min v mírné intenzitě (40–70 % tepové rezervy, Borg 11–14).', 'Silový trénink 2–3× týdně v lehké zátěži (40–60 % 1RM, 10–15 opakování) s plynulým výdechem.', 'Delší rozcvičení a zklidnění (10 min).'],
      good: ['Chůze, rotoped', 'Lehký silový trénink s gumou a jednoručkami', 'Kruhový trénink v nízké intenzitě'],
      avoid: ['Maximální zátěž, sprinty a skoky bez schválení kardiologem', 'Zadržování dechu', 'Cvičení v mrazu a horku', 'Náhlé ukončení intenzivní zátěže'],
      doctor: 'Před začátkem je nutné zátěžové vyšetření (ergometrie) a doporučení kardiologa. Intervaly jen v rámci kardiorehabilitace.'
    },
    redFlags: ['Bolest, tlak nebo pálení na hrudi, šířící se do ruky, krku nebo čelisti', 'Nepřiměřená dušnost, závrať, mdloba', 'Nepravidelný nebo velmi rychlý tep', 'Studený pot, nevolnost'],
    caps: { maxPct: 60, maxRPE: 6, hrrCap: 70, useRPE: true, noValsalva: true, setsMult: 0.75, restMult: 1.3 },
    rules: { no: ['heavy', 'impactHigh', 'sprint', 'hiit'], mod: ['impact', 'overhead', 'hang', 'eccMax', 'cod', 'threshold', 'run', 'flexLoad'], why: 'Srdce po infarktu potřebuje postupnou, kontrolovanou zátěž bez prudkých výkyvů tlaku a tepu.' },
    planSwap: { S_MAX: 'S_END', S_HYP: 'S_END', S_GEN: 'S_END', E3: 'E1', E4: 'E1', E5: 'E1', RSA: 'E1', X: 'C', A: 'C', SPEC: 'E1', MATCH: 'E1', RACE: 'E1' },
    planNote: 'Po infarktu: jen mírná intenzita, intervaly jen v kardiorehabilitaci.',
    profile: {
      desc: 'Kardiorehabilitace po infarktu snižuje úmrtnost na srdeční onemocnění a počet opakovaných hospitalizací. Základem je postupně zvyšovaná aerobní a lehká silová zátěž.',
      layman: '💡 V praxi: Začněte v kardiorehabilitaci a dál pokračujte doma: chůze nebo kolo většinu dnů v týdnu a lehké posilování. Intenzitu hlídejte pocitem (při chůzi zvládnete mluvit), protože léky často snižují tep.',
      exNote: '🫀 Po infarktu: lehké zátěže (40–60 % 1RM), žádné maximální pokusy, sprinty ani skoky bez schválení kardiologa.',
      badges: ['Kardiorehabilitace', 'Borg 11–14', 'Max. 60 % 1RM', 'Bez zádrže dechu'],
      protMult: 1.0, recMult: 1.3,
      micros: [
        ['Omega-3 (EPA + DHA)', '1 g/den ze stravy nebo dle kardiologa', 'Tučné ryby 2× týdně'],
        ['Sůl', 'méně než 5 g/den', 'Ochrana před vysokým tlakem'],
        ['Vláknina', '30 g a více denně', 'Snižuje LDL cholesterol (oves, luštěniny)']
      ],
      tips: { subtitle: 'Po infarktu: strava pro srdce a cévy', tips: [
        'Středomořská strava snižuje riziko dalšího infarktu.',
        'Nasycené tuky pod 10 % energie (tučné maso, uzeniny, máslo, smetana), místo nich olivový a řepkový olej, ořechy.',
        'Rozpustná vláknina (oves, ječmen, luštěniny) snižuje LDL cholesterol.',
        'Sůl pod 5 g denně, alkohol co nejméně, kouření úplně vynechat.'
      ] }
    },
    sources: ['Pelliccia, A. a kol. (2021). 2020 ESC Guidelines on sports cardiology and exercise in patients with cardiovascular disease. Eur Heart J 42(1).', 'Ambrosetti, M. a kol. (2021). Secondary prevention through comprehensive cardiovascular rehabilitation (EAPC position paper). Eur J Prev Cardiol 28(5).']
  },

  stroke: {
    short: 'Po CMP', label: 'Stav po CMP (mrtvici)',
    train: {
      how: ['Aerobní aktivita 3–5× týdně 20–60 min v mírné intenzitě.', 'Silový trénink 2–3× týdně, 10–15 opakování, plynulý výdech při každém opakování.', 'Denní nácvik rovnováhy a chůze, cviky s oporou.', 'Úkoly pro koordinaci oko–ruka podporují obnovu nervových drah.'],
      good: ['Chůze, rotoped', 'Goblet dřep, výstupy, přítahy s oporou', 'Stoj na jedné noze s oporou, Tandem Walk'],
      avoid: ['Zadržování dechu a maximální zátěž', 'Rychlé změny směru a skoky (riziko pádu)'],
      doctor: 'Intenzitu a cviky určuje neurolog a fyzioterapeut. Krevní tlak kontrolujte před cvičením.'
    },
    redFlags: ['Náhlá slabost nebo necitlivost jedné strany těla, porucha řeči nebo vidění (volejte 155)', 'Silná bolest hlavy', 'Závrať a ztráta rovnováhy'],
    caps: { maxPct: 70, maxRPE: 6, useRPE: true, noValsalva: true, restMult: 1.3 },
    rules: { no: ['impactHigh'], mod: ['sprint', 'cod', 'balance', 'hiit', 'heavy'], why: 'Maximální zátěž svádí k zadržení dechu a prudkému nárůstu tlaku; rychlé změny směru zvyšují riziko pádu.' },
    sources: ['Billinger, S. A. a kol. (2014). Physical activity and exercise recommendations for stroke survivors. AHA/ASA Scientific Statement. Stroke 45(8).']
  },

  bone: {
    short: 'Osteopenie / osteoporóza', label: 'Osteopenie / osteoporóza',
    train: {
      how: ['Silový trénink 2–3× týdně; po zvládnutí techniky i vyšší zátěž (5 sérií po 5 opakováních kolem 80–85 % 1RM ve studii LIFTMOR byla bezpečná a zlepšila hustotu kostí).', 'Odrazy se střední zátěží (poskoky, Box Jump) 3–4× týdně, pokud jste neprodělali zlomeninu obratle.', 'Denně rovnováha (prevence pádů).', 'Držte neutrální páteř, předklon a rotaci se zátěží vynechte.'],
      good: ['Dřep, mrtvý tah s Trap Barem, výstupy', 'Farmářská chůze, Hip Thrust', 'Pogo a Box Jump', 'Rovnováha'],
      avoid: ['Sedy-lehy, předklony s kulatými zády', 'Rotace trupu se zátěží', 'Seskoky z výšky'],
      doctor: 'Při prodělané zlomenině obratle nebo velmi nízkém T-skóre určí bezpečné dopady fyzioterapeut.'
    },
    redFlags: ['Náhlá bolest v zádech po zvednutí nebo pádu (možná zlomenina obratle)', 'Zmenšení výšky o více než 3 cm'],
    caps: { restMult: 1.1 },
    rules: { no: ['impactHigh'], mod: ['flexLoad', 'flex', 'rotLoad', 'balance'], why: 'Tvrdé dopady, předklon a rotace páteře se zátěží zvyšují riziko zlomeniny obratle. Rovnováhu cvičte u opory.' },
    sources: ['Daly, R. M. a kol. (2019). Exercise and Sports Science Australia (ESSA) position statement on exercise prescription for the prevention and management of osteoporosis. J Sci Med Sport 22(3).', 'Watson, S. L. a kol. (2018). LIFTMOR randomized controlled trial. J Bone Miner Res 33(2).']
  },

  sarcopenia: {
    short: 'Sarkopenie / senior', label: 'Sarkopenie (úbytek svalů) / senior 65+',
    train: {
      how: ['Silový trénink 2–3× týdně je nejúčinnější léčba úbytku svalů: 1–3 série po 8–12 opakováních, zátěž postupně ke 70–80 % 1RM.', 'Výbušná síla (rychlé vstávání ze židle, rychlé výstupy) pomáhá při chůzi a prevenci pádů.', 'Rovnováha 3× týdně a více.', 'Nácvik vstávání ze země je důležitý pro případ pádu.'],
      good: ['Vstávání ze židle, Goblet dřep, výstupy', 'Farmářská chůze, přítahy, Hip Thrust', 'Tandem Walk, stoj na jedné noze u opory'],
      avoid: ['Tvrdé dopady a sprinty bez přípravy', 'Dlouhé sezení a ležení'],
      doctor: 'Při pádech v posledním roce, závratích nebo osteoporóze začněte s fyzioterapeutem.'
    },
    redFlags: ['Závrať nebo mdloba', 'Pád během cvičení', 'Bolest na hrudi'],
    caps: { restMult: 1.2 },
    rules: { no: ['impactHigh'], mod: ['sprint', 'cod', 'balance', 'impact', 'hang', 'run'], why: 'Rovnováhu a odrazy cvičte u opory a postupně, riziko pádu je vyšší.' },
    profile: {
      desc: 'Po 50. roce ubývá 1–2 % svalové hmoty a ještě víc síly ročně. Slabé svaly zvyšují riziko pádů, zlomenin a ztráty soběstačnosti. Silový trénink funguje v každém věku.',
      layman: '💡 V praxi: Posilujte 2–3× týdně, i v 80 letech. Jezte dost bílkovin v každém jídle. Cvičte rovnováhu u opory a naučte se bezpečně vstávat ze země.',
      exNote: '💪 Sarkopenie: silový trénink je hlavní léčba. Rovnováhu u opory, rychlé vstávání ze židle.',
      badges: ['Síla 2–3× týdně', 'Bílkoviny 1,2–1,5 g/kg', 'Rovnováha', 'Vstávání ze země'],
      protMult: 1.0, protFloor: 1.2, recMult: 1.2,
      micros: [
        ['Bílkoviny', '25–30 g v každém hlavním jídle', 'Starší svaly potřebují větší dávku najednou (leucin)'],
        ['Vitamín D3', 'podle hladiny, často 800–2000 IU', 'Svalová síla a prevence pádů'],
        ['Vápník', '1000–1200 mg/den ze stravy', 'Zdraví kostí']
      ],
      tips: { subtitle: 'Sarkopenie: bílkoviny v každém jídle', tips: [
        'Bílkoviny 1,2–1,5 g/kg denně (ESPEN), rozdělené do 3–4 jídel po 25–30 g.',
        'Tvaroh, řecký jogurt, vejce, ryby a luštěniny jsou snadno stravitelné zdroje.',
        'Při malé chuti k jídlu volte menší a častější porce, ne „light“ výrobky.',
        'Pijte i bez žízně, s věkem pocit žízně slábne.'
      ] }
    },
    sources: ['Cruz-Jentoft, A. J. a kol. (2019). Sarcopenia: revised European consensus on definition and diagnosis (EWGSOP2). Age Ageing 48(1).', 'Izquierdo, M. a kol. (2021). International exercise recommendations in older adults (ICFSR). J Nutr Health Aging 25(7).', 'Deutz, N. E. a kol. (2014). Protein intake and exercise for optimal muscle function with aging (ESPEN). Clin Nutr 33(6).']
  },

  oa: {
    short: 'Artróza kolen a kyčlí', label: 'Artróza kolen a kyčlí',
    train: {
      how: ['Cvičení je základní léčba artrózy (NICE 2022): posilování stehen a hýždí 2–3× týdně a aerobní aktivita šetrná ke kloubům.', 'Bolest při cvičení do 2–3 z 10, která do 24 hodin odezní, je přijatelná.', 'Rozsah pohybu volte bez ostré bolesti, hloubku dřepu postupně zvětšujte.'],
      good: ['Kolo, plavání, chůze s holemi', 'Dřep na bednu, Hip Thrust, výstupy na nízkou bednu', 'Boční úkroky s gumou'],
      avoid: ['Skoky a seskoky', 'Dlouhý běh po tvrdém povrchu při zhoršení', 'Úplný klid'],
      doctor: 'Při otoku, zablokování kloubu nebo bolesti v noci se poraďte s ortopedem nebo fyzioterapeutem.'
    },
    redFlags: ['Kloub oteklý, teplý a zarudlý', 'Bolest, která neodezní do 24 hodin', 'Zablokování nebo podlamování kolene'],
    caps: { maxPct: 80, restMult: 1.1 },
    rules: { no: ['impactHigh'], mod: ['impact', 'run', 'sprint', 'cod', 'kneeDeep'], why: 'Dopady a hluboký ohyb kolene zatěžují chrupavku nejvíc; zátěž přidávejte podle bolesti.' },
    planSwap: { RSA: 'E1', X: 'S_GEN' },
    planNote: 'Artróza: vytrvalost raději na kole nebo v bazénu, bolest při cvičení nejvýše 2–3 z 10.',
    profile: {
      desc: 'Artróza je nejčastější onemocnění kloubů. Silné svaly kolem kloubu snižují bolest a zlepšují funkci podobně jako léky proti bolesti.',
      layman: '💡 V praxi: Klid artróze nepomáhá. Posilujte stehna a hýždě a jezděte na kole nebo plavte. Mírná bolest při cvičení je v pořádku, pokud do druhého dne odezní.',
      exNote: '🦵 Artróza: bez skoků, dřep na bednu, hloubku podle bolesti. Pravidlo bolesti: do 2–3 z 10 a odezní do 24 h.',
      badges: ['Pravidlo bolesti 2–3/10', 'Síla stehen a hýždí', 'Kolo a bazén', 'Hubnutí ulevuje kolenům'],
      protMult: 1.0, recMult: 1.15,
      micros: [
        ['Omega-3 ze stravy', '1–2 porce ryb týdně', 'Mírný protizánětlivý účinek'],
        ['Vitamín D', 'podle hladiny v krvi', 'Zdraví svalů a kostí'],
        ['Glukosamin a chondroitin', 'důkazy slabé', 'NICE je nedoporučuje; pokud zkoušíte, hodnoťte po 3 měsících']
      ],
      tips: { subtitle: 'Artróza: hmotnost a protizánětlivá strava', tips: [
        'Každý kilogram dolů ubere kolenu při chůzi asi 4 kg zátěže.',
        'Středomořská strava (zelenina, ryby, olivový olej, ořechy) má mírný protizánětlivý účinek.',
        'Dostatek bílkovin pro sílu stehen, která kloub chrání.'
      ] }
    },
    sources: ['NICE (2022). Osteoarthritis in over 16s: diagnosis and management. NG226.', 'Bannuru, R. R. a kol. (2019). OARSI guidelines for the non-surgical management of knee, hip, and polyarticular osteoarthritis. Osteoarthritis Cartilage 27(11).']
  },

  backpain: {
    short: 'Bolesti zad', label: 'Bolesti dolní části zad',
    train: {
      how: ['Zůstaňte v pohybu, klid na lůžku hojení zpomaluje.', 'Pomáhá jakýkoli pravidelný pohyb, který vám vyhovuje: chůze, posilování, pilates, jóga (NICE 2016).', 'Posilujte hýždě, záda a hluboký stabilizační systém, zátěž přidávejte postupně.', 'Bolest při pohybu neznamená poškození; pohyb pomalu přidávejte, i když trochu bolí.'],
      good: ['Chůze', 'Bird-Dog, Mrtvý brouk, Boční prkno, Pallof Press', 'Hip Thrust, Goblet dřep, přítahy s oporou'],
      avoid: ['Dlouhé sezení bez přestávky', 'Úplný klid', 'Těžký předklon s kulatými zády, dokud bolest neustoupí'],
      doctor: 'Okamžitě k lékaři při varovných příznacích (viz níže). Při bolesti trvající déle než 6 týdnů pomůže fyzioterapeut.'
    },
    redFlags: ['Necitlivost v rozkroku, porucha močení nebo stolice (ihned k lékaři)', 'Slabost nohy, která se zhoršuje', 'Bolest v noci s horečkou nebo hubnutím', 'Bolest po úrazu nebo pádu'],
    caps: { maxPct: 80 },
    rules: { no: [], mod: ['flexLoad', 'heavy', 'rotLoad', 'impactHigh'], why: 'Těžký předklon a rotace se zátěží zvyšují zátěž plotének; zařazujte je až po zlepšení.' },
    profile: {
      desc: 'Bolest dolní části zad postihne během života asi 80 % lidí. U většiny nejde o vážné poškození a nejlépe pomáhá zůstat v pohybu a postupně posilovat.',
      layman: '💡 V praxi: Nečekejte, až bolest úplně zmizí. Choďte, cvičte cviky na střed těla a postupně přidávejte zátěž. Bolest při pohybu většinou neznamená, že si škodíte.',
      exNote: '🔙 Bolesti zad: core a hýždě, opatrně s předklonem a rotací se zátěží.',
      badges: ['Zůstat v pohybu', 'Core a hýždě', 'Přerušovat sezení', 'Bez strachu z pohybu'],
      protMult: 1.0, recMult: 1.05,
      micros: [
        ['Vitamín D', 'podle hladiny v krvi', 'Nedostatek bývá spojen s bolestmi svalů'],
        ['Hořčík ze stravy', '300–400 mg/den', 'Funkce svalů'],
        ['Omega-3 ze stravy', '1–2 porce ryb týdně', 'Celkové zdraví']
      ],
      tips: { subtitle: 'Bolesti zad: hmotnost a spánek', tips: [
        'Snížení nadváhy ulehčí bederní páteři.',
        'Kvalitní spánek snižuje vnímání bolesti.',
        'Platí obecná doporučení pro pestrou stravu.'
      ] }
    },
    sources: ['NICE (2016, aktual. 2020). Low back pain and sciatica in over 16s: assessment and management. NG59.', 'Hayden, J. A. a kol. (2021). Exercise therapy for chronic low back pain. Cochrane Database Syst Rev.']
  },

  scoliosis: {
    short: 'Skolióza', label: 'Skolióza',
    train: {
      how: ['Sport a běžný trénink jsou u skoliózy vhodné a doporučené (SOSORT 2016).', 'Specifická cvičení (např. Schroth, SEAS) učí fyzioterapeut podle typu zakřivení.', 'Posilujte symetricky, jednostranné cviky pomohou odhalit a vyrovnat rozdíly.'],
      good: ['Plavání', 'Jednostranné cviky (Pallof, přítahy jednoručky, Bulharský dřep)', 'Boční prkno, Bird-Dog'],
      avoid: ['Těžkou osovou zátěž na páteř bez zvládnuté techniky při větším zakřivení'],
      doctor: 'U dětí a dospívajících v růstu kontroluje zakřivení ortoped (Cobbův úhel).'
    },
    redFlags: ['Rychle se zhoršující zakřivení', 'Bolest vystřelující do nohou'],
    caps: {},
    rules: { no: [], mod: ['heavy'], why: 'Osová zátěž (velká činka na zádech nebo nad hlavou) vyžaduje u výraznějšího zakřivení dobrou techniku.' },
    profile: {
      desc: 'Skolióza je boční zakřivení páteře spojené s rotací obratlů. U dospělých obvykle nebrání ve sportu, cvičení pomáhá s bolestí a držením těla.',
      layman: '💡 V praxi: Sportovat můžete. Fyzioterapeut vás naučí cviky pro vaše zakřivení. V posilovně zařazujte jednostranné cviky a těžké dřepy s činkou na zádech dělejte jen s dobrou technikou.',
      exNote: '🌀 Skolióza: jednostranné cviky a core jsou vhodné, těžká osová zátěž jen s technikou.',
      badges: ['Sport je vhodný', 'Jednostranné cviky', 'Specifická cvičení', 'Symetrie'],
      protMult: 1.0, recMult: 1.0,
      micros: [
        ['Vápník a vitamín D', 'dle obecných doporučení', 'Zdraví kostí'],
        ['Bílkoviny', 'dle kalkulačky', 'Síla posturálních svalů'],
        ['Hořčík', 'ze stravy', 'Funkce svalů']
      ],
      tips: { subtitle: 'Skolióza: obecná pravidla pestré stravy', tips: [
        'Platí obecná doporučení pro zdravou stravu.',
        'Dostatek vápníku a vitamínu D je důležitý zvlášť v období růstu.'
      ] }
    },
    sources: ['Negrini, S. a kol. (2018). 2016 SOSORT guidelines: orthopaedic and rehabilitation treatment of idiopathic scoliosis during growth. Scoliosis Spinal Disord 13.']
  },

  hypermobility: {
    short: 'Hypermobilita', label: 'Hypermobilita kloubů',
    train: {
      how: ['Cílem je síla a kontrola pohybu, ne další protahování.', 'Pracujte v plném, ale kontrolovaném rozsahu, bez propadání do krajních poloh (zamčená kolena, lokty).', 'Pomalé tempo a izometrie (výdrže) zlepšují stabilitu kloubů.', 'Zátěž přidávejte pomalu, šlachy a vazy se adaptují déle.'],
      good: ['Silový trénink s pomalým tempem', 'Pallof Press, Bird-Dog, Boční prkno', 'Pilates zaměřený na sílu'],
      avoid: ['Pasivní protahování do krajních poloh', 'Prudké doskoky a maximální brzdění na začátku'],
      doctor: 'Při častých vykloubeních, bolesti nebo podezření na Ehlers-Danlosův syndrom se poraďte s revmatologem nebo fyzioterapeutem.'
    },
    redFlags: ['Vykloubení nebo pocit „vypadnutí“ kloubu', 'Závrať při vstávání (posturální tachykardie)'],
    caps: { maxPct: 75, restMult: 1.1 },
    rules: { no: [], mod: ['endRange', 'impactHigh', 'eccMax', 'hang'], why: 'Volné vazy kloub v krajní poloze nejistí; stabilitu musí zajistit sval.' },
    profile: {
      desc: 'Hypermobilita znamená větší rozsah pohybu v kloubech. Mnoho lidí nemá potíže, u části se objevují bolesti, podvrtnutí a únava. Pomáhá síla a kontrola pohybu.',
      layman: '💡 V praxi: Neprotahujte se „víc a víc“. Posilujte pomalu a kontrolovaně, zastavte pohyb před krajní polohou kloubu a nezamykejte kolena ani lokty.',
      exNote: '🤸 Hypermobilita: síla a kontrola místo protahování, bez krajních poloh.',
      badges: ['Síla místo strečinku', 'Pomalé tempo', 'Bez krajních poloh', 'Izometrie'],
      protMult: 1.0, recMult: 1.15,
      micros: [
        ['Vitamín C ze stravy', '100 mg/den', 'Tvorba kolagenu'],
        ['Vitamín D', 'podle hladiny v krvi', 'Zdraví svalů'],
        ['Sůl a tekutiny', 'dle lékaře', 'Při posturální tachykardii (POTS) lékař někdy doporučuje víc']
      ],
      tips: { subtitle: 'Hypermobilita: obecná pravidla', tips: [
        'Dostatek bílkovin a vitamínu C podporuje pojivové tkáně.',
        'Při závratích po vstávání pomáhá dostatek tekutin.'
      ] }
    },
    sources: ['Engelbert, R. H. a kol. (2017). The evidence-based rationale for physical therapy treatment of children, adolescents, and adults diagnosed with joint hypermobility syndrome/hypermobile Ehlers Danlos syndrome. Am J Med Genet C 175(1).']
  },

  pectus: {
    short: 'Pectus excavatum', label: 'Pectus excavatum (vpáčený hrudník)',
    train: {
      how: ['Otevírejte hrudník (protažení prsních svalů, extenze hrudní páteře).', 'Na každý tlakový cvik zařaďte dva tahové (Face Pulls, přítahy).', 'Dýchejte do stran spodních žeber.'],
      good: ['Face Pulls, přítahy, shyby', 'Extenze hrudní páteře přes válec', 'Dechový trenažér 4-2-6'],
      avoid: ['Převahu tlakových cviků nad tahovými'],
      doctor: 'Při dušnosti nebo bušení srdce při zátěži doporučí kardiolog nebo hrudní chirurg vyšetření.'
    },
    redFlags: ['Bolest na hrudi, bušení srdce nebo nepřiměřená dušnost při zátěži'],
    caps: {},
    rules: { no: [], mod: [] },
    sources: ['Obermeyer, R. J. a kol. (2018). Pectus excavatum: a review of physiology and treatment. J Pediatr Surg.']
  },

  asthma: {
    short: 'Astma', label: 'Bronchiální astma (zátěžové)',
    train: {
      how: ['Rozcvičení 10–15 min s postupným náběhem, krátké intervaly v rozcvičení mohou snížit zúžení průdušek.', 'V chladu dýchejte přes šátek, preferujte teplé a vlhké prostředí (bazén).', 'Úlevový inhalátor mějte vždy u sebe; lékař může doporučit inhalaci 15 min před výkonem.'],
      good: ['Plavání, veslování', 'Silový trénink', 'Dechový trenažér 4-2-6'],
      avoid: ['Prudký start do vysoké intenzity', 'Trénink v mrazu a smogu'],
      doctor: 'Plán léčby a inhalaci před zátěží nastaví pneumolog nebo alergolog.'
    },
    redFlags: ['Pískoty a dušnost, které nepovolí po inhalátoru', 'Modrání rtů, neschopnost mluvit (volejte 155)'],
    caps: {},
    rules: { no: [], mod: ['hiit'], why: 'Prudký nástup vysoké intenzity může vyvolat zátěžové astma; zařaďte až po 15 min rozcvičení.' },
    sources: ['Parsons, J. P. a kol. (2013). An official ATS clinical practice guideline: exercise-induced bronchoconstriction. Am J Respir Crit Care Med 187(9).']
  },

  copd: {
    short: 'CHOPN', label: 'CHOPN (chronická obstrukční plicní nemoc)',
    train: {
      how: ['Plicní rehabilitace je jedna z nejúčinnějších léčeb CHOPN (GOLD).', 'Vytrvalost 3–5× týdně, intenzita podle dušnosti: 4–6 z 10 na Borgově škále dušnosti. Intervaly (30 s práce / 30 s pauza) jsou snazší než souvislá zátěž.', 'Silový trénink 2–3× týdně, hlavně dolní končetiny.', 'Dýchání přes sešpulené rty zpomaluje dech a ulevuje při dušnosti.'],
      good: ['Chůze, rotoped (i intervalově)', 'Vstávání ze židle, výstupy, přítahy', 'Dýchání přes sešpulené rty'],
      avoid: ['Práci paží nad hlavou bez opory (rychle zvyšuje dušnost)', 'Trénink v chladu a smogu'],
      doctor: 'Program, případně kyslík při zátěži, určí pneumolog. Saturace by při cvičení neměla klesat pod 88 %.'
    },
    redFlags: ['Dušnost nad 7 z 10, která po zastavení neodezní', 'Saturace pod 88 %', 'Bolest na hrudi, modrání rtů'],
    caps: { maxPct: 70, maxRPE: 6, useRPE: true, setsMult: 0.8, restMult: 1.5 },
    rules: { no: ['sprint', 'impactHigh'], mod: ['hiit', 'impact', 'heavy', 'overhead', 'run', 'cod', 'threshold'], why: 'Intenzitu určuje dušnost; práce paží nad hlavou a sprinty ji zvyšují nejrychleji.' },
    planSwap: { E3: 'E1', E4: 'E1', E5: 'E1', RSA: 'E1', X: 'S_END', A: 'C', S_MAX: 'S_GEN' },
    planNote: 'CHOPN: intenzita podle dušnosti (4–6 z 10), intervaly 30/30 s jsou v pořádku.',
    profile: {
      desc: 'Při CHOPN jsou průdušky trvale zúžené. Dušnost vede k omezení pohybu a slábnutí svalů, což dušnost dál zhoršuje. Trénink tento kruh přerušuje.',
      layman: '💡 V praxi: Mírná dušnost při cvičení je v pořádku a nepoškozuje. Cvičte v krátkých úsecích s pauzami, dýchejte přes sešpulené rty a posilujte hlavně nohy.',
      exNote: '🫁 CHOPN: intenzita podle dušnosti, krátké úseky, opatrně s pažemi nad hlavou.',
      badges: ['Dušnost 4–6/10', 'Intervaly 30/30 s', 'Síla nohou', 'Sešpulené rty'],
      protMult: 1.0, protFloor: 1.2, recMult: 1.25,
      micros: [
        ['Vitamín D', 'podle hladiny v krvi', 'Nedostatek je u CHOPN častý'],
        ['Bílkoviny', '1,2–1,5 g/kg', 'Prevence úbytku svalů'],
        ['Energie', 'podle hmotnosti', 'Při podváze častější menší jídla s vyšší energií']
      ],
      tips: { subtitle: 'CHOPN: dost energie a bílkovin', tips: [
        'Podváha a úbytek svalů zhoršují prognózu; při hubnutí přidejte energii i bílkoviny.',
        'Menší a častější jídla nezvyšují dušnost tolik jako velké porce.',
        'Při nadváze je vhodné pomalé hubnutí se silovým tréninkem.'
      ] }
    },
    sources: ['GOLD (2024). Global Strategy for the Diagnosis, Management, and Prevention of COPD.', 'Spruit, M. A. a kol. (2013). An official ATS/ERS statement: key concepts and advances in pulmonary rehabilitation. Am J Respir Crit Care Med 188(8).']
  },

  longcovid: {
    short: 'Long covid', label: 'Long covid / postvirová únava',
    train: {
      how: ['Nejdřív zjistěte, jestli máte zhoršení po námaze (PEM): stav se zhorší 12–72 hodin po aktivitě a trvá dny.', 'Při PEM nepoužívejte postupné navyšování zátěže „přes únavu“. Platí šetření energie (pacing): aktivitu držte pod hranicí, která zhoršení vyvolá, a střídejte ji s odpočinkem.', 'Bez PEM se k tréninku vracejte postupně, v krocích po 1–2 týdnech, a krok opakujte, dokud ho zvládáte bez zhoršení.', 'Při závratích po postavení (POTS) začněte cvičením vleže nebo vsedě (rotoped vsedě, veslo, cvičení na podložce).'],
      good: ['Krátká chůze podle energie', 'Dechová cvičení', 'Lehká mobilita a cvičení vsedě nebo vleže'],
      avoid: ['Intervaly, sprinty a skoky, dokud nejste bez příznaků', 'Postupné navyšování zátěže přes únavu při PEM', 'Srovnávání s výkonem před nemocí'],
      doctor: 'Před návratem k tréninku vylučte srdeční postižení (myokarditida), hlavně při bolesti na hrudi nebo bušení srdce. Rehabilitaci vede lékař nebo fyzioterapeut se zkušeností s long covidem.'
    },
    redFlags: ['Zhoršení únavy a příznaků 12–72 h po aktivitě (PEM): zastavte navyšování', 'Bolest na hrudi, bušení srdce, mdloba', 'Výrazná dušnost nebo pokles saturace'],
    caps: { maxPct: 50, maxRPE: 4, hrrCap: 50, useRPE: true, noValsalva: true, setsMult: 0.5, restMult: 1.6, pacing: true },
    rules: { no: ['hiit', 'sprint', 'impactHigh', 'impact', 'cod', 'threshold', 'heavy', 'eccMax'], mod: ['run', 'balance', 'overhead', 'flexLoad', 'coreHigh', 'hang', 'water'], pillarNo: ['explosive', 'agility'], pillarMod: ['strength', 'endurance'], why: 'Při postvirové únavě může vyšší zátěž vyvolat zhoršení na několik dní; přednost má šetření energie.' },
    planSwap: { S_MAX: 'C', S_HYP: 'C', S_GEN: 'C', S_END: 'C', S_MAINT: 'C', E1: 'C', E1L: 'REST', E3: 'REST', E4: 'REST', E5: 'REST', RSA: 'REST', X: 'REST', A: 'REST', SPEC: 'C', MATCH: 'REST', RACE: 'REST' },
    planNote: 'Long covid: jen lehký pohyb podle energie (pacing); plán nahrazuje náročné dny odpočinkem.',
    profile: {
      desc: 'U části lidí přetrvávají po covidu nebo jiné virové infekci měsíce únava, dušnost, bušení srdce a potíže se soustředěním. Klíčové je poznat, zda máte zhoršení po námaze (PEM).',
      layman: '💡 V praxi: Pokud se vám 1–3 dny po aktivitě přitíží, netlačte na pilu. Rozložte si energii do celého dne a aktivitu zvyšujte jen tehdy, když vydržíte stejnou úroveň alespoň týden bez zhoršení.',
      exNote: '🦠 Long covid: žádné intervaly, sprinty ani skoky. Krátké lehké bloky s odpočinkem, cvičení vsedě nebo vleže.',
      badges: ['Pacing (šetření energie)', 'Bez navyšování přes únavu', 'Námaha max. 3–4/10', 'Vyloučit myokarditidu'],
      protMult: 1.0, recMult: 1.6,
      micros: [
        ['Vitamín D', 'podle hladiny v krvi', 'Při nedostatku doplnit'],
        ['Železo a B12', 'podle krevních testů', 'Nedostatek zhoršuje únavu'],
        ['Tekutiny a sůl', 'podle lékaře', 'Při POTS lékař často doporučuje víc tekutin a soli']
      ],
      tips: { subtitle: 'Long covid: pravidelnost a jednoduchá jídla', tips: [
        'Připravujte jednoduchá jídla, ať vaření nevyčerpá energii (dávky dopředu, mražené porce).',
        'Pravidelná menší jídla stabilizují energii během dne.',
        'Při POTS pomáhá dostatek tekutin, menší porce a méně alkoholu.'
      ] }
    },
    sources: ['WHO (2023). Clinical management of COVID-19: living guideline – rehabilitation of post COVID-19 condition.', 'NICE (2021). Myalgic encephalomyelitis (or encephalopathy)/chronic fatigue syndrome: diagnosis and management. NG206.', 'Décary, S. a kol. (2021). Care models for long COVID: a rapid systematic review. medRxiv / World Physiotherapy (2021). Safe rehabilitation approaches for people living with Long COVID.']
  },

  mental: {
    short: 'Deprese / úzkost', label: 'Deprese a úzkost',
    train: {
      how: ['Pohyb zmírňuje příznaky deprese a úzkosti srovnatelně s psychoterapií nebo léky u mírných a středních forem (Noetel 2024).', 'Nejvíc pomáhá chůze nebo běh, jóga a silový trénink; vyšší intenzita mívá větší účinek, pokud je pro vás snesitelná.', 'Začněte malým krokem (10 minut denně) a cvičte ideálně s někým nebo venku.', 'Pravidelnost je důležitější než výkon.'],
      good: ['Chůze nebo běh venku', 'Silový trénink', 'Jóga, dechová cvičení', 'Skupinové cvičení'],
      avoid: ['Hodnocení se podle výkonu', 'Příliš ambiciózní plán, který se nedá dodržet'],
      doctor: 'Pohyb léčbu doplňuje, nenahrazuje. Při myšlenkách na sebepoškození volejte Linku první psychické pomoci 116 123 nebo 155.'
    },
    redFlags: ['Myšlenky na sebepoškození: Linka první psychické pomoci 116 123, v ohrožení 155'],
    caps: {},
    rules: { no: [], mod: [] },
    profile: {
      desc: 'Deprese a úzkosti patří k nejčastějším onemocněním 21. století. Pravidelný pohyb zlepšuje náladu, spánek a zvládání stresu.',
      layman: '💡 V praxi: Stačí začít krátkou procházkou. Domluvte si cvičení s někým, venku je účinek větší. Když jeden den nevyjde, nic se neděje, pokračujte další den.',
      exNote: '🧠 Deprese a úzkost: všechny cviky jsou vhodné. Pomáhá pravidelnost, venku a s ostatními.',
      badges: ['Malé kroky', 'Venku a s lidmi', 'Síla i vytrvalost', 'Doplněk léčby'],
      protMult: 1.0, recMult: 1.0,
      micros: [
        ['Omega-3 (EPA)', 'z ryb 2× týdně', 'Doplňky s vyšším obsahem EPA mají slabé důkazy u deprese; poraďte se s lékařem'],
        ['Vitamín D', 'podle hladiny v krvi', 'Nedostatek je častý v zimě'],
        ['Kofein a alkohol', 'omezit', 'Zhoršují úzkost a spánek']
      ],
      tips: { subtitle: 'Psychika: pravidelnost a středomořský styl', tips: [
        'Středomořská strava (zelenina, luštěniny, ryby, ořechy, olivový olej) zlepšila příznaky deprese ve studii SMILES.',
        'Pravidelná jídla stabilizují energii a náladu.',
        'Omezte alkohol a večerní kofein, zhoršují spánek a úzkost.'
      ] }
    },
    sources: ['Noetel, M. a kol. (2024). Effect of exercise for depression: systematic review and network meta-analysis of randomised controlled trials. BMJ 384.', 'Singh, B. a kol. (2023). Effectiveness of physical activity interventions for improving depression, anxiety and distress: an overview of systematic reviews. Br J Sports Med 57(18).']
  },

  oncology: {
    short: 'Po onkologické léčbě', label: 'Onkologičtí pacienti během a po léčbě',
    train: {
      how: ['Aerobní aktivita 3× týdně po 30 min a silový trénink 2× týdně zmírňují únavu, úzkost a zlepšují kvalitu života (ACSM 2019).', 'Během chemoterapie cvičte podle aktuálního stavu, ve slabších dnech jen chůze nebo protažení.', 'Při lymfedému je postupný silový trénink bezpečný a doporučený.', 'Při kostních metastázách vynechte dopady a nárazy a cviky konzultujte s onkologem.'],
      good: ['Chůze, rotoped', 'Silový trénink celého těla s postupnou zátěží', 'Jóga, dechová cvičení'],
      avoid: ['Bazén při zavedeném portu, katétru nebo nízkých bílých krvinkách', 'Skoky a nárazy při kostních metastázách', 'Trénink při horečce'],
      doctor: 'Před začátkem proberte s onkologem krevní obraz, srdeční funkce (po některých chemoterapiích) a případné metastázy.'
    },
    redFlags: ['Horečka nad 38 °C', 'Nová bolest kostí', 'Otok končetiny', 'Výrazná dušnost nebo bušení srdce'],
    caps: { maxPct: 75, maxRPE: 7, setsMult: 0.8, restMult: 1.2 },
    rules: { no: [], mod: ['heavy', 'impactHigh', 'hiit', 'water', 'sprint'], why: 'Zátěž přizpůsobte aktuálnímu stavu a krevnímu obrazu; při kostních metastázách vynechte dopady.' },
    planSwap: { S_MAX: 'S_GEN', E5: 'E3', RSA: 'E1', X: 'C' },
    planNote: 'Onkologie: intenzitu přizpůsobte dni, ve slabších dnech jen chůze.',
    profile: {
      desc: 'Pohyb během a po onkologické léčbě snižuje únavu, úzkost a depresi, zlepšuje fyzickou kondici a u některých nádorů souvisí s nižším rizikem návratu nemoci.',
      layman: '💡 V praxi: Cvičte podle toho, jak se ten den cítíte. I krátká procházka má smysl. Posilování je bezpečné i při lymfedému, zátěž zvyšujte postupně.',
      exNote: '🎗️ Onkologie: postupná zátěž, ve slabších dnech jen lehce. Při kostních metastázách bez dopadů.',
      badges: ['3× týdně 30 min', 'Síla 2× týdně', 'Podle dne', 'Konzultace s onkologem'],
      protMult: 1.0, protFloor: 1.2, recMult: 1.25,
      micros: [
        ['Bílkoviny', '1,0–1,5 g/kg', 'Prevence úbytku svalů během léčby (ESPEN)'],
        ['Vitamín D', 'podle hladiny v krvi', 'Častý nedostatek'],
        ['Doplňky stravy', 'jen po domluvě s onkologem', 'Některé (např. vysoké dávky antioxidantů, třezalka) mohou ovlivnit léčbu']
      ],
      tips: { subtitle: 'Onkologie: udržet hmotnost a svaly', tips: [
        'Během léčby je hlavní cíl nehubnout a neztrácet svaly; při nechutenství menší a častější porce.',
        'Bílkoviny 1,0–1,5 g/kg denně (ESPEN), zdroje i z mléčných výrobků a vajec.',
        'Při nízkých bílých krvinkách dbejte na hygienu potravin (dobře tepelně upravené maso a vejce).',
        'Po léčbě platí doporučení pro prevenci: hodně zeleniny, luštěnin, celozrnných výrobků, málo uzenin a alkoholu.'
      ] }
    },
    sources: ['Campbell, K. L. a kol. (2019). Exercise guidelines for cancer survivors: consensus statement from international multidisciplinary roundtable. Med Sci Sports Exerc 51(11).', 'Muscaritoli, M. a kol. (2021). ESPEN practical guideline: clinical nutrition in cancer. Clin Nutr 40(5).']
  }
};

// Obecné varovné signály, kdy cvičení ihned ukončit (platí pro všechny)
const GLOBAL_RED_FLAGS = [
  'Bolest, tlak nebo pálení na hrudi, šířící se do ruky, krku nebo čelisti',
  'Dušnost nepřiměřená zátěži, která po zastavení neodezní',
  'Závrať, mdloba, náhlá slabost nebo poruchy řeči či vidění',
  'Nepravidelný nebo nečekaně rychlý tep',
  'Ostrá bolest kloubu, svalu nebo šlachy (ne běžná svalová únava)',
  'Horečka nebo celková nemoc: netrénujte, dokud neodezní'
];

// ============================================================================
// DOPLNĚNÍ PROFILŮ, VÝŽIVOVÝCH TIPŮ A PRAVIDEL CVIKŮ PRO NOVÉ SKUPINY
// ============================================================================
(function registerConditions() {
  Object.entries(CONDITION_INFO).forEach(([key, info]) => {
    const p = info.profile;
    if (p && !PROFILES[key]) {
      const base = {
        desc: p.desc, layman: p.layman, exNote: p.exNote, badges: p.badges,
        protMult: p.protMult, recMult: p.recMult, micros: p.micros, protCap: p.protCap, protFloor: p.protFloor
      };
      PROFILES[key] = {
        male: { ...base, title: 'Muž – ' + info.label },
        female: { ...base, title: 'Žena – ' + info.label }
      };
    }
    if (p && p.tips && !NUTRI_TIPS[key]) NUTRI_TIPS[key] = p.tips;
    if (!EX_RULES[key]) EX_RULES[key] = { avoid: [], caution: [], why: (info.rules && info.rules.why) || '' };
  });
  // Starší profily dostanou nový popisek osteoporózy
  if (PROFILES.bone) {
    PROFILES.bone.male.title = 'Muž – Osteopenie / osteoporóza';
    PROFILES.bone.female.title = 'Žena – Osteopenie / osteoporóza';
  }
})();

// Vhodnost cviku pro danou skupinu: 'no' (nevhodné), 'mod' (s úpravou) nebo null (vhodné)
function exerciseStatusFor(ex, condKey) {
  const info = CONDITION_INFO[condKey];
  const legacy = EX_RULES[condKey] || EX_RULES.standard;
  const flags = EX_FLAGS[ex.name] || [];
  const out = { status: null, reasons: [] };
  if (!info) return out;
  const rules = info.rules || { no: [], mod: [] };
  const noFlags = flags.filter(f => (rules.no || []).includes(f));
  const modFlags = flags.filter(f => (rules.mod || []).includes(f));
  if (legacy.avoid.includes(ex.name) || noFlags.length || (rules.pillarNo || []).includes(ex.pillar)) {
    out.status = 'no';
    out.reasons = noFlags.map(f => FLAG_LABEL[f]);
  } else if (legacy.caution.includes(ex.name) || modFlags.length || (rules.pillarMod || []).includes(ex.pillar)) {
    out.status = 'mod';
    out.reasons = modFlags.map(f => FLAG_LABEL[f]);
  }
  return out;
}
