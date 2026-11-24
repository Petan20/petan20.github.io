// Performance Lab · Databáze 100 cviků, klinické testy kloubů, popisy přesahu
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

// ============================================================================
// DATABÁZE 100 PRIMÁRNÍCH CVIKŮ (20 PRO KAŽDÝ Z 5 PILÍŘŮ)
// Struktura: [Název, Kategorie vzorce, Popis vzorce, Svaly & řetězec, Dávkování, Přesah na systémy, Poznámka]
// ============================================================================
const EXERCISES_100 = {
  strength: [
    ['Zadní dřep s velkou činkou', 'drep', 'Dřep (Squat)', 'Kvadricepsy, hýždě, vzpřimovače páteře (zadní + přední řetězec)', '4×5–6 (80–85 % 1RM), pauza 3 min', 'Silný osteogenní stimul kostí + přenos do výskoku (RFD)', 'Držet neutrální páteř a kolena v ose špiček.'],
    ['Čelní dřep (Front Squat)', 'drep', 'Dřep (Squat)', 'Kvadricepsy, hluboký stabilizační systém (HSSP), hrudní vzpřimovače', '4×6 (75–80 % 1RM), pauza 2.5 min', 'Zlepšuje vzpřímené držení trupu a vertikální odraz', 'Výborný pro Pectus excavatum – otevírá hrudník.'],
    ['Goblet dřep s jednoručkou / KB', 'drep', 'Dřep (Squat)', 'Kvadricepsy, hýždě, přední stabilizační řetězec trupu', '3×10–12, pauza 90 s', 'Učí bezpečnou hloubku dřepu bez přetížení beder', 'Ideální základ pro začátečníky, osteopenii i po CMP.'],
    ['Bulharský dělený dřep', 'drep', 'Unilaterální dřep', 'Kvadricepsy, gluteus medius/maximus, stabilizátory pánve', '3×8/noha, pauza 2 min', 'Přenos do běžeckého kroku a stability při změnách směru', 'Vyrovnává stranové rozdíly síly (skvělé po CMP).'],
    ['Výstupy na bednu se zátěží', 'drep', 'Unilaterální tlak DK', 'Gluteus maximus, kvadricepsy, lýtka', '3×8–10/noha, pauza 90 s', 'Přímý přenos do chůze do kopce/schodů a akcelerace', 'Šetrné ke kolennímu kloubu i bederní páteři.'],
    ['Rumunský mrtvý tah (RDL)', 'hinge', 'Hip Hinge (kyčelní ohyb)', 'Hamstringy, gluteus maximus, vzpřimovače páteře', '4×6–8 (75 % 1RM), pauza 2.5 min', 'Excentrická ochrana zadních stehen při sprintu a brzdění', 'Při osteopenii spouštět činku jen pod kolena s rovnými zády.'],
    ['Mrtvý tah s Trap Barem', 'hinge', 'Hip Hinge / Dřep', 'Celý zadní řetězec (hýždě, hamstringy, záda, úchop)', '4×5 (80–85 % 1RM), pauza 3 min', 'Maximální stimulace kostní denzity a celkové síly', 'Těžiště v ose těla šetří bedra; po CMP nevydechovat se zádrží!'],
    ['Hip Thrust s osou / jednoručkou', 'hinge', 'Extenze kyčle', 'Gluteus maximus, hamstringy, pánevní dno', '4×8–10, pauza 2 min', 'Zvyšuje horizontální sílu při sprintu a odrazu', 'Velmi bezpečný pro bedra i nízkou kostní denzitu.'],
    ['Nordic Hamstring Curl', 'hinge', 'Excentrická flexe kolene', 'Hamstringy (biceps femoris, semitendinosus)', '3×4–6 (pomalé brzdění), pauza 2 min', 'Snižuje počet natažení hamstringů zhruba o polovinu (van Dyk 2019)', 'Vysoký nárok na šlachy – zařazovat postupně.'],
    ['Bench press s činkou / jednoručkami', 'tlak', 'Horizontální tlak', 'Velký prsní sval, přední delty, triceps', '4×6–8 (75–82 % 1RM), pauza 2.5 min', 'Základní tlaková síla horní poloviny těla', 'U Pectus excavatum vždy vyvážit dvojnásobkem tahů.'],
    ['Kliky na bradlech / se zátěží', 'tlak', 'Šikmý tlak', 'Prsní svaly, triceps, pilovitý sval přední (serratus)', '3×8–12, pauza 2 min', 'Zpevňuje pletenec ramenní a stabilitu lopatky', 'Serratus anterior stabilizuje hrudní koš.'],
    ['Tlak nad hlavu ve stoji (OHP)', 'tlak', 'Vertikální tlak', 'Deltové svaly, triceps, horní trapéz, HSSP (core)', '4×6 (75–80 % 1RM), pauza 2.5 min', 'Propojuje přenos síly z chodidel přes trup do paží', 'Podporuje napřímení hrudní páteře.'],
    ['Tlak jednoručkou v polokleku', 'tlak', 'Unilaterální vertikální tlak', 'Delty, triceps, šikmé břišní svaly (antirotace)', '3×8/paže, pauza 90 s', 'Učí stabilitu pánve bez prohýbání v bedrech', 'Výborný korekční cvik pro držení těla.'],
    ['Shyby / Stahování horní kladky', 'tah', 'Vertikální tah', 'Široký sval zádový, dolní trapéz, biceps', '4×6–10, pauza 2 min', 'Vyvažuje tlakové přetížení a otevírá hrudník', 'Klíčový cvik pro Pectus excavatum a zdravá ramena.'],
    ['Přítahy činky v předklonu', 'tah', 'Horizontální tah', 'Mezilopatkové svaly (rombické, střední trapéz), zadní delty', '4×8, pauza 2 min', 'Zpevňuje posturální řetězec zad a sílu úchopu', 'Při osteopenii volit variantu s oporou hrudníku o lavici.'],
    ['Přítahy jednoručky s oporou o lavici', 'tah', 'Unilaterální horizontální tah', 'Latissimus, rombické svaly, šikmé břišní svaly', '3×8–10/paže, pauza 90 s', 'Odstraňuje stranové dysbalance zad a trupu', 'Opora ruky chrání bederní páteř.'],
    ['Face Pulls na kladce / s gumou', 'tah', 'Horizontální tah + zevní rotace', 'Zadní delty, infraspinatus, dolní trapéz', '3×12–15, pauza 60 s', 'Prevence přetížení ramene (impingement) a kulatých zad', 'Zásadní cvik pro Pectus excavatum a raketové sporty.'],
    ['Farmářská chůze (Farmer’s Walk)', 'core', 'Lokomoce se zátěží (Carry)', 'HSSP, kvadratus lumborum, trapézy, předloktí, kyčle', '4×30–40 m, pauza 90 s', 'Komplexní stabilizace páteře při chůzi a běhu', 'Bezpečný stimul pro kosti bez ohýbání páteře.'],
    ['Pallof Press (antirotační tlak)', 'core', 'Antirotace trupu', 'Hluboký stabilizační systém (transversus, šikmé břišní)', '3×10/strana (výdrž 2 s), pauza 60 s', 'Bezpečný přenos rotační síly při úderech a hodech', 'Vhodné pro všechny profily včetně osteopenie a CMP.'],
    ['Výpony na lýtka ve stoji i vsedě', 'drep', 'Plantární flexe', 'Gastrocnemius, soleus, Achillova šlacha', '4×10–15, pauza 75 s', 'Zvyšuje tuhost kotníku pro běh a odrazy', 'Soleus podporuje žilní návrat a stabilitu stoje.']
  ],
  explosive: [
    ['Výskok z dřepu (Squat Jump)', 'odraz', 'Koncentrický odraz', 'Kvadricepsy, hýždě, lýtka (start bez protipohybu)', '4×4–5 (max. úsilí), pauza 2.5 min', 'Čistý startovní RFD z klidové polohy', 'Vždy na začátku tréninku s čerstvým CNS.'],
    ['Výskok s protipohybem (CMJ)', 'odraz', 'Pomalý SSC odraz', 'Extensory kyčle, kolene a kotníku', '4×5, pauza 2.5 min', 'Využití elastické energie šlach (SSC)', 'Základní test i trénink vertikální výbušnosti.'],
    ['Seskok a okamžitý výskok (Drop Jump)', 'odraz', 'Rychlý SSC (< 250 ms)', 'Achillova šlacha, lýtka, reaktivní tuhost DK', '4×4 (z 30–40 cm), pauza 3 min', 'Maximální reaktivní síla pro sprint a smeč', 'Nevhodné při osteoporóze; vysoký nárok na CNS.'],
    ['Výskok na bednu (Box Jump)', 'odraz', 'Odraz s měkkým dopadem', 'Gluteus, kvadricepsy, lýtka', '4×4–5, pauza 2 min', 'Rozvoj odrazu bez tvrdého nárazu při doskoku', 'Skvělá volba pro menopauzu (šetrný dopad na bednu).'],
    ['Skok daleký z místa (Broad Jump)', 'odraz', 'Horizontální odraz', 'Gluteus maximus, hamstringy, kvadricepsy', '4×4, pauza 2.5 min', 'Přímý přenos do prvních 3 kroků akcelerace', 'Učí koordinaci švihu paží a extenze kyčlí.'],
    ['Jednonožní poskoky vpřed (Bounds)', 'odraz', 'Unilaterální horizontální SSC', 'Gluteus, hamstringy, lýtka, kotník', '3×4/noha, pauza 2.5 min', 'Vyrovnává odrazovou sílu levé a pravé nohy', 'Vyžaduje zvládnutou stabilitu na jedné noze.'],
    ['Kotníkové odrazy na místě (Pogo Jumps)', 'odraz', 'Rychlý kotníkový SSC', 'Lýtkové svaly, Achillova šlacha, chodidlo', '3×10–12 (krátký kontakt), pauza 90 s', 'Zkracuje dobu kontaktu chodidla se zemí při běhu', 'Šetrný impulz pro kostní denzitu dolních končetin.'],
    ['Výpady s přeskokem (Split Jumps)', 'odraz', 'Střídavý vertikální odraz', 'Kvadricepsy, gluteus, stabilizátory pánve', '3×6 (3/noha), pauza 2 min', 'Specifická výbušnost pro starty a změny směru', 'Hlídat pevnou osu kolene (nevtáčet dovnitř).'],
    ['Bruslařské skoky do stran (Skater Jumps)', 'odraz', 'Laterální odraz a brzdění', 'Gluteus medius, adduktory, peroneální svaly', '3×6/strana, pauza 2 min', 'Výbušný odraz do strany a excentrické zabrzdění', 'Klíčové pro tenis, hokej a prevenci podvrtnutí kotníku.'],
    ['Švih s kettlebellem (KB Swing)', 'hinge', 'Balistický Hip Hinge', 'Gluteus maximus, hamstringy, HSSP, úchop', '4×10–12 (rychlý švih), pauza 90 s', 'Rychlá aktivace zadního řetězce bez dopadu na klouby', 'Šetrné ke kolenům a kotníkům.'],
    ['Silové přemístění ze visu (Hang Clean)', 'hinge', 'Balistická trojextenze', 'Zadní řetězec, trapézy, nohy, předloktí', '4×3 (60–75 % 1RM), pauza 3 min', 'Nejvyšší přenos trojextenze do sportovního výkonu', 'Vyžaduje čistou techniku; jinak volit Trap Bar výskok.'],
    ['Výskok s Trap Barem (Trap Bar Jump)', 'drep', 'Zatížený vertikální odraz', 'Kvadricepsy, gluteus, lýtka', '4×4 (25–35 % 1RM), pauza 2.5 min', 'Bezpečný rozvoj rychlostně-silové křivky', 'Minimální zatížení ramen a krční páteře.'],
    ['Výrazový tlak (Push Press)', 'tlak', 'Balistický vertikální tlak', 'Nohy, core, deltové svaly, triceps', '4×4–5 (65–75 % 1RM), pauza 2.5 min', 'Učí přenos energie z nohou přes trup do paží', 'Podporuje vzpřímené postavení hrudníku.'],
    ['Odhod medicinbalu od hrudníku', 'tlak', 'Horizontální balistický tlak', 'Prsní svaly, přední delty, triceps, HSSP', '4×5 (3–5 kg míč), pauza 90 s', 'Maximální rychlost extenze paží bez brzdné fáze', 'Bezpečný cvik pro všechny věkové kategorie i po CMP.'],
    ['Odhod medicinbalu přes hlavu vzad', 'hinge', 'Balistická trojextenze', 'Gluteus, hamstringy, vzpřimovače, latissimus', '4×4, pauza 2 min', 'Explozivní otevření předního řetězce těla', 'Opatrně při pokročilé osteoporóze beder.'],
    ['Rotační hod medicinbalem o zeď', 'core', 'Rotační spirální řetězec', 'Šikmé břišní svaly, gluteus, hrudní rotátory', '4×5/strana, pauza 90 s', 'Přímý přenos do tenisového úderu, hodu a střely', 'Zapojuje spirální řetězec od chodidla po ruku.'],
    ['Úder medicinbalem o zem (Slam)', 'core', 'Balistická flexe / extenze', 'Latissimus, břišní svaly, triceps', '4×6, pauza 90 s', 'Rychlé vybití síly trupu bez zátěže kloubů', 'Výborný i pro uvolnění stresu.'],
    ['Plyometrické kliky s odrazem', 'tlak', 'Rychlý SSC horních končetin', 'Prsní svaly, triceps, pilovitý sval přední', '4×4–5, pauza 2 min', 'Reaktivní síla horních končetin při soubojích', 'Pro začátečníky provádět s rukama na vyvýšené bedně.'],
    ['Výbušné přítahy na TRX / kruzích', 'tah', 'Balistický horizontální tah', 'Mezilopatkové svaly, zadní delty, biceps', '4×6, pauza 90 s', 'Rychlá retrakce lopatek a zpevnění zad', 'Kompenzuje jednostranné tlakové sporty.'],
    ['Švihadlo – rychlá frekvence / dvojšvihy', 'lokomoce', 'Rychlostní kotníkový rytmus', 'Lýtka, chodidlo, koordinace ruka–noha', '5×20 s (max. frekvence), pauza 60 s', 'Zlepšuje tuhost kotníku a ekonomiku běžeckého kroku', 'Vhodné na závěr rozcvičení před agility.']
  ],
  endurance: [
    ['Souvislý běh v zóně I2', 'lokomoce', 'Aerobní lokomoce', 'Kardiorespirační systém, pomalá vlákna (typ I)', '40–75 min (I1–I2, 55–82 % TFmax)', 'Zvyšuje hustotu mitochondrií a oxidaci tuků', 'Základní stavební kámen regenerace mezi sériemi.'],
    ['Tempový běh na prahu ANP (I3)', 'lokomoce', 'Prahová vytrvalost', 'Kardiovaskulární systém, oxidační vlákna IIa', '3×8–12 min (I3, 82–87 % TFmax), pauza 2 min', 'Posouvá laktátový práh a toleranci vysokého tempa', 'Vyžaduje 36–48 h odpočinku.'],
    ['Norwegian 4×4 min HIIT (I4)', 'lokomoce', 'Vysokointenzivní interval', 'Srdeční výdej (VO2max), transport O2 ve svalech', '4×4 min (I4, 87–92 % TFmax), pauza 3 min klus', 'Jeden z nejlépe prozkoumaných protokolů pro zvýšení VO2max (Helgerud 2007)', 'U astmatu nutné 15min pozvolné rozcvičení.'],
    ['Krátké intervaly 30/30 s (Billat)', 'lokomoce', 'Aerobní výkon v tempu', 'Rychlá i pomalá svalová vlákna, myoglobin', '2×8–10 min (30 s rychle / 30 s klus)', 'Udržuje vysokou spotřebu O2 bez extrémního zakyselení', 'Šetrnější k technice běhu než dlouhé úseky.'],
    ['Opakované sprinty (RSA 6×40 m)', 'odraz', 'Herní anaerobní vytrvalost', 'Vlákna IIa/IIx, pufrační kapacita svalů', '2 série × 6×40 m, pauza 25 s / 4 min', 'Specifická vytrvalost pro tenis, fotbal a hokej', 'Vysoký nárok na hamstringy.'],
    ['Fartlek (hra s rychlostí v terénu)', 'lokomoce', 'Proměnlivá lokomoce', 'Aerobní i glykolytický systém, kotníky', '35–50 min (střídání I2–I4 dle terénu)', 'Učí tělo rychle přepínat energetické systémy', 'Zábavná forma rozvoje vytrvalosti bez stopek.'],
    ['Výběhy mírného kopce (60–90 s)', 'lokomoce', 'Silová vytrvalost DK', 'Gluteus, hamstringy, lýtka, kardio systém', '6–8×60–90 s (I4), chůze dolů', 'Zvyšuje běžeckou sílu bez tvrdých nárazů při seběhu', 'Šetrné ke kolenům a Achillově šlaše.'],
    ['Veslařský trenažér (Concept2)', 'tah', 'Tahová cyklická vytrvalost', 'Nohy, záda, paže a srdce (zapojí horní i dolní polovinu těla)', '30–45 min I2 nebo 6×500 m (pauza 2 min)', 'Maximální zapojení svalů bez nárazů na klouby', 'Ideální pro menopauzu, nadváhu i Pectus excavatum.'],
    ['SkiErg (lyžařský trenažér)', 'tah', 'Vytrvalost horní poloviny', 'Latissimus, triceps, HSSP, mezižeberní svaly', '6×2 min (I3–I4), pauza 90 s', 'Rozvíjí dechovou kapacitu a vytrvalost trupu', 'Výborné při omezení dolních končetin.'],
    ['Assault / Air Bike (celé tělo)', 'tlak', 'Tlako-tahová cyklická', 'Kvadricepsy, hamstringy, hrudník, záda, paže', '10×20 s vysoké tempo / 40 s volně', 'Rozvoj anaerobní a aerobní kapacity bez dopadů', 'Téměř bez excentrické práce, proto menší bolest svalů a rychlejší obnova.'],
    ['Cyklistika v zóně I2', 'lokomoce', 'Cyklická lokomoce DK', 'Kvadricepsy, gluteus, kardiovaskulární systém', '45–90 min (kadence 85–95 ot./min)', 'Vysoký objem aerobní práce bez přetížení kloubů', 'Bezpečné pro stav po CMP i osteopenii.'],
    ['Plavání (kraul / znak v I2–I3)', 'tah', 'Horizontální plavecká', 'Latissimus, delty, HSSP, dýchací svaly', '30–45 min (střídání 200 m / 30 s pauza)', 'Odlehčení páteře, tlak vody posiluje nádechové svaly', 'Skvělé pro astma (vlhký vzduch) i Pectus excavatum.'],
    ['Chůze do kopce na pásu (10–12 %)', 'lokomoce', 'Nízkoprahová lokomoce', 'Gluteus, hamstringy, lýtka, oxidace tuků', '30–45 min v I2 (72–82 % TFmax)', 'Čistá aerobní stimulace bez ortopedického stresu', 'Zásadní pro začátečníky, 50+ a stav po CMP.'],
    ['Kettlebell EMOM (12–15 swingů/min)', 'hinge', 'Anticyklická silová vytrvalost', 'Zadní řetězec, úchop, kardiovaskulární systém', '12–16 min (každou minutu 12–15 swingů)', 'Učí rychlou relaxaci mezi opakovanými výbušnými akcemi', 'Propojuje silový a vytrvalostní pilíř.'],
    ['Tlačení saní (Sled Push)', 'lokomoce', 'Horizontální lokomoce s odporem', 'Kvadricepsy, gluteus, lýtka, HSSP', '6×25 m (tempo I4), pauza 90 s', 'Čistě koncentrická práce – minimální bolest svalů', 'Umožňuje častý trénink bez velké únavy.'],
    ['Tahání saní vzad (Reverse Sled)', 'drep', 'Koncentrická extenze kolene', 'Vastus medialis (VMO), kvadricepsy, holeně', '5×30 m, pauza 75 s', 'Prokrvení a posílení kolenního kloubu bez nárazů', 'Výborná prevence i rehabilitace bolestí kolen.'],
    ['Švihadlo v aerobním tempu', 'lokomoce', 'Rytmická lokomoce', 'Lýtka, chodidlo, ramena, koordinace', '5×3 min (120–140 přeskoků/min), pauza 60 s', 'Zlepšuje ekonomiku práce chodidla a vytrvalost lýtek', 'Podporuje kostní denzitu dolních končetin.'],
    ['Kruhový trénink silové vytrvalosti', 'core', 'Kombinované vzorce', 'Celé tělo (střídání horní a dolní poloviny)', '3–4 kola (40 s práce / 20 s přesun)', 'Zvyšuje kapilarizaci svalů a toleranci laktátu', 'Po CMP hlídat plynulé dýchání a tepovou frekvenci.'],
    ['Nordic Walking (chůze s holemi)', 'lokomoce', 'Křížová lokomoce', 'Dolní i horní končetiny, šikmé řetězce trupu', '45–60 min v I2', 'Zapojí i horní polovinu těla a zvýší energetický výdej oproti běžné chůzi', 'Ideální pro menopauzu, osteopenii a rehabilitaci po CMP.'],
    ['Výstupy na nízký step (Metronom)', 'drep', 'Rytmický výstup', 'Kvadricepsy, gluteus, kardiorespirační systém', '3×6 min v I2–I3, pauza 90 s', 'Přenos do horské turistiky a stabilní práce pánve', 'Snadno kontrolovatelná tepová frekvence.']
  ],
  agility: [
    ['Start na 10–20 m (akcelerace)', 'odraz', 'Lineární akcelerace', 'Gluteus, kvadricepsy, lýtka, dynamický švih paží', '5×15 m (100 % úsilí), pauza 2–3 min', 'Rozvoj maximální akcelerace a náklonu těla vpřed', 'Vždy po důkladném dynamickém rozcvičení.'],
    ['Letmý sprint na 20 m (Flying Sprint)', 'odraz', 'Maximální rychlost', 'Hamstringy (excentricky i koncentricky), lýtka, CNS', '4×20 m (po 15m rozběhu), pauza 3–4 min', 'Špičková frekvence a délka kroku na vrcholu CNS', 'Vyžaduje 48–72 h regenerace před dalším sprintem.'],
    ['Odporovaný sprint s gumou / saněmi', 'odraz', 'Horizontální síla akcelerace', 'Extensory kyčle a kotníku, HSSP', '5×15 m (lehký odpor), pauza 2.5 min', 'Zvyšuje aplikaci horizontální síly do podložky', 'Odpor nesmí zpomalit běh o více než 10 %.'],
    ['Brzdění ze sprintu na signál', 'drep', 'Excentrická decelerace', 'Kvadricepsy (excentricky), gluteus, HSSP', '5×10 m sprint + stop na 2 krocích, pauza 2 min', 'Snižuje riziko zranění předního zkříženého vazu (ACL)', 'Naučit se brzdit dřív, než začneme prudce měnit směr.'],
    ['Pro-Agility Shuttle (5–10–5 m)', 'odraz', '180° změna směru (COD)', 'Adduktory, abduktory, kvadricepsy, kotník', '4× série (střídat strany), pauza 2.5 min', 'Snížení těžiště při obrátce a explozivní výjezd', 'Klíčový trénink pro míčové a raketové sporty.'],
    ['T-Test (vpřed, úkroky, běh vzad)', 'lokomoce', 'Vícesměrná lokomoce', 'Gluteus medius, kvadricepsy, hamstringy', '4× série, pauza 2.5 min', 'Rychlý přechod mezi čelním a bočním pohybem', 'Nekřížit nohy při bočních úkrocích (shuffle).'],
    ['Cik-cak slalom kolem kuželů (45°)', 'odraz', 'Ostrá změna směru (Cut)', 'Kotník, koleno, kyčel v transverzální rovině', '5×20 m, pauza 2 min', 'Nácvik bezpečného postavení kolene nad špičkou', 'Posiluje laterální stabilitu dolní končetiny.'],
    ['Reaktivní zrcadlení ve dvojici', 'core', 'Kognitivně-motorická reakce', 'Zrakový analyzátor, CNS, rychlá práce nohou', '5×12 s (reakce na partnera), pauza 75 s', 'Pravá agility – reakce na nepředvídatelný podnět', 'Rozvíjí periferní vidění a rozhodování.'],
    ['Start na signál z různých poloh', 'odraz', 'Reakční rychlost', 'CNS, rychlá svalová vlákna celého těla', '6×10 m (ze sedu, kleku, kliku), pauza 2 min', 'Zkracuje reakční dobu na podnět rozhodčího/soupeře', 'Vždy s plnou koncentrací.'],
    ['Koordinační žebřík (Icky Shuffle)', 'lokomoce', 'Frekvence kroků (Footwork)', 'Lýtka, chodidlo, koordinace kyčel–kotník', '5× průchod, pauza 60 s', 'Zlepšuje rytmus a lehkost práce nohou na špičkách', 'Výborné jako aktivace před herním tréninkem.'],
    ['Boční úkroky s odporovou gumou', 'drep', 'Frontální stabilita a rychlost', 'Gluteus medius/minimus, tenzor fasciae latae', '4×10 m na každou stranu, pauza 60 s', 'Aktivuje boční stabilizátory pánve proti vtáčení kolen', 'Vhodné i pro prevenci pádů u starších osob.'],
    ['Běžecká abeceda (A-Skip / High Knees)', 'lokomoce', 'Frekvence a mechanika běhu', 'Flexory kyčle, lýtka, HSSP, práce paží', '4×15 m, pauza 60 s', 'Zvyšuje nervosvalovou frekvenci a vzpřímený postoj', 'Základ ekonomického běžeckého kroku.'],
    ['Střídavý výpad vpřed s odrazem zpět', 'drep', 'Decelerace + re-akcelerace', 'Kvadricepsy, gluteus, hamstringy', '4×6/noha, pauza 90 s', 'Simuluje výpad k míčku v tenise/badmintonu a návrat', 'Důraz na pevný trup bez předklonu.'],
    ['Chytání reaktivního míčku (Reaction Ball)', 'core', 'Oko–ruka–noha reaktivita', 'CNS, předloktí, dolní končetiny', '3×8 pokusů, pauza 60 s', 'Trénink nepředvídatelného odrazu a prvního kroku', 'Bezpečná hra pro všechny věkové kategorie.'],
    ['Sprint vzad a přechod do sprintu vpřed', 'lokomoce', 'Přechodová agility', 'Hamstringy, lýtka, kvadricepsy, rovnováha', '5×15 m, pauza 2 min', 'Častý herní vzorec v obraně a při lobu v tenise', 'Při běhu vzad držet mírný předklon trupu.'],
    ['Illinois Agility Run (slalom + rovinky)', 'lokomoce', 'Komplexní prostorová agility', 'Celé dolní končetiny, HSSP, orientace', '3–4× série, pauza 3 min', 'Propojuje lineární rychlost s ostrými obrátkami', 'Vysoký metabolický i CNS nárok.'],
    ['Únikový krok do strany (Crossover Step)', 'odraz', 'První akcelerační krok', 'Gluteus, adduktory, šikmý řetězec trupu', '5× na každou stranu, pauza 90 s', 'Nejrychlejší technika zahájení pohybu do strany', 'Přenáší se do všech kolektivních her.'],
    ['Přeskoky nízkých překážek + sprint 5 m', 'odraz', 'Plyometrický přechod do běhu', 'Lýtka, kvadricepsy, reaktivní CNS', '4×4 překážky + 5 m sprint, pauza 2 min', 'Učí plynule navázat odraz do horizontální akcelerace', 'Nízké překážky (15–25 cm) pro rychlý kontakt.'],
    ['W-Drill (šikmé sprinty vpřed a vzad)', 'lokomoce', 'Diagonální změny směru', 'Kyčelní stabilizátory, kvadricepsy, lýtka', '4× průchod, pauza 2 min', 'Nácvik rychlého brzdění v úhlu 45° a změny směru', 'Kontrolovat postavení kotníku a kolene.'],
    ['Herní změna směru s míčem / raketou', 'odraz', 'Specifická herní agility', 'Celý kinetický řetězec + manipulace s náčiním', '5×10 s (2–3 údery/přihrávky), pauza 90 s', 'Propojuje pohyb nohou s přesností horní končetiny', 'Závěrečný krok přenosu agility do hry.']
  ],
  coord: [
    ['Stoj na jedné noze (se zavřenýma očima)', 'core', 'Statická propriocepce', 'Hluboké svaly chodidla, kotník, gluteus medius', '3×30 s/noha, pauza 30 s', 'Zlepšuje rovnováhu a chrání kotník před podvrtnutím', 'Zásadní prevence pádů (osteopenie, 50+, po CMP).'],
    ['Y-Balance dosahování nohou ve stoje', 'core', 'Dynamická rovnováha DK', 'Gluteus medius, kvadricepsy, stabilizátory kotníku', '3×5 dosahů v 3 směrech/noha', 'Odhaluje a vyrovnává stranové rozdíly stability', 'Bezpečný a velmi účinný funkční trénink.'],
    ['Mrtvý brouk (Dead Bug s výdechem)', 'core', 'HSSP – sagitální stabilita', 'Transversus abdominis, bránice, pánevní dno', '3×8–10/strana (pomalý výdech), pauza 45 s', 'Učí oddělit pohyb končetin od stabilní bederní páteře', 'Bezpečný základ pro každá záda i po CMP.'],
    ['Bird-Dog (vzpažení a zanožení v kleku)', 'core', 'Křížový zadní řetězec', 'Multifidi, vzpřimovače, gluteus, zadní delty', '3×8/strana (výdrž 3 s), pauza 45 s', 'Propojuje rameno a protilehlou kyčel v diagonále', 'Šetrné ke kloubům a páteři.'],
    ['Boční prkno (Side Plank)', 'core', 'Laterální svalový řetězec', 'Quadratus lumborum, šikmé břišní svaly, gluteus medius', '3×25–40 s/strana, pauza 45 s', 'Stabilizuje pánev a páteř ve frontální rovině', 'Skvělé pro prevenci bolestí beder a kyčlí.'],
    ['Turecký vztyk (Turkish Get-Up)', 'core', 'Komplexní přechod ze země do stoje', 'Rameno, HSSP, mobilita kyčlí a hrudníku', '3×2–3/strana (pomalá kontrola), pauza 90 s', 'Královský cvik mezisvalové koordinace a stability ramene', 'Po CMP výborný nácvik bezpečného vstávání ze země.'],
    ['Největší protažení světa (WGS)', 'lokomoce', 'Komplexní dynamická mobilita', 'Flexory kyčle, hamstringy, rotace hrudní páteře', '2×5/strana (s výdechem v rotaci)', 'Otevírá kyčle a hrudník v jediném plynulém řetězci', 'Ideální součást každého rozcvičení.'],
    ['Rotace hrudní páteře v lehu (Open Book)', 'lokomoce', 'Mobilita hrudníku', 'Hrudní páteř, prsní svaly, mezižeberní svaly', '2×8/strana (pomalý výdech)', 'Odstraňuje zatuhlost horních zad a uvolňuje ramena', 'Zásadní pro Pectus excavatum a sedavou práci.'],
    ['Extenze hrudní páteře přes pěnový válec', 'lokomoce', 'Extenzní mobilita hrudníku', 'Hrudní páteř, m. pectoralis minor, latissimus', '2×8–10 (s nádechem do žeber)', 'Koriguje kulatá záda a protrakci ramen', 'Klíčové pro Pectus excavatum a tlaky nad hlavu.'],
    ['Kočka–kráva se segmentální kontrolou', 'lokomoce', 'Segmentální mobilita páteře', 'Vzpřimovače páteře, břišní stěna, rotátory', '2×10 pomalých cyklů', 'Zlepšuje vnímání pohybu jednotlivých obratlů', 'Bez zátěže bezpečné pro všechny profily.'],
    ['PNF protažení hamstringů (6 s + 15 s)', 'lokomoce', 'PNF neuromuskulární strečink', 'Hamstringy, lýtka (postizometrická relaxace)', '3 cykly/noha (6 s tlak 30 % + 15 s uvolnění)', 'Účinná metoda pro zvětšení rozsahu pohybu', 'Hlavní mechanismus je zvýšená tolerance protažení.'],
    ['PNF protažení prsních svalů o stěnu', 'lokomoce', 'PNF otevření hrudníku', 'Pectoralis major a minor, přední delty', '3 cykly/strana (6 s tlak + 15 s uvolnění)', 'Uvolňuje zkrácené prsní svaly a otevírá hrudní koš', 'První volba pro Pectus excavatum a kulatá záda.'],
    ['90/90 přechody v kyčlích v sedu', 'lokomoce', 'Vnitřní a zevní rotace kyčlí', 'Hluboké rotátory kyčle, gluteus, adduktory', '2×8/strana (kontrolovaně)', 'Zvyšuje volnost kyčelního kloubu a chrání bedra i kolena', 'Prevence přetížení třísel a kyčlí.'],
    ['Mobilizace kotníku (Knee-to-Wall)', 'lokomoce', 'Mobilita hlezenního kloubu', 'Achillova šlacha, soleus, kloubní pouzdro kotníku', '3×10/noha (pata zůstává na zemi)', 'Umožňuje hlubší dřep a bezpečný dopad bez vtáčení kolen', 'Odstraňuje jednu z nejčastějších příčin bolestí kolen.'],
    ['Protažení flexorů kyčle v kleku', 'lokomoce', 'Mobilita předního řetězce', 'Iliopsoas, rectus femoris, přední část pánve', '2×30 s/strana (podsazení pánve)', 'Kompenzuje dlouhé sezení a uvolňuje bederní páteř', 'Zlepšuje extenzi kyčle při běhu.'],
    ['Klouzání paží po zdi (Wall Slides)', 'tah', 'Skapulohumerální rytmus', 'Dolní a střední trapéz, serratus anterior', '3×10 pomalých opakování', 'Obnovuje správný pohyb lopatek při zvedání paží', 'Prevence bolestí krční páteře a ramen.'],
    ['Bosá chůze po čáře (Tandem Walk)', 'core', 'Rovnováha a aktivace klenby', 'Plantární svaly chodidla, kotník, mozeček', '4×8 m (vpřed i vzad)', 'Probouzí receptory chodidla a zlepšuje stabilitu chůze', 'Výborné pro rehabilitaci po CMP a prevenci pádů.'],
    ['Házení míčkem o zeď (střídání rukou)', 'core', 'Oko–ruka koordinace & CNS', 'Motorická kůra mozku, jemná motorika, postoj', '3×45 s (střídat pravou a levou ruku)', 'Podporuje neuroplasticitu a spolupráci hemisfér', 'Skvělé pro stav po CMP i mentální svěžest.'],
    ['Křížové lezení (Bear Crawl)', 'core', 'Křížová lokomoce (Cross-Crawl)', 'Ramena, HSSP, kvadricepsy, koordinace ruka–noha', '4×10 m (kolena 3 cm nad zemí), pauza 60 s', 'Integruje horní a dolní polovinu těla v přirozeném vzorci', 'Buduje vytrvalou stabilitu trupu a ramen.'],
    ['Hluboký odpočinkový dřep s dechem', 'drep', 'Kloubní dekomprese', 'Kotníky, kolena, kyčle, bederní páteř, pánevní dno', '2×45–60 s (hluboký brániční dech)', 'Obnovuje přirozený rozsah dolní poloviny těla', 'Při ztuhlosti kotníků se lze přidržet pevné opory.']
  ]
};

// ============================================================================
// ZÁKLADNÍ KLINICKÉ A FUNKČNÍ TESTY HLAVNÍCH KLOUBŮ A SVALŮ (8 TESTŮ)
// ============================================================================
const CLINICAL_TESTS = [
  {
    region: 'spine',
    name: 'Thomayerova zkouška (Předklon ve stoji)',
    target: 'Bederní páteř, vzpřimovače a zadní řetězec (hamstringy)',
    how: 'Postavte se snožmo s propnutými koleny a pomalu se předkloňte; natažené prsty rukou směřují k podlaze.',
    norm: 'Prsty se dotknou země (0 cm) a páteř tvoří plynulý oblouk.',
    deficit: 'Mezera nad zemí (> 5 cm) nebo rovný „prkenný“ úsek v bedrech značí zkrácené hamstringy či zatuhlá bedra.',
    fix: 'PNF protažení hamstringů, Kočka–kráva, Rumunský mrtvý tah (RDL) s lehkou vahou.'
  },
  {
    region: 'spine',
    name: 'Adamsův test předklonu (Screening skoliózy)',
    target: 'Hrudní a bederní páteř, žebra a rotační symetrie trupu',
    how: 'Ve stoji snožmo se plynule předkloňte s volně svěšenými pažemi; druhá osoba (nebo kamera) sleduje záda zezadu v rovině očí.',
    norm: 'Levá i pravá polovina zad a žeber jsou symetricky stejně vysoko.',
    deficit: 'Jednostranný val (vyklenutí žeber nebo beder) ukazuje na rotační asymetrii páteře (gibbus).',
    fix: 'Bird-Dog, Boční prkno, asymetrické dýchání do propadlé (konkávní) strany žeber.'
  },
  {
    region: 'spine',
    name: 'Test hrudní expanze a bráničního dechu',
    target: 'Hrudní koš, bránice a mezižeberní svaly (klíčové pro Pectus a Astma)',
    how: 'Položte dlaně ze stran na spodní žebra, zhluboka se nadechněte nosem do dlaní a pomalu vydechněte ústy.',
    norm: 'Spodní žebra se symetricky rozšiřují do stran o 3–5 cm a ramena zůstávají v klidu dole.',
    deficit: 'Zvedání ramen k uším při nádechu (povrchové dýchání horním hrudníkem a přetížení šíje).',
    fix: 'Dechový trenažér 4-2-6, Open Book rotace hrudníku, Dead Bug s pomalým výdechem.'
  },
  {
    region: 'upper',
    name: 'Apleyho škrábací test (Apley Scratch Test)',
    target: 'Ramenní kloub a lopatka (vnitřní/zevní rotace a pohyblivost)',
    how: 'Jednou rukou sáhněte shora za krk mezi lopatky, druhou zdola za záda vzhůru; zkuste k sobě přiblížit konečky prstů (pak strany vyměňte).',
    norm: 'Prsty se dotknou nebo překryjí; rozdíl mezi pravou a levou stranou je max. 2–3 cm.',
    deficit: 'Velká mezera nebo bolest vpředu v rameni značí zkrácené prsní svaly, latissimus či tuhou hrudní páteř.',
    fix: 'PNF protažení prsních svalů o stěnu, Wall Slides, Face Pulls, Extenze hrudníku přes válec.'
  },
  {
    region: 'lower',
    name: 'Thomasův test (Zkrácení flexorů kyčle)',
    target: 'Kyčelní kloub (m. iliopsoas a přímý sval stehenní)',
    how: 'Sedněte si na samotný okraj pevného stolu/lavice, přitáhněte si jedno koleno k hrudníku a lehněte si na záda; druhou nohu nechte volně viset dolů.',
    norm: 'Stehno volné nohy leží vodorovně na podložce a bérec visí svisle dolů (90° v koleni).',
    deficit: 'Stehno se zvedá nad podložku (zkrácený iliopsoas) nebo se bérec narovnává (zkrácený rectus femoris).',
    fix: 'Protažení flexorů kyčle v kleku s podsazením pánve, Dead Bug, Hip Thrust.'
  },
  {
    region: 'lower',
    name: 'Test dorzální flexe kotníku (Knee-to-Wall)',
    target: 'Hlezenní kloub, Achillova šlacha a lýtkový sval (soleus)',
    how: 'Postavte špičku bosé nohy 10 cm od zdi a zkuste se kolenem dotknout zdi, aniž by se pata zvedla ze země nebo koleno uhnulo dovnitř.',
    norm: 'Koleno se snadno dotkne zdi ze vzdálenosti 10–12 cm (rozdíl stran < 1,5 cm).',
    deficit: 'Pata se zvedá (tuhý kotník) – tělo to při chůzi a dřepu kompenzuje propadem klenby a bolestí kolene.',
    fix: 'Mobilizace kotníku Knee-to-Wall, výpony s pomalým spouštěním paty, Hluboký odpočinkový dřep.'
  },
  {
    region: 'lower',
    name: 'Test hlubokého dřepu s pažemi nad hlavou',
    target: 'Komplexní souhra kotníků, kolen, kyčlí, hrudní páteře a ramen',
    how: 'Postavte se na šířku ramen, vzpažte natažené ruce nad hlavu a pomalu klesněte do co nejhlubšího dřepu.',
    norm: 'Kyčle klesnou pod úroveň kolen, paty zůstávají na zemi, trup je rovnoběžný s holení a paže nepadají vpřed.',
    deficit: 'Zvedání pat (tuhé kotníky), vtáčení kolen dovnitř (slabé hýždě) nebo hluboký předklon (tuhý hrudník/ramena).',
    fix: 'Goblet dřep, Boční úkroky s gumou, Extenze hrudní páteře přes válec.'
  },
  {
    region: 'lower',
    name: 'Trendelenburgův test / Stoj na jedné noze (30 s)',
    target: 'Stabilita pánve (gluteus medius) a rovnovážný systém',
    how: 'Postavte se na jednu nohu, druhou pokrčte v koleni (90°) a vydržte 30 sekund (pokročilí se zavřenýma očima).',
    norm: 'Pánev zůstává vodorovná, trup se neuklání a stojný kotník je klidný.',
    deficit: 'Pokles pánve na straně zvednuté nohy (oslabený střední sval hýžďový na stojné noze) nebo výrazné kymácení.',
    fix: 'Boční prkno, Bulharský dělený dřep, Y-Balance dosahování nohou ve stoje.'
  }
];

// Popisy přesahu pro kartu Fáze superkompenzace. Časy obnovy se počítají z RECOVERY_MODEL (viz deník),
// takže deník i karty zotavení a superkompenzace vycházejí ze stejných čísel.
const SC_DATA = {
  strength: { trans: 'Vysoký strukturální a CNS nárok; pozitivně zvyšuje potenciál pro výbušnost (RFD) a hustotu kostí.' },
  endurance: { trans: 'Metabolický a glykogenový nárok; zrychluje obnovu rychlé energie ATP-CP mezi sériemi v ostatních pilířích.' },
  explosive: { trans: 'Vysoká únava CNS a šlach při minimálním vyčerpání glykogenu; přenáší se do sprintu a agility.' },
  agility: { trans: 'Excentrické zatížení dolních končetin + reakční rychlost CNS; vyžaduje čerstvé svaly před těžkými dřepy.' },
  coord: { trans: 'Minimální metabolická únava; urychluje regeneraci a zlepšuje technickou ekonomiku všech pilířů.' }
};
