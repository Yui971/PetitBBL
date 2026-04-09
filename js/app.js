/* ============================================
   CAPRICE DES ÎLES — app.js
   Fetch le menu.json, rend le menu dynamiquement,
   gère le toggle FR/EN
   ============================================ */

// ---- 1. ÉTAT GLOBAL ----
const state = {
  menu: null,        // données du JSON une fois chargées
  lang: 'fr',        // langue active
};

// ---- 2. TRADUCTIONS UI (textes hors JSON) ----
const uiText = {
  fr: {
    loading: 'Chargement de la carte…',
    error: 'Impossible de charger la carte. Réessayez plus tard.',
    footerTagline: 'Saveurs des Antilles',
    htmlLang: 'fr',
  },
  en: {
    loading: 'Loading menu…',
    error: 'Unable to load the menu. Please try again later.',
    footerTagline: 'Caribbean flavors',
    htmlLang: 'en',
  },
};

// ---- 3. FETCH DU JSON ----
async function loadMenu() {
  try {
    const response = await fetch('./data/menu.json');
    if (!response.ok) throw new Error('Fetch failed');
    state.menu = await response.json();
    renderAll();
  } catch (err) {
    console.error(err);
    document.getElementById('loading-state').textContent = uiText[state.lang].error;
  }
}

// ---- 4. HELPERS ----

// Récupère un texte bilingue depuis un objet { fr, en }
function t(obj) {
  if (!obj) return '';
  return obj[state.lang] || obj.fr || '';
}

// Formate un prix avec le symbole de devise
function formatPrix(prix) {
  if (prix === null || prix === undefined) return '';
  const symbole = state.menu.restaurant.symbole_devise || '€';
  // Format français : virgule comme séparateur décimal
  return `${prix.toFixed(2).replace('.', ',')} ${symbole}`;
}

// Génère le HTML d'un tag (badge)
function renderTag(tagKey) {
  const def = state.menu.tags_definitions?.[tagKey];
  if (!def) return '';
  return `<span class="tag tag--${tagKey}">${t(def)}</span>`;
}

// ---- 5. RENDU D'UN PLAT STANDARD ----
function renderPlat(plat) {
  const indispo = plat.disponible === false ? 'plat-indispo' : '';
  const tags = (plat.tags || [])
    .filter(tag => tag !== 'rupture' || plat.disponible === false)
    .map(renderTag)
    .join('');

  const description = plat.description && t(plat.description)
    ? `<p class="plat-description">${t(plat.description)}</p>`
    : '';

  const prixNote = plat.prix_note
    ? `<span class="plat-prix-note">${t(plat.prix_note)}</span>`
    : '';

  const prix = plat.prix !== null && plat.prix !== undefined
    ? `<div class="plat-prix">${formatPrix(plat.prix)}${prixNote}</div>`
    : '';

  return `
    <div class="plat ${indispo}">
      <div class="plat-info">
        <h3 class="plat-nom">
          ${t(plat.nom)}
          ${tags ? `<span class="plat-tags">${tags}</span>` : ''}
        </h3>
        ${description}
      </div>
      ${prix}
    </div>
  `;
}

// ---- 6. RENDU D'UNE FORMULE (Buffet, Ti Moun) ----
function renderFormule(cat) {
  const sousTitre = cat.sous_titre
    ? `<span class="category-subtitle">${t(cat.sous_titre)}</span>`
    : '';

  const items = cat.inclus.map(item => `<li>${t(item)}</li>`).join('');

  return `
    <section class="category" id="cat-${cat.id}">
      <div class="category-header">
        <h2 class="category-title">${t(cat.nom)}${sousTitre}</h2>
      </div>
      <div class="formule">
        <ul class="formule-list">${items}</ul>
        <div class="formule-prix">${formatPrix(cat.prix)}</div>
      </div>
    </section>
  `;
}

// ---- 7. RENDU DES GLACES (grille de parfums) ----
function renderGlaces(sous) {
  const parfums = sous.parfums.map(p => `<li class="glace-item">${t(p)}</li>`).join('');
  return `
    <div class="sous-categorie">
      <h3 class="sous-categorie-title">${t(sous.nom)}</h3>
      <p class="glaces-prix-info">${t(sous.prix_info)}</p>
      <ul class="glaces-grid">${parfums}</ul>
    </div>
  `;
}

// ---- 8. RENDU D'UNE CATÉGORIE STANDARD ----
function renderCategorieStandard(cat) {
  const sousTitre = cat.sous_titre
    ? `<span class="category-subtitle">${t(cat.sous_titre)}</span>`
    : '';

  const note = cat.note_globale
    ? `<p class="category-note">${t(cat.note_globale)}</p>`
    : '';

  const plats = cat.plats.map(renderPlat).join('');

  return `
    <section class="category" id="cat-${cat.id}">
      <div class="category-header">
        <h2 class="category-title">${t(cat.nom)}${sousTitre}</h2>
        ${note}
      </div>
      <div class="plats-list">${plats}</div>
    </section>
  `;
}

// ---- 9. RENDU D'UN GROUPE (catégorie avec sous-catégories) ----
function renderGroupe(cat) {
  const sousCats = cat.sous_categories.map(sous => {
    // Cas spécial glaces
    if (sous.type_affichage === 'parfums') {
      return renderGlaces(sous);
    }
    // Sous-catégorie classique
    const plats = sous.plats.map(renderPlat).join('');
    return `
      <div class="sous-categorie">
        <h3 class="sous-categorie-title">${t(sous.nom)}</h3>
        <div class="plats-list">${plats}</div>
      </div>
    `;
  }).join('');

  return `
    <section class="category" id="cat-${cat.id}">
      <div class="category-header">
        <h2 class="category-title">${t(cat.nom)}</h2>
      </div>
      ${sousCats}
    </section>
  `;
}

// ---- 10. DISPATCHER DE RENDU ----
function renderCategorie(cat) {
  switch (cat.type) {
    case 'formule': return renderFormule(cat);
    case 'groupe': return renderGroupe(cat);
    case 'standard':
    default: return renderCategorieStandard(cat);
  }
}

// ---- 11. RENDU DE LA NAV CATÉGORIES ----
function renderNav() {
  const navList = document.getElementById('category-nav-list');
  navList.innerHTML = state.menu.categories
    .map(cat => `<li><a href="#cat-${cat.id}">${t(cat.nom)}</a></li>`)
    .join('');
}

// ---- 12. RENDU COMPLET ----
function renderAll() {
  if (!state.menu) return;

  // Met à jour l'attribut lang du <html>
  document.documentElement.lang = uiText[state.lang].htmlLang;

  // Nav
  renderNav();

  // Menu principal
  const container = document.getElementById('menu-container');
  container.innerHTML = state.menu.categories.map(renderCategorie).join('');

  // Footer tagline
  const tagline = document.querySelector('[data-i18n="footer-tagline"]');
  if (tagline) tagline.textContent = uiText[state.lang].footerTagline;
}

// ---- 13. TOGGLE LANGUE ----
function setupLangToggle() {
  const buttons = document.querySelectorAll('.lang-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const newLang = btn.dataset.lang;
      if (newLang === state.lang) return;

      state.lang = newLang;

      // Mise à jour visuelle des boutons
      buttons.forEach(b => {
        const active = b.dataset.lang === newLang;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active);
      });

      // Re-rendu
      renderAll();
    });
  });
}

// ---- 14. INIT ----
document.addEventListener('DOMContentLoaded', () => {
  setupLangToggle();
  loadMenu();
});
