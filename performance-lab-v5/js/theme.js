// Performance Lab · Tmavý a světlý vzhled, barvy pilířů
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

// ============================================================================
// VZHLED (tmavý / světlý)
// ============================================================================
function isDark() { return document.documentElement.classList.contains('theme-dark'); }

function applyThemeLabel() {
  const dark = isDark();
  document.getElementById('theme-label').textContent = dark ? 'Světlý režim' : 'Tmavý režim';
  setPressed(document.getElementById('theme-toggle'), dark);
}

function toggleTheme() {
  document.documentElement.classList.toggle('theme-dark');
  safeSet('plab_theme', isDark() ? 'dark' : 'light');
  applyThemeLabel();
  renderCharts();
  renderTrend();
  renderPillars();
  renderExercises();
  renderPlan();
  renderSportProfile();
}

// Barvy pro grafy podle vzhledu (SVG atributy neumí CSS proměnné)
function chartColors() {
  return isDark()
    ? { text: '#9FB0C8', grid: '#22304A', ink: '#E6EDF7', up: 'rgba(16,185,129,0.14)', down: 'rgba(245,158,11,0.10)', upText: '#6EE7B7', downText: '#FCD34D', dotStroke: '#0B1220', panel: '#0F1A2B' }
    : { text: '#475569', grid: '#E2E8F0', ink: '#0F172A', up: '#ECFDF5', down: 'rgba(255,251,235,0.55)', upText: '#047857', downText: '#B45309', dotStroke: '#FFFFFF', panel: '#FFFFFF' };
}

function pillarColor(key) {
  return getComputedStyle(document.documentElement).getPropertyValue('--p-' + key).trim() || '#64748B';
}

const PILLAR_LABELS = { strength: 'Síla', endurance: 'Vytrvalost', explosive: 'Výbušnost', agility: 'Agility', coord: 'Koordinace' };
