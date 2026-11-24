// Performance Lab · 22 sportů, zóny, testy, tréninkové jednotky, pravidla cviků, zdroje
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

// ============================================================================
// DATABÁZE SPORTŮ
// abilities: relativní nárok sportu na pilíře 0–100 (odborný odhad podle literatury,
//            ne změřená hodnota). vo2: typické rozpětí VO2max elitních sportovců
//            v ml/kg/min [muži, ženy] (přehled Topend Sports opřený o Saltin & Åstrand 1967,
//            Bassett & Howley 2000, Lucia 2001; u sportů označených approx: true jde
//            o hrubý odhad z menšího počtu studií).
// ============================================================================
const SPORT_DB = {
  sprint: {
    name: 'Sprint (100–400 m)', cat: 'sprint', group: 'Atletika',
    abilities: { s: 85, e: 35, x: 98, a: 70, c: 75 },
    vo2: [[50, 60], [45, 55]], approx: true,
    energy: 'Na 100 m převažuje ATP-CP a glykolýza, aerobní podíl roste s délkou trati: na 400 m tvoří asi 40 % energie (Duffield 2004–2005).',
    demands: 'Výkon trvá 10–50 s. Rozhoduje start, akcelerace, maximální rychlost a u 400 m tolerance laktátu.',
    how: [
      'Maximální rychlost: úseky 20–60 m na 95–100 %, pauza 1 minuta na každých 10 m úseku (3–8 min).',
      'Síla a výbušnost: dřep, mrtvý tah, přemístění, odrazy a skoky; 2–3× týdně v přípravném období.',
      'Pro 200–400 m speciální vytrvalost: 150–300 m úseky ve vysoké intenzitě s úplným odpočinkem.',
      'Aerobní základ jen v nízké intenzitě (tempové běhy 100–200 m na 60–70 %), aby nebrzdil rychlost.'
    ],
    tests: ['sprint20', 'cmj', 'rm_squat'],
    injuries: ['Natažení hamstringů: Nordic Hamstring Curl, RDL, postupné zvyšování rychlosti.', 'Achillova šlacha a lýtka: výpony, kotníkové odrazy.'],
    nutri: 'Denně spíš 3–6 g/kg sacharidů podle objemu, důraz na bílkoviny 1,6–2,0 g/kg a dostatek energie pro sílu.'
  },
  middle: {
    name: 'Střední tratě (800–1 500 m)', cat: 'middle', group: 'Atletika',
    abilities: { s: 60, e: 85, x: 70, a: 50, c: 65 },
    vo2: [[70, 80], [60, 70]], approx: true,
    energy: 'Na 800 m tvoří aerobní metabolismus asi 60–70 % energie, na 1 500 m asi 77–86 % (Duffield 2005). Potřeba vysokého VO2max i rychlosti.',
    demands: 'Závod trvá 1:40–4:30 min, intenzita nad VO2max s vysokou koncentrací laktátu (často nad 15 mmol/l).',
    how: [
      'Aerobní základ v I1–I2 tvoří většinu objemu, 1–2 dlouhé klidné běhy týdně.',
      'Intervaly I4–I5: 5–6 × 1 000 m nebo 4 × 4 min, pauza 2–3 min.',
      'Závodní tempo a laktátová tolerance (I6): 4–6 × 300–400 m, pauza 3–5 min.',
      'Síla 1–2× týdně a rychlostní úseky 6–8 × 80 m pro ekonomiku běhu.'
    ],
    tests: ['cooper', 'sprint20', 'cmj'],
    injuries: ['Achillova šlacha a holeně: postupné zvyšování objemu (ne víc než o 10 % týdně), výpony.', 'Hamstringy: Nordic Hamstring Curl.'],
    nutri: 'Při 1–2 h tréninku denně 6–8 g/kg sacharidů, po intervalech rychlé doplnění 1–1,2 g/kg/h.'
  },
  marathon: {
    name: 'Vytrvalostní běh (10 km – maraton)', cat: 'endurance', group: 'Atletika',
    abilities: { s: 45, e: 98, x: 45, a: 35, c: 60 },
    vo2: [[70, 80], [60, 70]],
    energy: 'Přes 95 % energie z aerobního metabolismu. O výkonu rozhoduje VO2max, laktátový práh a běžecká ekonomika (Bassett & Howley 2000).',
    demands: 'Závod 30 min až 4 h, typicky na 75–90 % HRmax. Při maratonu hrozí vyčerpání glykogenu kolem 30. km.',
    how: [
      'Kolem 80 % tréninku v nízké intenzitě I1–I2 a 20 % v I3–I5 (polarizovaný model, Seiler 2010).',
      'Prahový trénink I3: 3–4 × 8–12 min, pauza 1–2 min, nebo 20–40 min tempový běh.',
      'Dlouhý běh 90–150 min v I1–I2 jednou týdně, u maratonu nácvik pití a jídla za běhu.',
      'Síla 1–2× týdně (dřep, výpony, core) zlepšuje ekonomiku běhu a chrání šlachy.'
    ],
    tests: ['cooper', 'resthr', 'rm_squat'],
    injuries: ['Přetížení holení a Achillovy šlachy: týdenní objem zvyšujte nejvýše o 10 %.', 'Únavové zlomeniny: hlídejte dostupnost energie a vápník.'],
    nutri: 'Podle objemu 5–10 g/kg sacharidů denně, při závodě nad 2,5 h až 90 g sacharidů za hodinu. Před maratonem sacharidová superkompenzace.'
  },
  cycling: {
    name: 'Silniční cyklistika', cat: 'endurance', group: 'Vytrvalostní',
    abilities: { s: 55, e: 98, x: 50, a: 25, c: 55 },
    vo2: [[70, 84], [60, 72]],
    energy: 'Převážně aerobní. Profesionálové jezdí 25–35 h týdně, většinou v nízké intenzitě (Lucia 2001).',
    demands: 'Závody 1–6 h, krátké nástupy a stoupání vysoko nad prahem. Řídit intenzitu je nejpřesnější podle výkonu ve wattech.',
    how: [
      'Dlouhé jízdy v I1–I2 (2–5 h) tvoří základ, kadence 85–95 ot./min.',
      'Prahové intervaly I3–I4: 2–3 × 15–20 min nebo 4–6 × 8 min.',
      'VO2max intervaly I5: 5 × 4–5 min nebo 30/15 s bloky.',
      'Síla v posilovně 1–2× týdně (dřep, mrtvý tah, výpady) a mobilita kyčlí a hrudní páteře.'
    ],
    tests: ['cooper', 'resthr', 'rm_squat'],
    injuries: ['Bolest kolen a beder: správné nastavení kola, síla hýždí a core.', 'Nízká kostní hustota: na kole kost nezatížíte, přidejte silový trénink a odrazy.'],
    nutri: 'Při 3+ h denně 8–12 g/kg sacharidů. Na jízdu nad 2,5 h až 90 g sacharidů za hodinu (nápoje, gely, tyčinky).'
  },
  swimming: {
    name: 'Plavání', cat: 'endurance', group: 'Vytrvalostní',
    abilities: { s: 65, e: 88, x: 55, a: 30, c: 80 },
    vo2: [[65, 72], [58, 66]],
    energy: 'Závody trvají 21 s až 15 min, takže podle tratě převažuje anaerobní i aerobní složka. Technika rozhoduje víc než v běhu.',
    demands: 'Maximální tepová frekvence v plavání je asi o 12 tepů nižší než při běhu (DiCarlo 1991), zóny proto počítejte z plavecké HRmax.',
    how: [
      'Technika a aerobní objem v I1–I2 (dlouhé série 200–400 m s krátkou pauzou).',
      'Prahové série I3–I4: 10–20 × 100 m s pauzou 10–20 s.',
      'Rychlost: 25–50 m sprinty na maximum s dlouhou pauzou.',
      'Suchá příprava: tahy, core, rotátory ramen, mobilita hrudní páteře.'
    ],
    tests: ['resthr', 'cmj', 'balance'],
    injuries: ['Plavecké rameno: Face Pulls, zevní rotace, posílení lopatkových svalů.', 'Bederní páteř u motýlka a prsou: core a mobilita kyčlí.'],
    nutri: 'Při dvoufázových trénincích 6–10 g/kg sacharidů. Ve vodě se špatně vnímá žízeň, pijte i mezi sériemi.'
  },
  triathlon: {
    name: 'Triatlon', cat: 'endurance', group: 'Vytrvalostní',
    abilities: { s: 55, e: 98, x: 45, a: 30, c: 70 },
    vo2: [[68, 76], [60, 70]],
    energy: 'Převážně aerobní, olympijský triatlon trvá asi 1:50–2:10 h, Ironman 8–17 h.',
    demands: 'Tři disciplíny s vlastními zónami: plavecká HRmax je nejnižší, běžecká nejvyšší.',
    how: [
      'Polarizované rozložení: kolem 80 % objemu v I1–I2 ve všech třech disciplínách.',
      'Jedna klíčová kvalitní jednotka týdně pro každou disciplínu (intervaly I3–I5).',
      'Kombinované tréninky kolo + běh (přechod, „brick“) jednou týdně.',
      'Síla 1–2× týdně, hlavně kyčle, core a ramena.'
    ],
    tests: ['cooper', 'resthr', 'balance'],
    injuries: ['Přetížení z velkého objemu: plánujte odlehčovací týden každý 3.–4. týden.', 'Rameno a Achillova šlacha: preventivní cviky z databáze.'],
    nutri: 'Vysoký objem 8–12 g/kg sacharidů. V závodě nad 2,5 h až 90 g sacharidů za hodinu a sodík při velkém pocení.'
  },
  xcski: {
    name: 'Běh na lyžích', cat: 'endurance', group: 'Vytrvalostní',
    abilities: { s: 65, e: 98, x: 50, a: 35, c: 80 },
    vo2: [[70, 85], [60, 75]],
    energy: 'Sport s nejvyššími naměřenými hodnotami VO2max, zapojuje horní i dolní polovinu těla.',
    demands: 'Závody 3 min (sprint) až 2 h, časté změny terénu a intenzity, výstupy nad prahem.',
    how: [
      'Velký objem v I1–I2 (kolečkové lyže, chůze s holemi do kopce, kolo).',
      'Intervaly do kopce I4: 4–6 × 4–6 min.',
      'Síla horní poloviny: shyby, SkiErg, tahy, core.',
      'Technika a koordinace na lyžích, rovnováha na jedné noze.'
    ],
    tests: ['cooper', 'resthr', 'balance'],
    injuries: ['Bederní páteř a ramena: core, Face Pulls.', 'Zátěžové astma u vytrvalců v mrazu: rozcvičení, dýchání nosem v nízké intenzitě.'],
    nutri: 'V přípravě 6–10 g/kg sacharidů, v mrazu vyšší energetický výdej i potřeba tekutin.'
  },
  rowing: {
    name: 'Veslování', cat: 'endurance', group: 'Vytrvalostní',
    abilities: { s: 80, e: 92, x: 60, a: 20, c: 70 },
    vo2: [[68, 75], [58, 68]],
    energy: 'Závod na 2 000 m trvá 5,5–8 min; aerobní podíl se odhaduje na 70–85 %. Veslaři mají velmi vysoké absolutní VO2max (přes 6 l/min).',
    demands: 'Velká síla v každém záběru i vysoká vytrvalost, závod probíhá většinou nad prahem.',
    how: [
      'Objem v I1–I2 na vodě nebo trenažéru (60–90 min, nízká frekvence záběrů).',
      'Intervaly I4–I5: 4–6 × 1 000 m nebo 8 × 500 m.',
      'Síla 2–3× týdně: mrtvý tah, dřep, přítahy, core.',
      'Technika záběru a mobilita hrudní páteře a kyčlí.'
    ],
    tests: ['rm_squat', 'resthr', 'cooper'],
    injuries: ['Bederní páteř: technika, síla zadního řetězce a core.', 'Únavové zlomeniny žeber: postupné zvyšování objemu.'],
    nutri: 'Vysoký výdej, 6–10 g/kg sacharidů; u lehkých vah hlídejte dostupnost energie.'
  },
  football: {
    name: 'Fotbal', cat: 'team', group: 'Kolektivní',
    abilities: { s: 70, e: 82, x: 85, a: 90, c: 80 },
    vo2: [[55, 65], [50, 60]],
    energy: 'Kombinace aerobního a anaerobního metabolismu; většinu času hráč klusá, rozhodují ale sprinty a souboje.',
    demands: 'Za zápas elitní hráč uběhne 10–13 km, průměrná tepová frekvence kolem 85 % HRmax (Bangsbo 2006).',
    how: [
      'Vysoce intenzivní intervaly I4–I5 nebo malé hry (4–6 × 4 min) zvyšují VO2max.',
      'Opakované sprinty (RSA): 2 × 6 × 30–40 m, pauza 20–25 s.',
      'Síla 2× týdně v přípravě, 1× týdně v sezóně; Nordic Hamstring Curl jako prevence.',
      'Rychlost, brzdění a změny směru s míčem i bez něj.'
    ],
    tests: ['sprint20', 'cmj', 'cooper'],
    injuries: ['Hamstringy: Nordic Hamstring Curl snižuje počet natažení asi o polovinu.', 'Koleno (ACL) a kotník: program FIFA 11+, nácvik doskoku a brzdění.'],
    nutri: 'V den zápasu a den předtím 6–8 g/kg sacharidů, po zápase rychlé doplnění glykogenu a bílkoviny.'
  },
  hockey: {
    name: 'Lední hokej', cat: 'team', group: 'Kolektivní',
    abilities: { s: 82, e: 78, x: 92, a: 90, c: 85 },
    vo2: [[52, 62], [48, 58]],
    energy: 'Střídání trvá asi 30–80 s v téměř maximální intenzitě; zatěžuje ATP-CP i glykolýzu, aerobní systém urychluje zotavení mezi střídáními (Vigh-Larsen 2022).',
    demands: 'Hráč odehraje 15–25 min čistého času, tepová frekvence při střídání stoupá k maximu.',
    how: [
      'Intervaly 30–45 s maximálně + 90–150 s pauza, 8–12 opakování (napodobují střídání).',
      'Aerobní základ v létě (kolo, běh I1–I2), pro rychlejší zotavení mezi střídáními.',
      'Síla a výbušnost: dřep, výpady, bruslařské skoky, přemístění.',
      'Stabilita kyčlí a třísel, rovnováha na jedné noze.'
    ],
    tests: ['sprint20', 'cmj', 'rm_squat'],
    injuries: ['Třísla a kyčle: posilování adduktorů (Copenhagen plank), mobilita.', 'Ramena a otřesy mozku: síla krku a ramen.'],
    nutri: 'V zápasový den 6–8 g/kg sacharidů, během zápasu sportovní nápoj, velké ztráty potu ve výstroji.'
  },
  basketball: {
    name: 'Basketbal', cat: 'team', group: 'Kolektivní',
    abilities: { s: 72, e: 72, x: 92, a: 92, c: 85 },
    vo2: [[50, 60], [45, 55]],
    energy: 'Přerušovaná vysoce intenzivní zátěž s častými skoky a změnami směru.',
    demands: 'Za zápas hráč urazí 5–6 km při průměrné intenzitě kolem 85 % HRmax, tedy nad laktátovým prahem (Stojanović 2018).',
    how: [
      'Intervaly I4–I5 a opakované sprinty s obrátkami.',
      'Plyometrie 2× týdně (výskoky, odrazy z jedné nohy), postupně.',
      'Síla dolních končetin a core; brzdění a doskoky.',
      'Agility s reakcí na podnět (obrana, zrcadlení).'
    ],
    tests: ['cmj', 'sprint20', 'balance'],
    injuries: ['Kotník: rovnováha na jedné noze, posílení peroneálních svalů.', 'Skokanské koleno: postupná plyometrie, excentrické dřepy.'],
    nutri: '5–8 g/kg sacharidů podle objemu, v zápasový den lehce stravitelné sacharidy 3–4 h před.'
  },
  volleyball: {
    name: 'Volejbal', cat: 'team', group: 'Kolektivní',
    abilities: { s: 70, e: 55, x: 95, a: 80, c: 88 },
    vo2: [[45, 55], [40, 50]],
    energy: 'Krátké výbušné akce (výskoky, přesuny) s delšími pauzami; převládá ATP-CP.',
    demands: 'Rozhoduje výška výskoku a jeho opakování během zápasu, typické jsou desítky výskoků za utkání.',
    how: [
      'Plyometrie a výskoky s měkkým doskokem, objem hlídejte (počet odrazů za týden).',
      'Síla: dřep, mrtvý tah, Hip Thrust, výpony.',
      'Ramena: rotátory, Face Pulls, stabilita lopatky.',
      'Rychlé přesuny do stran a reakce.'
    ],
    tests: ['cmj', 'sprint20', 'balance'],
    injuries: ['Skokanské koleno (patelární šlacha): excentrické dřepy na šikmé desce, dávkování skoků.', 'Rameno smečaře: zevní rotace, Face Pulls.'],
    nutri: '4–7 g/kg sacharidů, bílkoviny 1,4–1,8 g/kg; v turnaji malé svačiny mezi zápasy.'
  },
  handball: {
    name: 'Házená', cat: 'team', group: 'Kolektivní',
    abilities: { s: 80, e: 75, x: 90, a: 88, c: 82 },
    vo2: [[52, 60], [45, 55]], approx: true,
    energy: 'Přerušovaná zátěž s častými souboji, sprinty a hody; aerobní i anaerobní složka.',
    demands: 'Hráč v poli uběhne kolem 4–5 km za zápas s mnoha změnami směru a fyzickými kontakty (Póvoas 2012, orientačně).',
    how: [
      'Intervaly I4–I5 a opakované sprinty s obrátkami.',
      'Síla celého těla a odolnost v soubojích; hody medicinbalem.',
      'Rameno: rotátory a lopatka (prevence u střelců).',
      'Agility a doskoky.'
    ],
    tests: ['cmj', 'sprint20', 'rm_squat'],
    injuries: ['Rameno: zevní rotace, Face Pulls.', 'Koleno (ACL) a kotník: nácvik doskoku, rovnováha.'],
    nutri: '5–8 g/kg sacharidů, bílkoviny 1,6–2,0 g/kg v přípravě.'
  },
  floorball: {
    name: 'Florbal', cat: 'team', group: 'Kolektivní',
    abilities: { s: 65, e: 80, x: 85, a: 92, c: 85 },
    vo2: [[55, 62], [48, 55]], approx: true,
    energy: 'Krátká intenzivní střídání s pauzami na střídačce, podobně jako v hokeji.',
    demands: 'Časté sprinty, obrátky a pohyb v podřepu; tepová frekvence při střídání vysoko nad prahem (orientačně podle menšího počtu studií).',
    how: [
      'Intervaly 30–60 s / 60–120 s pauza napodobující střídání.',
      'Agility a reakce s hokejkou.',
      'Síla dolních končetin a stabilita kyčlí v podřepu.',
      'Mobilita hrudní páteře a kyčlí (rotace při střelbě).'
    ],
    tests: ['sprint20', 'cmj', 'balance'],
    injuries: ['Kotník a koleno: rovnováha, nácvik brzdění.', 'Třísla a bedra: adduktory, core.'],
    nutri: '5–7 g/kg sacharidů, při turnajích svačiny se sacharidy mezi zápasy.'
  },
  tennis: {
    name: 'Tenis', cat: 'racket', group: 'Raketové',
    abilities: { s: 70, e: 80, x: 92, a: 95, c: 90 },
    vo2: [[55, 65], [50, 60]],
    energy: 'Výměny trvají obvykle 5–10 s, pauzy jsou delší než hra; zápas trvá 1–5 h, takže aerobní kapacita urychluje zotavení mezi výměnami (Fernandez 2006).',
    demands: 'Vysoký počet startů, brzdění a změn směru, rotační síla trupu při úderech.',
    how: [
      'Krátké intervaly 10–20 s / 20–40 s pauza s pohybem jako na kurtu.',
      'Aerobní základ v I1–I2 2× týdně v přípravě.',
      'Rotační síla: hody medicinbalem, Pallof Press.',
      'Rameno a loket: rotátory, Face Pulls, síla předloktí.'
    ],
    tests: ['sprint20', 'cmj', 'balance'],
    injuries: ['Tenisový loket a rameno: excentrika předloktí, zevní rotace.', 'Kotník a koleno: rovnováha, brzdění.'],
    nutri: 'Při zápase nad 90 min nápoj se sacharidy (30–60 g/h) a sodíkem, v horku hlídejte hmotnost před a po.'
  },
  badminton: {
    name: 'Badminton', cat: 'racket', group: 'Raketové',
    abilities: { s: 65, e: 78, x: 92, a: 98, c: 92 },
    vo2: [[55, 65], [48, 58]], approx: true,
    energy: 'Krátké výměny (kolem 5–10 s) s vysokou frekvencí úderů a výpadů; vysoký nárok na aerobní zotavení (Phomsoupha 2015, orientačně).',
    demands: 'Velmi rychlé výpady, skoky a změny směru; tepová frekvence při zápase vysoko, často nad 85 % HRmax.',
    how: [
      'Stínový badminton v intervalech 15–30 s.',
      'Výpady s odrazem zpět, plyometrie dolních končetin.',
      'Aerobní základ a krátké intervaly.',
      'Rameno a zápěstí: rotátory, předloktí.'
    ],
    tests: ['sprint20', 'cmj', 'balance'],
    injuries: ['Achillova šlacha a koleno při výpadech: výpony, excentrické dřepy.', 'Rameno: rotátory.'],
    nutri: '5–7 g/kg sacharidů, v turnaji malé porce sacharidů mezi zápasy.'
  },
  combat: {
    name: 'Bojové sporty (box, judo, MMA)', cat: 'combat', group: 'Úpolové',
    abilities: { s: 85, e: 80, x: 88, a: 85, c: 88 },
    vo2: [[55, 65], [50, 60]],
    energy: 'Box: kola 2–3 min; judo: akce 20–30 s s krátkými pauzami. Vysoký podíl glykolýzy i aerobního zotavení (Franchini 2011).',
    demands: 'Opakované výbušné akce, izometrická síla úchopu, tolerance laktátu, kontrola hmotnosti.',
    how: [
      'Intervaly podle formátu zápasu (např. 3 × 3 min / 1 min pauza).',
      'Síla a výbušnost: přemístění, hody medicinbalem, tahy, úchop.',
      'Aerobní základ v I1–I2 pro zotavení mezi koly.',
      'Krk, ramena a core pro odolnost.'
    ],
    tests: ['cmj', 'rm_squat', 'resthr'],
    injuries: ['Rychlé shazování váhy: riziko dehydratace a RED-S, plánujte hmotnost dlouhodobě.', 'Ramena a krk: posilování a mobilita.'],
    nutri: 'Vyhněte se rychlému shazování vody před vážením. Bílkoviny 1,6–2,2 g/kg při hubnutí, sacharidy 4–7 g/kg.'
  },
  powerlifting: {
    name: 'Silový trojboj', cat: 'strength', group: 'Silové',
    abilities: { s: 98, e: 30, x: 70, a: 20, c: 60 },
    vo2: [[40, 50], [35, 45]],
    energy: 'Pokus trvá několik sekund, převažuje ATP-CP. Aerobní kondice slouží zdraví a zotavení mezi sériemi.',
    demands: 'Maximální síla v dřepu, benchpressu a mrtvém tahu; technika a nervosvalová koordinace.',
    how: [
      'Těžké série 1–5 opakování na 80–95 % 1RM s pauzou 3–5 min.',
      'Objemové bloky 6–10 opakování na 65–80 % pro svalovou hmotu.',
      'Periodizace v blocích (objem → síla → vyladění před soutěží).',
      'Mobilita kyčlí a hrudní páteře, lehký aerobní pohyb 2× týdně.'
    ],
    tests: ['rm_squat', 'cmj', 'resthr'],
    injuries: ['Bedra: technika, core, postupná progrese zátěže.', 'Rameno při benchpressu: tahy v poměru 1 : 1 až 2 : 1 k tlakům.'],
    nutri: 'Bílkoviny 1,6–2,2 g/kg, sacharidy 3–6 g/kg; při shazování do váhové kategorie postupně.'
  },
  weightlifting: {
    name: 'Vzpírání', cat: 'strength', group: 'Silové',
    abilities: { s: 95, e: 30, x: 98, a: 30, c: 85 },
    vo2: [[40, 50], [35, 45]],
    energy: 'Trh a nadhoz trvají 1–3 s, rozhoduje rychlost vývoje síly a technika.',
    demands: 'Maximální výkon (watty) v trojextenzi, mobilita kotníků, kyčlí a ramen.',
    how: [
      'Technika olympijských zvedů 4–6× týdně s nižší zátěží.',
      'Síla: čelní a zadní dřep, tahy na 80–95 %.',
      'Výbušnost: skoky, přemístění ze visu.',
      'Mobilita kotníků, hrudní páteře a ramen.'
    ],
    tests: ['cmj', 'rm_squat', 'balance'],
    injuries: ['Zápěstí, lokty a ramena: mobilita a postupná zátěž.', 'Bedra: technika a core.'],
    nutri: 'Bílkoviny 1,6–2,2 g/kg, sacharidy 4–7 g/kg při vysokém objemu.'
  },
  crossfit: {
    name: 'CrossFit / funkční trénink', cat: 'crossfit', group: 'Smíšené',
    abilities: { s: 85, e: 80, x: 80, a: 60, c: 80 },
    vo2: [[50, 60], [45, 52]], approx: true,
    energy: 'Kombinace síly, gymnastiky a metabolických bloků 5–20 min; zatěžuje všechny energetické systémy.',
    demands: 'Vysoká intenzita blízko maxima, často síla ve stavu únavy. Riziko technických chyb při únavě.',
    how: [
      'Síla 2–3× týdně odděleně od metabolických bloků.',
      'Metabolické bloky I4–I6 maximálně 2–3× týdně, ne každý den.',
      'Aerobní základ (veslo, kolo) v I1–I2 pro zotavení.',
      'Gymnastika a mobilita ramen, kyčlí a kotníků.'
    ],
    tests: ['rm_squat', 'cmj', 'cooper'],
    injuries: ['Ramena a bedra při únavě: kvalita před rychlostí.', 'Rhabdomyolýza u nováčků: postupné zvyšování objemu.'],
    nutri: '5–7 g/kg sacharidů, bílkoviny 1,6–2,0 g/kg.'
  },
  climbing: {
    name: 'Sportovní lezení', cat: 'climbing', group: 'Smíšené',
    abilities: { s: 85, e: 65, x: 70, a: 40, c: 92 },
    vo2: [[45, 55], [40, 50]], approx: true,
    energy: 'Boulder je převážně anaerobní (krátké výstupy), obtížnost kombinuje aerobní a anaerobní práci předloktí.',
    demands: 'Síla prstů a úchopu vzhledem k tělesné hmotnosti, síla tahu, technika a flexibilita kyčlí.',
    how: [
      'Síla prstů na fingerboardu 2× týdně až po 1–2 letech lezení.',
      'Tahová síla: shyby, přítahy; vyvážit tlakovými cviky a rotátory.',
      'Lezecká vytrvalost: delší cesty, intervaly na stěně.',
      'Mobilita kyčlí a ramen, core.'
    ],
    tests: ['cmj', 'balance', 'resthr'],
    injuries: ['Prstové kladky: postupná zátěž, žádný fingerboard u začátečníků.', 'Rameno: tlakové cviky, Face Pulls.'],
    nutri: 'Hlídejte dostupnost energie, lezci často snižují hmotnost. Bílkoviny 1,4–1,8 g/kg.'
  },
  health: {
    name: 'Zdravotní pohyb', cat: 'health', group: 'Zdraví',
    abilities: { s: 65, e: 70, x: 35, a: 45, c: 85 },
    vo2: [[35, 50], [30, 45]],
    energy: 'Cílem je zdraví, ne závodní výkon. VO2max patří mezi nejsilnější ukazatele dlouhověkosti.',
    demands: 'Doporučení WHO: 150–300 min středně intenzivní nebo 75–150 min intenzivní aerobní aktivity týdně a síla 2× týdně.',
    how: [
      'Svižná chůze, kolo nebo plavání v I1–I2 většinu dnů v týdnu.',
      'Silový trénink celého těla 2× týdně (8–12 opakování).',
      'Rovnováha a mobilita, u starších lidí prevence pádů.',
      'Postupnost: zátěž zvyšujte po malých krocích každé 1–2 týdny.'
    ],
    tests: ['balance', 'chair', 'resthr'],
    injuries: ['Přetížení z příliš rychlého začátku: postupné zvyšování.', 'Pády: rovnováha a síla nohou.'],
    nutri: 'Pestrá strava podle obecných doporučení, bílkoviny 1,0–1,2 g/kg, u starších lidí spíš víc.'
  }
};

// ============================================================================
// INTENZITNÍ ZÓNY – Olympiatoppen I-scale (verze 2024)
// ============================================================================
const ZONES = [
  { id: 'I1', name: 'Velmi lehká', hr: [55, 72], vo2: '45–55 %', lac: '0,5–1,5', rpe: 'pod 11', talk: 'Mluvíte plynule celými větami.',
    purpose: 'Aerobní základ, regenerace, tuky jako palivo.', how: 'Souvislá zátěž 45 min a víc (běh), na kole i několik hodin.', example: '60 min klidného běhu nebo 2–3 h na kole.' },
  { id: 'I2', name: 'Lehká', hr: [72, 82], vo2: '55–72 %', lac: '1,0–2,0', rpe: 'do 13', talk: 'Mluvíte v kratších větách.',
    purpose: 'Rozvoj aerobní vytrvalosti a ekonomiky pohybu.', how: 'Souvislá zátěž 45 min až 3 h.', example: '75 min běhu nebo 2 h kola v rovnoměrném tempu.' },
  { id: 'I3', name: 'Středně těžká (prahová)', hr: [82, 87], vo2: '70–80 %', lac: '1,5–3,5', rpe: '13–14', talk: 'Mluvíte jen pár slov.',
    purpose: 'Posun laktátového prahu.', how: 'Intervaly 8–20 min, pauza asi 25 % délky úseku, celkem 20–90 min.', example: '3 × 10 min, pauza 2 min.' },
  { id: 'I4', name: 'Těžká', hr: [87, 92], vo2: '75–85 %', lac: 'bez pevné hranice', rpe: '15–16', talk: 'Mluvit nejde.',
    purpose: 'Výkon na prahu a nad ním, rozvoj VO2max.', how: 'Intervaly 3–10 min, pauza asi 50 % délky úseku, celkem 20–50 min.', example: '4 × 4 min, pauza 3 min (Helgerud 2007).' },
  { id: 'I5', name: 'Velmi těžká', hr: [92, 100], vo2: '85–100 %', lac: 'bez pevné hranice', rpe: '17–19', talk: 'Těžké dýchání.',
    purpose: 'Maximální aerobní výkon (VO2max).', how: 'Intervaly 30 s až 5 min, pauza 50–75 % délky úseku, celkem 15–30 min.', example: '2 × 10 × 30/15 s nebo 5 × 3 min.' },
  { id: 'I6–I8', name: 'Anaerobní a rychlostní', hr: null, vo2: '–', lac: 'maximální', rpe: '19–20', talk: '–',
    purpose: 'Laktátová tolerance (I6–I7) a maximální rychlost (I8).', how: 'Úseky 3 s až 2 min s dlouhou pauzou (2× až 10× déle než úsek). Tepová frekvence tu nestačí reagovat, řídí se časem a rychlostí.', example: '6 × 30 s, pauza 3 min; sprinty 6 × 30 m, pauza 3 min.' }
];

// ============================================================================
// VÝKONNOSTNÍ TESTY
// ============================================================================
const PERF_TESTS = {
  cooper: { name: 'Cooperův test (12 min běhu)', unit: 'm', step: 10, min: 500, max: 5000, better: 'higher',
    how: 'Na rovném okruhu běžte 12 minut co nejdál, po rozcvičení. Změřte uraženou vzdálenost.',
    source: 'Cooper 1968' },
  balance: { name: 'Stoj na jedné noze, zavřené oči', unit: 's', step: 1, min: 0, max: 120, better: 'higher',
    how: 'Bosí, ruce v bok, druhá noha zvednutá. Zavřete oči a měřte, dokud se nedotknete zemí nebo neotevřete oči. Nejlepší ze 3 pokusů.',
    source: 'Springer 2007' },
  chair: { name: 'Vstávání ze židle za 30 s', unit: 'opak.', step: 1, min: 0, max: 60, better: 'higher',
    how: 'Židle bez područek, ruce zkřížené na hrudi. Počítejte úplná vstání za 30 s. Určeno hlavně pro věk 60+.',
    source: 'Rikli & Jones 1999' },
  cmj: { name: 'Výskok s protipohybem (CMJ)', unit: 'cm', step: 0.5, min: 5, max: 100, better: 'higher',
    how: 'Ruce v bok, rychlý podřep a výskok. Měřte stejnou metodou (aplikace v mobilu, kontaktní podložka nebo křídou na zeď). Nejlepší ze 3 pokusů.',
    source: 'osobní progres' },
  sprint20: { name: 'Sprint 20 m', unit: 's', step: 0.01, min: 2, max: 8, better: 'lower',
    how: 'Start z polovysokého postoje, měření stopkami nebo aplikací. Nejlepší ze 3 pokusů, pauza 3 min.',
    source: 'osobní progres' },
  rm_squat: { name: 'Odhad 1RM dřep vůči hmotnosti', unit: '× hmotnost', step: 0.05, min: 0.2, max: 4, better: 'higher',
    how: 'Spočítejte 1RM v Mikronástrojích (váha × opakování) a vydělte vlastní hmotností. Testujte jen se zvládnutou technikou.',
    source: 'osobní progres' },
  resthr: { name: 'Klidová tepová frekvence', unit: 'tepů/min', step: 1, min: 30, max: 120, better: 'lower',
    how: 'Ráno po probuzení vleže, ještě před vstáváním. Průměr ze 3 dnů. Trvale zvýšená hodnota může znamenat únavu nebo nemoc.',
    source: 'osobní progres' }
};

// Cooper 1968: hranice [výborný, nadprůměrný, průměrný, podprůměrný] v metrech
const COOPER_NORMS = {
  male: [[29, [2800, 2400, 2200, 1600]], [39, [2700, 2300, 1900, 1500]], [49, [2500, 2100, 1700, 1400]], [200, [2400, 2000, 1600, 1300]]],
  female: [[29, [2700, 2200, 1800, 1500]], [39, [2500, 2000, 1700, 1400]], [49, [2300, 1900, 1500, 1200]], [200, [2200, 1700, 1400, 1100]]]
};
// Springer 2007: průměr nejlepšího ze 3 pokusů, zavřené oči (s)
const BALANCE_NORMS = [[39, 15.2], [49, 12.7], [59, 8.3], [69, 4.4], [79, 3.1], [200, 1.9]];
// Rikli & Jones 1999: běžné rozpětí počtu vstání za 30 s [muži, ženy]
const CHAIR_NORMS = [[64, [14, 19], [12, 17]], [69, [12, 18], [11, 16]], [74, [12, 17], [10, 15]], [79, [11, 17], [10, 15]], [84, [10, 15], [9, 14]], [89, [8, 14], [8, 13]], [200, [7, 12], [4, 11]]];

// ============================================================================
// KNIHOVNA TRÉNINKOVÝCH JEDNOTEK PRO TÝDENNÍ PLÁN
// load: energetická náročnost dne pro výživu (ACSM/AND 2016)
// ============================================================================
const SESSION_LIB = {
  E1:  { name: 'Aerobní základ', ex: ['Souvislý běh v zóně I2', 'Cyklistika v zóně I2', 'Plavání (kraul / znak v I2–I3)'], pillar: 'endurance', hard: false, min: [40, 70], zone: 'I1–I2', load: 'moderate',
         how: 'Souvislá zátěž v rozhovorovém tempu (běh, kolo, plavání, veslo podle sportu).' },
  E1L: { name: 'Dlouhá vytrvalostní jednotka', ex: ['Souvislý běh v zóně I2', 'Cyklistika v zóně I2', 'Nordic Walking (chůze s holemi)'], pillar: 'endurance', hard: false, min: [90, 150], zone: 'I1–I2', load: 'high',
         how: 'Dlouhá souvislá zátěž v nízké intenzitě, nácvik pití a jídla během výkonu.' },
  E3:  { name: 'Prahové intervaly', ex: ['Tempový běh na prahu ANP (I3)', 'Fartlek (hra s rychlostí v terénu)'], pillar: 'endurance', hard: true, min: [50, 70], zone: 'I3', load: 'moderate',
         how: '15 min rozcvičení, 3 × 10 min v I3 s pauzou 2 min, 10 min vyklusání.' },
  E4:  { name: 'Intervaly VO2max', ex: ['Norwegian 4×4 min HIIT (I4)', 'Výběhy mírného kopce (60–90 s)'], pillar: 'endurance', hard: true, min: [45, 60], zone: 'I4', load: 'moderate',
         how: '15 min rozcvičení, 4 × 4 min v I4 s pauzou 3 min, 10 min vyklusání.' },
  E5:  { name: 'Krátké intenzivní intervaly', ex: ['Krátké intervaly 30/30 s (Billat)', 'Assault / Air Bike (celé tělo)'], pillar: 'endurance', hard: true, min: [40, 55], zone: 'I5', load: 'moderate',
         how: '15 min rozcvičení, 2 série 10 × 30 s rychle / 15 s volně, mezi sériemi 3 min, vyklusání.' },
  RSA: { name: 'Opakované sprinty', ex: ['Opakované sprinty (RSA 6×40 m)', 'Start na 10–20 m (akcelerace)'], pillar: 'agility', hard: true, min: [40, 55], zone: 'I8 + I5', load: 'moderate',
         how: 'Rozcvičení, 2–3 série 6 × 20–40 m sprint s pauzou 20–25 s, mezi sériemi 4 min.' },
  S_MAX: { name: 'Maximální síla', pillar: 'strength', hard: true, min: [60, 75], zone: '80–90 % 1RM', load: 'moderate',
         how: '3–4 hlavní cviky, 3–5 sérií po 3–5 opakováních, pauza 3 min. Technika má přednost.' },
  S_HYP: { name: 'Síla a svalová hmota', pillar: 'strength', hard: true, min: [60, 75], zone: '65–80 % 1RM', load: 'moderate',
         how: '4–6 cviků, 3–4 série po 6–12 opakováních, pauza 1,5–2 min.' },
  S_GEN: { name: 'Obecná síla', pillar: 'strength', hard: false, min: [45, 60], zone: '60–75 % 1RM', load: 'moderate',
         how: 'Celé tělo: dřep, hip hinge, tlak, tah, core. 3 série po 8–12 opakováních.' },
  S_END: { name: 'Silová vytrvalost', pillar: 'strength', hard: false, min: [40, 50], zone: '50–65 % 1RM', load: 'light',
         how: 'Kruhový trénink 6–8 cviků po 12–15 opakováních, plynulé dýchání.' },
  S_MAINT: { name: 'Udržovací síla', pillar: 'strength', hard: false, min: [40, 50], zone: '75–85 % 1RM, malý objem', load: 'light',
         how: '2–3 hlavní cviky, 2–3 série po 3–5 opakováních. Udrží sílu v sezóně bez velké únavy.' },
  X:   { name: 'Výbušnost a plyometrie', pillar: 'explosive', hard: true, min: [40, 55], zone: 'maximální rychlost', load: 'light',
         how: 'Hned po rozcvičení: 4–6 cviků po 3–6 opakováních, úplná pauza 2–3 min. Kvalita, ne únava.' },
  A:   { name: 'Rychlost a agility', pillar: 'agility', hard: true, min: [40, 55], zone: 'I8 (úseky 3–8 s)', load: 'light',
         how: 'Akcelerace 10–20 m, brzdění, změny směru a reakce na podnět. Pauza 1 : 6 až 1 : 10.' },
  C:   { name: 'Koordinace, mobilita a prevence', pillar: 'coord', hard: false, min: [25, 40], zone: 'nízká', load: 'light',
         how: 'Rovnováha, core, mobilita kyčlí a hrudní páteře, preventivní cviky pro váš sport.' },
  SPEC:{ name: 'Sportovní trénink', tag: 'Sport', pillar: 'agility', hard: true, min: [75, 105], zone: 'podle cvičení', load: 'moderate',
         how: 'Technika, taktika a herní cvičení ve vašem sportu.' },
  MATCH:{ name: 'Zápas', tag: 'Zápas', pillar: 'agility', hard: true, min: [60, 120], zone: 'I4–I8', load: 'high',
         how: 'Utkání. Den předtím lehký trénink, den poté regenerace.' },
  RACE:{ name: 'Závod nebo test', tag: 'Závod', pillar: 'endurance', hard: true, min: [30, 180], zone: 'závodní', load: 'high',
         how: 'Závod nebo kontrolní test. 2–3 dny předtím snižte objem.' },
  REST:{ name: 'Volno / aktivní regenerace', tag: 'Volno', pillar: 'coord', hard: false, min: [0, 30], zone: 'I1', load: 'rest',
         how: 'Volno nebo lehká procházka, protažení, dechový trenažér.' }
};

// Pořadí jednotek podle priority pro typ sportu a období (bere se prvních N podle počtu dnů)
const PLAN_TEMPLATES = {
  endurance: { prep: ['E1L', 'E4', 'S_GEN', 'E1', 'E3', 'C'], comp: ['RACE', 'E4', 'E1', 'S_MAINT', 'E1', 'C'], trans: ['E1', 'C', 'S_END', 'E1'] },
  middle:    { prep: ['E1L', 'E4', 'S_GEN', 'E5', 'E1', 'C'], comp: ['RACE', 'E5', 'E1', 'S_MAINT', 'E3', 'C'], trans: ['E1', 'C', 'S_END', 'E1'] },
  sprint:    { prep: ['A', 'S_MAX', 'X', 'E1', 'S_HYP', 'C'], comp: ['RACE', 'A', 'X', 'S_MAINT', 'C', 'E1'], trans: ['E1', 'C', 'S_GEN', 'C'] },
  team:      { prep: ['SPEC', 'S_MAX', 'E4', 'SPEC', 'X', 'C'], comp: ['MATCH', 'SPEC', 'S_MAINT', 'A', 'SPEC', 'C'], trans: ['E1', 'C', 'S_GEN', 'E1'] },
  racket:    { prep: ['SPEC', 'S_GEN', 'A', 'E5', 'X', 'C'], comp: ['MATCH', 'SPEC', 'A', 'S_MAINT', 'SPEC', 'C'], trans: ['E1', 'C', 'S_GEN', 'E1'] },
  combat:    { prep: ['SPEC', 'S_MAX', 'E5', 'SPEC', 'X', 'E1'], comp: ['SPEC', 'MATCH', 'S_MAINT', 'E5', 'SPEC', 'C'], trans: ['E1', 'C', 'S_GEN', 'E1'] },
  strength:  { prep: ['S_HYP', 'S_MAX', 'S_HYP', 'S_MAX', 'C', 'E1'], comp: ['S_MAX', 'X', 'S_MAX', 'C', 'RACE', 'E1'], trans: ['S_GEN', 'E1', 'C', 'E1'] },
  crossfit:  { prep: ['S_MAX', 'E5', 'SPEC', 'E3', 'X', 'C'], comp: ['S_MAX', 'E5', 'SPEC', 'RACE', 'E1', 'C'], trans: ['E1', 'S_GEN', 'C', 'E1'] },
  climbing:  { prep: ['SPEC', 'S_MAX', 'SPEC', 'C', 'E1', 'S_HYP'], comp: ['SPEC', 'S_MAINT', 'SPEC', 'RACE', 'C', 'E1'], trans: ['E1', 'C', 'S_GEN', 'E1'] },
  health:    { prep: ['E1', 'S_GEN', 'C', 'E1', 'S_GEN', 'E1'], comp: ['E1', 'S_GEN', 'C', 'E1', 'S_GEN', 'E1'], trans: ['E1', 'S_GEN', 'C', 'E1'] }
};

// Denní sacharidy podle zátěže (ACSM/AND/DC 2016), g/kg
const CARB_BY_LOAD = {
  rest:     { label: 'Volno', range: [3, 5] },
  light:    { label: 'Lehká zátěž', range: [3, 5] },
  moderate: { label: 'Střední zátěž (~1 h)', range: [5, 7] },
  high:     { label: 'Vysoká zátěž (1–3 h)', range: [6, 10] },
  veryhigh: { label: 'Velmi vysoká (4+ h)', range: [8, 12] }
};

const DAY_NAMES = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];
// Rozložení tréninkových dnů v týdnu (0 = pondělí)
const DAY_PATTERNS = { 2: [1, 4], 3: [0, 2, 4], 4: [0, 1, 3, 5], 5: [0, 1, 3, 4, 5], 6: [0, 1, 2, 3, 4, 5] };

// ============================================================================
// OMEZENÍ CVIKŮ PODLE PROFILU (avoid = nevhodné, caution = s opatrností)
// ============================================================================
const EX_RULES = {
  bone: {
    avoid: ['Seskok a okamžitý výskok (Drop Jump)', 'Úder medicinbalem o zem (Slam)', 'Odhod medicinbalu přes hlavu vzad', 'Silové přemístění ze visu (Hang Clean)'],
    caution: ['Jednonožní poskoky vpřed (Bounds)', 'Výpady s přeskokem (Split Jumps)', 'Rumunský mrtvý tah (RDL)', 'Přítahy činky v předklonu', 'Kočka–kráva se segmentální kontrolou'],
    why: 'Tvrdé dopady a ohýbání páteře se zátěží zvyšují riziko zlomeniny obratle.'
  },
  stroke: {
    avoid: ['Seskok a okamžitý výskok (Drop Jump)', 'Silové přemístění ze visu (Hang Clean)', 'Mrtvý tah s Trap Barem', 'Zadní dřep s velkou činkou'],
    caution: ['Norwegian 4×4 min HIIT (I4)', 'Opakované sprinty (RSA 6×40 m)', 'Letmý sprint na 20 m (Flying Sprint)', 'Bench press s činkou / jednoručkami', 'Tlak nad hlavu ve stoji (OHP)'],
    why: 'Maximální zátěž svádí k zadržení dechu a prudkému nárůstu krevního tlaku. Intenzitu vždy konzultujte s lékařem.'
  },
  asthma: {
    avoid: [],
    caution: ['Norwegian 4×4 min HIIT (I4)', 'Opakované sprinty (RSA 6×40 m)', 'Krátké intervaly 30/30 s (Billat)', 'Assault / Air Bike (celé tělo)', 'Illinois Agility Run (slalom + rovinky)'],
    why: 'Prudký nástup vysoké intenzity může vyvolat zátěžové astma. Zařaďte až po 15 min postupného rozcvičení.'
  },
  hormonal: {
    avoid: [],
    caution: ['Seskok a okamžitý výskok (Drop Jump)', 'Silové přemístění ze visu (Hang Clean)'],
    why: 'Vyšší nárok na šlachy a klouby; zařazujte až po zvládnutí základních odrazů.'
  },
  pectus: { avoid: [], caution: [], why: '' },
  standard: { avoid: [], caution: [], why: '' }
};

// Jak cvik zlehčit nebo ztížit podle pohybového vzorce
const PATTERN_TIPS = {
  drep: ['Dřep na bednu nebo s oporou, menší hloubka, bez zátěže.', 'Pomalé spouštění 3 s, pauza dole, jednonožná varianta, vyšší zátěž.'],
  hinge: ['Kratší rozsah, lehká jednoručka, Hip Thrust místo tahu ze země.', 'Jednonožný RDL, pauza pod koleny, vyšší zátěž.'],
  tlak: ['Kliky o zeď nebo lavici, lehčí jednoručky, menší rozsah.', 'Pomalé spouštění, jednoruční varianta, vyšší zátěž.'],
  tah: ['Přítahy s gumou nebo na TRX s vyšším úhlem těla, stahování kladky.', 'Pauza v kontrakci, jednoruční varianta, zátěž na opasku.'],
  core: ['Kratší výdrž, opora o kolena, stabilní podložka.', 'Delší výdrž, nestabilní podložka, pohyb končetin.'],
  odraz: ['Nižší výška, odraz bez protipohybu, dopad na měkkou podložku.', 'Vyšší bedna, jednonožný odraz, rychlejší kontakt se zemí.'],
  lokomoce: ['Kratší úsek, nižší tempo, delší pauza.', 'Delší úsek, vyšší tempo, kratší pauza nebo kopec.']
};

// ============================================================================
// ZDROJE
// ============================================================================
const REFERENCES = [
  'Kinkorová, I. Aplikovaná výživa (přednáška, FTVS UK).',
  'Thomas, D. T., Erdman, K. A., Burke, L. M. (2016). Nutrition and Athletic Performance. Position of the Academy of Nutrition and Dietetics, Dietitians of Canada and ACSM. Med Sci Sports Exerc 48(3).',
  'Olympiatoppen (2024). Intensitetsskala I-1 až I-8, verze 2.',
  'Seiler, S. (2010). What is best practice for training intensity and duration distribution in endurance athletes? Int J Sports Physiol Perform 5(3).',
  'Helgerud, J. a kol. (2007). Aerobic high-intensity intervals improve VO2max more than moderate training. Med Sci Sports Exerc 39(4).',
  'Tanaka, H., Monahan, K. D., Seals, D. R. (2001). Age-predicted maximal heart rate revisited. J Am Coll Cardiol 37(1).',
  'DiCarlo, L. J. a kol. (1991). Cardiovascular, metabolic, and perceptual responses to hydrotherapy and land exercise. (rozdíl HRmax plavání vs. běh asi 12 tepů).',
  'Gastin, P. B. (2001). Energy system interaction and relative contribution during maximal exercise. Sports Med 31(10).',
  'Duffield, R., Dawson, B., Goodman, C. (2004, 2005). Energy system contribution to 100 m, 200 m, 400 m, 800 m a 1 500 m running. J Sports Sci.',
  'Bassett, D. R., Howley, E. T. (2000). Limiting factors for maximum oxygen uptake and determinants of endurance performance. Med Sci Sports Exerc 32(1).',
  'Saltin, B., Åstrand, P. O. (1967). Maximal oxygen uptake in athletes. J Appl Physiol 23(3).',
  'Wood, R. J. Average VO2 max by sport. Topend Sports (přehled rozpětí VO2max).',
  'Lucia, A., Hoyos, J., Chicharro, J. L. (2001). Physiology of professional road cycling. Sports Med 31(5).',
  'Bangsbo, J., Mohr, M., Krustrup, P. (2006). Physical and metabolic demands of training and match-play in the elite football player. J Sports Sci 24(7).',
  'Stojanović, E. a kol. (2018). The activity demands and physiological responses encountered during basketball match-play: a systematic review. Sports Med 48(1).',
  'Vigh-Larsen, J. F., Mohr, M. (2022). The physiology of ice hockey performance: an update. Scand J Med Sci Sports.',
  'Fernandez, J., Mendez-Villanueva, A., Pluim, B. M. (2006). Intensity of tennis match play. Br J Sports Med 40(5).',
  'Franchini, E. a kol. (2011). Physiological profiles of elite judo athletes. Sports Med 41(2).',
  'Bogdanis, G. C. a kol. (1995). Recovery of power output and muscle metabolites following 30 s of maximal sprint cycling. J Physiol 482.',
  'Mountjoy, M. a kol. (2023). IOC consensus statement on Relative Energy Deficiency in Sport (REDs). Br J Sports Med 57.',
  'Loucks, A. B. a kol. (2011). Energy availability in athletes. J Sports Sci 29(S1).',
  'Cooper, K. H. (1968). A means of assessing maximal oxygen uptake. JAMA 203(3).',
  'Springer, B. A. a kol. (2007). Normative values for the unipedal stance test with eyes open and closed. J Geriatr Phys Ther 30(1).',
  'Rikli, R. E., Jones, C. J. (1999). Functional fitness normative scores for community-residing older adults. J Aging Phys Act 7.',
  'Gabbett, T. J. (2016). The training–injury prevention paradox. Br J Sports Med 50; Impellizzeri, F. M. a kol. (2020). Acute:chronic workload ratio: conceptual issues. Int J Sports Physiol Perform 15.',
  'van Dyk, N. a kol. (2019). Including the Nordic hamstring exercise in injury prevention programmes halves the rate of hamstring injuries. Br J Sports Med 53.',
  'Hunter, S. K. (2014). Sex differences in human fatigability. Acta Physiol 210(4).',
  'Hooper, S. L., Mackinnon, L. T. (1995). Monitoring overtraining in athletes. Sports Med 20(5).',
  'WHO (2020). Guidelines on physical activity and sedentary behaviour.',
  'Deurenberg, P. a kol. (1991). Body mass index as a measure of body fatness. Br J Nutr 65(2).'
];
