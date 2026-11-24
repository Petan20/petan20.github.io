// Performance Lab · Zdravotní profily a 5 pilířů
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

const PROFILES = {
  standard: {
    male: {
      title: 'Muž – Standardní sportovec / běžná populace',
      desc: 'Vyvážený poměr silového, vytrvalostního a koordinačního zatížení bez specifických zdravotních omezení.',
      layman: '💡 V praxi: Můžete bezpečně kombinovat všechny tréninkové pilíře. Největší pokrok uděláte, když budete střídat těžké dny s lehkými a dodržíte 48 hodin odpočinku po náročném silovém tréninku.',
      exNote: '✅ Bez klinických omezení: můžete využívat plný rozsah pohybových vzorců i reaktivní plyometrii.',
      badges: ['Vyvážený trojpoměr živin', 'Plná progresivní zátěž', 'Standardní superkompenzace'],
      protMult: 1.0,
      recMult: 1.0,
      micros: [
        ['Hořčík (bisglycinát)', '350–400 mg/den', 'Funkce svalů a nervů, tvorba energie; doplněk má smysl hlavně při nízkém příjmu ze stravy'],
        ['Vitamín D3 + K2', '2000 IU + 75 µg', 'Při nedostatku (častý v zimě) podpoří imunitu, svaly a kosti; ideálně podle hladiny v krvi'],
        ['Omega-3 (EPA + DHA)', '1.5–2 g/den', 'Rychlejší potlačení pozátěžového zánětu a zdraví cév']
      ]
    },
    female: {
      title: 'Žena – Standardní sportovkyně / běžná populace',
      desc: 'Zohledňuje vyšší podíl spalování tuků při vytrvalostní zátěži, dynamickou stabilitu kolen a pánve i vyšší potřebu železa a vápníku.',
      layman: '💡 V praxi: Ženy bývají při stejné relativní zátěži odolnější vůči svalové únavě (Hunter 2014). Potřebují ale silné hýžďové svaly (ochrana kolen při dopadech) a dostatek železa pro přenos kyslíku.',
      exNote: '✅ Doporučení: U dřepů, výpadů a dopadů hlídejte, aby koleno nepadalo dovnitř (posilujte gluteus medius).',
      badges: ['Vyvážený trojpoměr živin', 'Kontrola železa a vápníku', 'Stabilita kolen a pánve'],
      protMult: 1.0,
      recMult: 1.0,
      micros: [
        ['Železo ze stravy + Vitamín C', '15 mg/den (DDD)', 'Červené maso, luštěniny, celozrnné pečivo; vitamín C zlepšuje vstřebávání. Doplněk jen při prokázaném nedostatku (feritin).'],
        ['Vápník + Vitamín D3', '1000 mg + 2000 IU', 'Pevnost kostí a prevence únavových zlomenin'],
        ['Hořčík + B6', '300–350 mg/den', 'Snížení nervosvalového napětí a podpora regenerace']
      ]
    }
  },
  hormonal: {
    female: {
      title: 'Žena – Menopauza / Perimenopauza',
      desc: 'Pokles estrogenů zvyšuje tzv. anabolickou rezistenci (svaly hůře reagují na malé podněty) a urychluje úbytek kostní hmoty.',
      layman: '💡 V praxi: Místo nekonečného lehčího kardia potřebujete 2–3× týdně poctivý silový trénink s vyšší vahou (6–8 opakování), kontrolované odrazy pro zpevnění kostí a o 15 % vyšší příjem bílkovin (přesné číslo spočítá sekce Výživa).',
      exNote: '🦴 Priorita pro menopauzu: Zařaďte základní vícekloubové cviky (dřepy, mrtvý tah, tlaky, tahy) a šetrné odrazy (Box Jump, Pogo Jumps) pro stimulaci kostí.',
      badges: ['Bílkoviny +15 % (leucin)', 'Těžký silový & kostní stimul', 'Vápník + D3 + K2', '+25 % delší regenerace'],
      protMult: 1.15,
      recMult: 1.25,
      micros: [
        ['Vápník + D3 + K2 (MK-7)', '1200 mg + 2500 IU + 100 µg', 'Zásadní ochrana před řídnutím kostí (osteopenií)'],
        ['Fytoestrogeny (lněné semínko, sója)', '40–80 mg/den ze stravy', 'Přirozená podpora termoregulace a kostního metabolismu'],
        ['Omega-3 + Hořčík', '2 g EPA/DHA + 350 mg Mg', 'Ochrana srdce, cév a zlepšení kvality spánku']
      ]
    },
    male: {
      title: 'Muž – Andropauza / 50+ let',
      desc: 'Postupný pokles testosteronu a růstového faktoru IGF-1 vyžaduje udržení intenzity základních silových cviků při menším celkovém objemu.',
      layman: '💡 V praxi: Cvičte kratší, ale intenzivnější tréninky (45–60 min), pečlivě se rozcvičte a dopřejte šlachám i nervovému systému o den delší pauzu mezi těžkými jednotkami.',
      exNote: '⚡ Doporučení 50+: Preferujte vícekloubové cviky s kontrolovanou technikou a dostatečnou pauzou (2.5–3 min).',
      badges: ['Bílkoviny +10 %', 'Silový trénink + mobilita', 'Zinek + Hořčík + Kolagen', '+20 % regenerace'],
      protMult: 1.1,
      recMult: 1.2,
      micros: [
        ['Zinek + Hořčík', '15 mg Zn + 400 mg Mg', 'Nedostatek zinku snižuje testosteron; doplněk má smysl jen při nízkém příjmu ze stravy'],
        ['Vitamín D3 + K2', '2500 IU + 100 µg', 'Udržení svalové síly, imunity a pružnosti cév'],
        ['Kolagen + Vitamín C', '12 g/den', 'Může podpořit tvorbu kolagenu ve šlachách a vazech, když se užije s vitamínem C před tréninkem; důkazy jsou zatím omezené']
      ]
    }
  },
  bone: {
    male: {
      title: 'Muž – Nízká kostní denzita (Osteopenie)',
      desc: 'Kostní tkáň sílí pouze tehdy, když na ni působí mechanický tah svalu a tlak v ose těla (Wolffův zákon).',
      layman: '💡 V praxi: Nejlepší lék na řídnutí kostí je silový trénink ve stoji (dřepy, výstupy, farmářská chůze). Vyhněte se ale předklonům s kulatými zády a tvrdým seskokům z výšky.',
      exNote: '⚠️ Bezpečnostní pravidlo pro kosti: Držte vždy rovná záda (neutrální páteř), vyhněte se hlubokým sed-lehům a Drop Jumpům.',
      badges: ['Axiální silový trénink', 'Prevence pádů & rovnováha', 'Bez flexe páteře se zátěží', 'Ca + D3 + K2'],
      protMult: 1.08,
      recMult: 1.15,
      micros: [
        ['Vápník (dělené dávky)', '1200 mg/den', 'Základní stavební minerál pro zpevnění kostní hmoty'],
        ['Vitamín D3 + K2', '3000 IU + 100 µg', 'D3 zlepšuje vstřebávání vápníku, K2 se podílí na kostním metabolismu; dávku D3 je dobré řídit podle hladiny v krvi'],
        ['Hořčík + Bílkoviny', '400 mg + bílkoviny dle kalkulačky', 'Pružná kolagenová kostra kosti a svalová opora']
      ]
    },
    female: {
      title: 'Žena – Nízká kostní denzita (Osteopenie)',
      desc: 'Cílené zatížení krčku stehenní kosti a páteře pomocí dřepů, tahů a rovnovážných cvičení bez prudkých rotací a ohýbání zad.',
      layman: '💡 V praxi: Kombinujte silové cviky pro nohy a záda s nácvikem rovnováhy na jedné noze (prevence pádů). Nikdy neohýbejte páteř dopředu s činkou v ruce.',
      exNote: '⚠️ Bezpečnostní pravidlo pro kosti: Žádné švihové předklony s kulatými zády; preferujte dřepy, Hip Thrust a rovnovážné testy.',
      badges: ['Zátěž kyčlí a páteře', 'Prevence pádů', 'Bez švihových flexí trupu', 'Ca + D3 + K2'],
      protMult: 1.12,
      recMult: 1.15,
      micros: [
        ['Vápník + D3 + K2', '1200 mg + 3000 IU + 100 µg', 'Mineralizace a zvýšení hustoty kostní tkáně'],
        ['Bílkoviny (strava + kolagen)', 'dle kalkulačky výživy', 'Obnova organické bílkovinné sítě uvnitř kosti'],
        ['Hořčík + Bór', '350 mg + 3 mg', 'Správné využití vitamínu D v kostním metabolismu']
      ]
    }
  },
  asthma: {
    male: {
      title: 'Muž – Bronchiální astma (EIA)',
      desc: 'Zátěží vyvolaný bronchospasmus (zúžení průdušek) vzniká při náhlém přechodu do vysoké intenzity nebo v chladném suchém vzduchu.',
      layman: '💡 V praxi: Vždy se 15 minut pozvolna rozehřívejte, v klidnějším tempu dýchejte nosem (ohřívá a zvlhčuje vzduch) a využívejte dechový trenažér 4-2-6.',
      exNote: '🫁 Pravidlo pro astma: Před intervaly (HIIT/sprinty) zařaďte 15min postupné rozcvičení a mějte u sebe úlevový inhalátor.',
      badges: ['15min postupné rozcvičení', 'Nazální dýchání v I1–I2', 'Prodloužený výdech 4-2-6', 'Omega-3 + Hořčík'],
      protMult: 1.0,
      recMult: 1.1,
      micros: [
        ['Hořčík', '400 mg/den', 'Důležitý pro funkci svalů; účinek doplňku na astma je nejistý, hlídejte hlavně dostatek ze stravy'],
        ['Omega-3 (EPA/DHA)', '2–2.5 g/den', 'Mohou mírně tlumit zánět; výsledky studií u zátěžového astmatu jsou smíšené'],
        ['Vitamín D3 + Vitamín C', '2500 IU + 500 mg', 'Při nedostatku vitamínu D bývá astma hůře kontrolované; vitamín C může u části lidí zmírnit zátěžové astma']
      ]
    },
    female: {
      title: 'Žena – Bronchiální astma (EIA)',
      desc: 'Důraz na postupný náběh tepové frekvence, posílení dýchacích svalů a vyhnutí se prudkému ochlazení dýchacích cest.',
      layman: '💡 V praxi: Začínejte každý trénink zvolna, po výkonu zařaďte 5 minut klidného vychození a nacvičujte brániční dýchání do spodních žeber.',
      exNote: '🫁 Pravidlo pro astma: Pozvolný náběh intenzity; plavání a veslování jsou výborné pro rozvoj dechové ekonomiky.',
      badges: ['Pozvolný náběh intenzity', 'Kontrola dechové ekonomiky', 'Prodloužený výdech 4-2-6', 'Mg + D3 + Železo'],
      protMult: 1.0,
      recMult: 1.1,
      micros: [
        ['Hořčík + Vitamín C', '350 mg + 500 mg', 'Důležité pro svaly a imunitu; účinek doplňků na astma je nejistý'],
        ['Omega-3 EPA/DHA', '2 g/den', 'Mohou mírně tlumit zánět, důkazy jsou smíšené'],
        ['Železo ze stravy + D3', '15 mg (DDD) + 2000 IU', 'Přenos kyslíku ke svalům; železo v doplňku jen po krevním testu']
      ]
    }
  },
  stroke: {
    male: {
      title: 'Muž – Stav po CMP (cévní mozkové příhodě)',
      desc: 'Cílem je podpora neuroplasticity mozku, obnova rovnováhy, síly dolních končetin a bezpečná kardiovaskulární kondice bez výkyvů tlaku.',
      layman: '💡 V praxi: Při cvičení NIKDY nezadržujte dech (nahlas počítejte opakování, aby nevylétl krevní tlak). Zařazujte jednostranné cviky, chůzi a cvičení koordinace oko–ruka.',
      exNote: '🧠 Bezpečnost po CMP: Plynule vydechujte při každém záběru (zákaz zadržování dechu!), preferujte cviky s oporou a nácvik rovnováhy.',
      badges: ['Bez zadržování dechu (TK)', 'Neuroplasticita & rovnováha', 'Submaximální silová vytrvalost', 'Delší regenerace (odhad)'],
      protMult: 1.1,
      recMult: 1.35,
      micros: [
        ['Omega-3 (vysoké DHA)', '2–3 g/den', 'DHA je stavební součástí mozku, omega-3 podporují zdraví cév; o léčbě po CMP rozhoduje lékař'],
        ['Vitamíny B6, B9, B12', 'Komplex', 'Snižování hladiny homocysteinu a ochrana cév i nervů'],
        ['Hořčík + Draslík (ze stravy)', '400 mg Mg', 'Podpora zdravého krevního tlaku a uvolnění svalových křečí']
      ]
    },
    female: {
      title: 'Žena – Stav po CMP (cévní mozkové příhodě)',
      desc: 'Cílený nácvik jisté chůze, rovnováhy a funkční síly s plynulým dýcháním a delším odpočinkem pro nervový systém.',
      layman: '💡 V praxi: Cvičte raději častěji a kratší dobu s dostatečnými pauzami. Při každém zvednutí váhy plynule vydechujte, aby nedocházelo k tlakovým špičkám.',
      exNote: '🧠 Bezpečnost po CMP: Plynulý výdech při námaze, důraz na rovnováhu (Tandem Walk, Stoj na jedné noze s oporou) a Turecký vztyk.',
      badges: ['Plynulé dýchání bez zádrže', 'Rovnováha a stabilita chůze', 'Nižší intenzita, vyšší frekvence', 'DHA + B-komplex'],
      protMult: 1.1,
      recMult: 1.35,
      micros: [
        ['Omega-3 (DHA)', '2–2.5 g/den', 'Podpora regenerace mozku a nervových drah'],
        ['B6 + Kyselina listová + B12', 'Komplex', 'Cévní a neurologická ochrana'],
        ['Vitamín D3 + Hořčík', '2500 IU + 350 mg', 'Svalová kontrola a prevence pádů']
      ]
    }
  },
  pectus: {
    male: {
      title: 'Muž – Pectus excavatum (vpáčený hrudník)',
      desc: 'Vpáčení hrudní kosti bývá spojeno se zkrácenými prsními svaly, kulatými hrudními zády a omezeným rozvíjením spodních žeber při nádechu.',
      layman: '💡 V praxi: Zaměřte se na otevírání hrudníku (protažení prsních svalů, záklony hrudní páteře přes válec), posílení mezilopatkových svalů (Face Pulls, přítahy) a hluboké dýchání do stran žeber.',
      exNote: '🫁 Priorita pro Pectus: Vždy kombinujte tlakové cviky s dvojnásobkem tahových cviků (Face Pulls, shyby) a bráničním dýcháním.',
      badges: ['Extenze hrudní páteře', 'Posílení mezilopatkových svalů', 'Brániční dech do žeber', 'Protažení m. pectoralis'],
      protMult: 1.0,
      recMult: 1.0,
      micros: [
        ['Hořčík + D3', '350 mg + 2000 IU', 'Vytrvalost posturálních svalů držících rovná záda'],
        ['Kolagen + Vitamín C', '10 g/den', 'Tvar hrudníku nezmění, může podpořit pojivové tkáně; důkazy jsou omezené'],
        ['Omega-3', '1.5 g/den', 'Celková regenerace pohybového aparátu']
      ]
    },
    female: {
      title: 'Žena – Pectus excavatum (vpáčený hrudník)',
      desc: 'Korekce předsunutých ramen, posílení dolních fixátorů lopatek a zvětšení dechové kapacity pomocí žebrového bráničního dýchání.',
      layman: '💡 V praxi: Pravidelně protahujte prsní svaly metodou PNF, posilujte záda (veslování, Wall Slides) a trénujte dechový trenažér 4-2-6 s rukama na spodních žebrech.',
      exNote: '🫁 Priorita pro Pectus: Otevírání hrudního koše (Open Book, PNF na prsní svaly) a posílení zadních deltů a dolního trapézu.',
      badges: ['Korekce protrakce ramen', 'Tahové cviky & zadní delty', 'Žebrové brániční dýchání', 'Mobilita hrudníku'],
      protMult: 1.0,
      recMult: 1.0,
      micros: [
        ['Hořčík + D3', '300 mg + 2000 IU', 'Funkce dýchacích a zádových svalů'],
        ['Kolagen + Vitamín C', '10 g/den', 'Elasticita pojivových struktur hrudníku'],
        ['Železo ze stravy + B12', '15 mg Fe (DDD)', 'Okysličení při zátěži; doplněk jen při prokázaném nedostatku']
      ]
    }
  }
};

const PILLARS = {
  strength: {
    name: '1. Silový pilíř',
    meta: 'Váha: 75–90 % 1RM · Série: 3–5 · Pauza: 2–4 min · Pořadí v tréninku: 2. (po rychlosti)',
    desc: 'Rozvoj maximální síly a svalové hmoty pomocí mechanického napětí. Těžká zátěž postupně zapojuje i nejsilnější rychlá svalová vlákna (Hennemanův princip).',
    layman: '💡 Pro laika: Silový trénink není jen o vzhledu – zpevňuje šlachy, zvyšuje hustotu kostí a chrání klouby. Dlouhá pauza (2–4 min) mezi těžkými sériemi je nutná, aby se dobila rychlá energie ATP.'
  },
  endurance: {
    name: '2. Vytrvalostní pilíř',
    meta: 'Zóny: I1–I2 (55–82 % TFmax) jako základ, I3–I5 (82–100 %) pro kvalitu · Pořadí: samostatně nebo na konci jednotky',
    desc: 'Zvyšuje počet mitochondrií („buněčných elektráren“), prokrvení svalů a schopnost odbourávat laktát při vysokém tempu.',
    layman: '💡 Pro laika: Základní vytrvalost v klidném tempu (I2) naučí tělo pálit tuky a zrychlí regeneraci mezi sprinty nebo sériemi v posilovně.'
  },
  explosive: {
    name: '3. Výbušný pilíř (RFD)',
    meta: 'Váha: 30–60 % 1RM / vlastní tělo · Opakování: 3–6 (max. rychlost) · Pořadí: 1. hned po rozcvičení!',
    desc: 'Rate of Force Development (rychlost nárůstu síly) a využití pružnosti šlach (cyklus natažení–zkrácení SSC).',
    layman: '💡 Pro laika: Výbušnost rozhoduje o tom, jak vysoko vyskočíte nebo jak rychle vyrazíte z místa. Cvičí se vždy na začátku tréninku s úplně čerstvým nervovým systémem a jen v malém počtu opakování.'
  },
  agility: {
    name: '4. Agility & Rychlost',
    meta: 'Délka úseku: 3–8 s · Pauza: 1:6 až 1:10 · Pořadí: 1. po dynamickém rozcvičení',
    desc: 'Akcelerace, bezpečné brzdění (decelerace), ostrá změna směru (COD) a reakce na nečekaný podnět.',
    layman: '💡 Pro laika: Skutečná hbitost není jen běh rovně, ale schopnost bezpečně zabrzdit (prevence zranění kolen) a bleskově zareagovat na pohyb soupeře nebo míče.'
  },
  coord: {
    name: '5. Koordinace & Mobilita',
    meta: 'Kontrolované tempo · PNF strečink · Propojení svalových řetězců',
    desc: 'Optimalizuje spolupráci mezi svaly, rovnováhu a kloubní rozsahy. Metoda PNF využívá krátké zatnutí svalu (6 s) a následné hluboké uvolnění.',
    layman: '💡 Pro laika: Koordinace a pohyblivost jsou „olej v motoru“ – umožní vám provádět všechny cviky technicky čistě, s menší spotřebou energie a bez bolestí zad.'
  }
};
