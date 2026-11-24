// Performance Lab · Spuštění aplikace
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

// Inicializace všech modulů
applyThemeLabel();
initConditionSelect();     // naplní výběr 26 zdravotních skupin
loadClient();              // načte uložený profil, pohlaví a skupinu
applySexButtons();
initSportSelects();
initNutritionStatic();
document.getElementById('d-date').value = todayISO();
updateProfile();          // počítá výživu, fáze superkompenzace, deník, plán a zdravotního průvodce
renderSportProfile();
renderPlan();
renderPillars();
renderExercises();
renderTests();
calcFatigue();
calcHooper();
calcHR();
calc1RM();
calcHydration();
renderDiaryHistory();
initPerf();
renderTrend();
renderReferences();
loadChat();
renderClientSummary();
renderGoals();
renderSnacks();
initRecipes();
initExplainers();

// Otevřeme naposledy zvolenou sekci (poprvé „Začít“)
const savedView = safeGet('plab_view', 'start');
switchView(document.querySelector(`.view-btn[data-view="${savedView}"]`) ? savedView : 'start');

// Při změně šířky okna překreslíme grafy, aby popisky zůstaly čitelné
let resizeTimer = null;
let lastChartWidth = document.getElementById('d-combined-chart').clientWidth;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const wNow = document.getElementById('d-combined-chart').clientWidth;
    if (Math.abs(wNow - lastChartWidth) > 8) { lastChartWidth = wNow; renderCharts(); renderTrend(); }
  }, 150);
});
