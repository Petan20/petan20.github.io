// Performance Lab · Pomocné funkce a společný stav aplikace
// Klasický skript: proměnné a funkce sdílí s ostatními soubory (pořadí načtení je v index.html).

// ============================================================================
// POMOCNÉ FUNKCE
// ============================================================================

// Převede text na bezpečný HTML řetězec (ochrana před vložením kódu)
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

// localStorage může vyhodit výjimku (zablokované cookies, plné úložiště)
function safeGet(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
}
function safeRemove(key) {
  try { localStorage.removeItem(key); } catch (e) { /* nic */ }
}

// Přečte číslo z pole a ořízne ho podle atributů min/max
function num(id, fallback) {
  const el = document.getElementById(id);
  if (!el) return fallback;
  const v = parseFloat(String(el.value).replace(',', '.'));
  if (Number.isNaN(v)) return fallback;
  const minAttr = el.getAttribute('min');
  const maxAttr = el.getAttribute('max');
  const min = minAttr !== null && minAttr !== '' ? +minAttr : -Infinity;
  const max = maxAttr !== null && maxAttr !== '' ? +maxAttr : Infinity;
  return Math.min(max, Math.max(min, v));
}

// Formát čísla v češtině (desetinná čárka)
function fmt(value, digits = 0) {
  return Number(value).toLocaleString('cs-CZ', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

// Nastaví stav přepínače pro čtečky obrazovky
function setPressed(el, pressed) {
  if (el) el.setAttribute('aria-pressed', pressed ? 'true' : 'false');
}

const STATE = {
  sex: 'male',
  condition: 'standard',
  pillar: 'strength',
  exPillar: 'strength',
  mealIdx: 0
};
