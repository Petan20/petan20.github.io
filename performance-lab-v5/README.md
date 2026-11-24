# Performance Lab

Tréninkový a zdravotní nástroj: osobní dávkování 100 cviků podle profilu klienta, 26 zdravotních skupin, trénink podle sportu a cíle, pohybové svačinky proti sezení, deník a regenerace, výživa a recepty.

## Co je nového ve verzi 5

- **Začít + Můj profil:** jedno místo pro věk, hmotnost, výšku, zkušenost, klidový a max. tep, betablokátory, únavu, spánek a bolest. Údaje se propisují do všech výpočtů.
- **26 zdravotních skupin** (dříve 6): mj. těhotenství, po porodu, PCOS, obezita, diabetes, ztučnělá játra, štítná žláza, ledviny, vysoký tlak, po infarktu, sarkopenie, artróza, bolesti zad, skolióza, hypermobilita, CHOPN, long covid, deprese a úzkost, onkologie, sedavé zaměstnání. U každé: jak trénovat, co je vhodné, čemu se vyhnout, kdy k lékaři, varovné signály a zdroje.
- **Osobní předpis u 100 cviků:** série, opakování, % 1RM a odhad kg, RPE / opakování v záloze, pauza, tempo, dech; vytrvalost podle Karvonena. Upravuje se podle úrovně, věku, zdravotní skupiny a dnešní připravenosti. U každého cviku je přehled, pro koho je nevhodný nebo jen s úpravou.
- **Sport a cíl:** 7 cílů (vytrvalost, síla, výbušnost, rychlost, svaly, prevence zranění, regenerace) s parametry podle ACSM, NSCA a přehledových studií a s uplatněním v konkrétním sportu.
- **Pohybové svačinky** proti dlouhému sezení, **Recepty** (27 jídel s nutričními hodnotami a přepočtem na váš příjem), **vysvětlení grafů** tlačítkem „?“.
- **Kontrola bílkovin:** strop 2,2 g/kg, spodní hranice při hubnutí a ve věku 65+, výpočet z hmotnosti při BMI 25 u obezity, nejvýše 0,8 g/kg u onemocnění ledvin. Udržovací rozpětí pro silové sporty zvýšeno z 1,0–1,2 na 1,2–1,6 g/kg (ACSM 2016, ISSN 2017).

## Jak otevřít

- **Na počítači:** dvakrát klikněte na `index.html`. Funguje i bez internetu (jen písmo Inter se načítá z Google Fonts, bez připojení se použije systémové písmo).
- **Na webu:** nahrajte celou složku (ne jen `index.html`) na hosting, např. Netlify, GitHub Pages nebo Vercel.
- **Na telefonu:** otevřete adresu webu v prohlížeči. Stránku lze přidat na plochu (Safari: Sdílet → Přidat na plochu; Chrome: menu → Přidat na plochu) a pak se otevírá jako aplikace.

## Struktura

```
index.html                  struktura stránky (HTML)
manifest.webmanifest        nastavení pro přidání na plochu telefonu
css/
  tailwind.css              sestavené styly Tailwind (negenerujte ručně)
  tailwind.input.css        vstup pro sestavení Tailwindu
  app.css                   vlastní styly: karty, tmavý vzhled, barvy pilířů
js/
  theme-init.js             nastaví tmavý/světlý vzhled ještě před vykreslením
  helpers.js                pomocné funkce a společný stav
  data/profiles.js          původní zdravotní profily a 5 pilířů
  data/conditions.js        26 zdravotních skupin, vlastnosti cviků, limity zátěže, zdroje
  data/recipes.js           recepty a nutriční hodnoty potravin
  data/exercises.js         100 cviků a klinické testy kloubů
  data/nutrition.js         výživová data (bílkoviny, GI, kofein, jídelníčky…)
  data/sports.js            22 sportů, zóny, testy, tréninkové jednotky, zdroje
  client.js                 Můj profil, připravenost, Karvonen
  prescribe.js              osobní předpis cviku (série, opakování, zátěž, pauza)
  goals.js                  trénink podle sportu a cíle
  snacks.js                 pohybové svačinky proti sezení
  recipes.js                recepty: filtr a přepočet na porci
  explain.js                rozbalovací vysvětlení grafů
  profile-ui.js             horní lišta, zdravotní průvodce, přepínání sekcí, pilíře
  training.js               databáze cviků, testy kloubů, únava, superkompenzace
  nutrition.js              výpočty výživy a jídelníček
  tools.js                  1RM, dechový trenažér, hydratace
  chat.js                   poradní okno
  diary.js                  deník a grafy obnovy
  theme.js                  přepínač vzhledu a barvy grafů
  plan.js                   výběr sportu a týdenní plán
  zones-tests.js            intenzitní zóny a výkonnostní testy
  load-energy.js            ACWR z deníku, graf zátěže, RED-S, záloha dat
  main.js                   spuštění aplikace
img/                        ikony (sem patří i budoucí fotky cviků)
```

Skripty jsou klasické (ne moduly), takže stránka funguje i po otevření dvojklikem. **Pořadí skriptů v `index.html` je důležité:** pomocné funkce a data musí být načtené před ostatními soubory a `main.js` vždy poslední.

## Úpravy obsahu

- Cviky upravíte v `js/data/exercises.js`, sporty v `js/data/sports.js`, jídla a výživová data v `js/data/nutrition.js`.
- Texty a rozvržení stránky jsou v `index.html`.

## Když přidáte nové Tailwind třídy

Styly v `css/tailwind.css` obsahují jen třídy, které stránka právě používá. Když v HTML nebo JS přidáte novou třídu (např. `bg-teal-500`), sestavte styly znovu (potřebujete Node.js):

```
npm install tailwindcss @tailwindcss/cli
npx @tailwindcss/cli -i css/tailwind.input.css -o css/tailwind.css --minify
```

Spouštějte ve složce projektu. Tailwind najde třídy ve všech souborech automaticky.

## Podporované prohlížeče

Tailwind v4 potřebuje moderní prohlížeč: Safari 16.4+ (iPhone s iOS 16.4 a novějším), Chrome 111+, Edge 111+, Firefox 128+. To pokrývá naprostou většinu telefonů a počítačů.

## Data uživatele

Deník, testy a nastavení se ukládají jen v prohlížeči daného zařízení (localStorage). Mezi zařízeními se nesynchronizují; použijte tlačítka **Zálohovat data do souboru** a **Obnovit ze zálohy** v deníku.
