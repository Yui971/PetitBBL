/* ============================================
   CAPRICE DES ÎLES — app.js V2
   ============================================ */

const state = {
  menu: null,
  lang: 'fr',
};

// ---- TRADUCTIONS UI ----
const uiText = {
  fr: {
    loading: 'Chargement de la carte…',
    error: 'Impossible de charger la carte. Réessayez plus tard.',
    footerTagline: 'Saveurs des Antilles',
    creditsText: 'Design & développement par',
    hosting: 'Hébergé sur GitHub Pages',
    legalLink: 'Mentions légales',
    htmlLang: 'fr',
  },
  en: {
    loading: 'Loading menu…',
    error: 'Unable to load the menu. Please try again later.',
    footerTagline: 'Caribbean flavors',
    creditsText: 'Designed & developed by',
    hosting: 'Hosted on GitHub Pages',
    legalLink: 'Legal notice',
    htmlLang: 'en',
  },
};

// ---- FETCH ----
async function loadMenu() {
  try {
    const response = await fetch('./data/menu.json');
    if (!response.ok) throw new Error('Fetch failed');
    state.menu = await response.json();
    renderAll();
    hideLoader();
    setupObservers();
  } catch (err) {
    console.error(err);
    document.getElementById('loading-state').textContent = uiText[state.lang].error;
    hideLoader();
  }
}

// ---- LOADER ----
function hideLoader() {
  const loader = document.getElementById('loader');
  // Petite attente mini pour éviter un flash
  setTimeout(() => loader.classList.add('is-hidden'), 400);
}

// ---- HELPERS ----
function t(obj) {
  if (!obj) return '';
  return obj[state.lang] || obj.fr || '';
}

function formatPrix(prix) {
  if (prix === null || prix === undefined) return '';
  const symbole = state.menu.restaurant.symbole_devise || '€';
  return `${prix.toFixed(2).replace('.', ',')} ${symbole}`;
}

function renderTag(tagKey) {
  const def = state.menu.tags_definitions?.[tagKey];
  if (!def) return '';
  return `<span class="tag tag--${tagKey}">${t(def)}</span>`;
}

// ---- RENDU PLAT ----
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

// ---- FORMULE ----
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

// ---- GLACES ----
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

// ---- CATÉGORIE STANDARD ----
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

// ---- GROUPE ----
function renderGroupe(cat) {
  const sousCats = cat.sous_categories.map(sous => {
    if (sous.type_affichage === 'parfums') return renderGlaces(sous);
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

function renderCategorie(cat) {
  switch (cat.type) {
    case 'formule': return renderFormule(cat);
    case 'groupe': return renderGroupe(cat);
    default: return renderCategorieStandard(cat);
  }
}

// ---- NAV ----
function renderNav() {
  const navList = document.getElementById('category-nav-list');
  navList.innerHTML = state.menu.categories
    .map(cat => `<li><a href="#cat-${cat.id}" data-cat-id="${cat.id}">${t(cat.nom)}</a></li>`)
    .join('');
}

// ---- FOOTER I18N ----
function updateFooterI18n() {
  const texts = uiText[state.lang];
  const set = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };
  set('[data-i18n="footer-tagline"]', texts.footerTagline);
  set('[data-i18n="credits-text"]', texts.creditsText);
  set('[data-i18n="hosting"]', texts.hosting);
  set('[data-i18n="legal-link"]', texts.legalLink);
}

// ---- RENDU COMPLET ----
function renderAll() {
  if (!state.menu) return;

  document.documentElement.lang = uiText[state.lang].htmlLang;

  renderNav();
  const container = document.getElementById('menu-container');
  container.innerHTML = state.menu.categories.map(renderCategorie).join('');
  updateFooterI18n();
}

// ---- OBSERVERS ----
function setupObservers() {
  // 1. Révélation des catégories au scroll
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

  document.querySelectorAll('.category').forEach(cat => revealObs.observe(cat));

  // 2. Highlight nav active selon la catégorie visible
  const navLinks = document.querySelectorAll('.category-nav a');
  const activeObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id.replace('cat-', '');
        navLinks.forEach(link => {
          const isActive = link.dataset.catId === id;
          link.classList.toggle('active', isActive);
          // Auto-scroll de la nav pour garder l'item actif visible (mobile)
          if (isActive) {
            link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  document.querySelectorAll('.category').forEach(cat => activeObs.observe(cat));
}

// ---- TOGGLE LANGUE ----
function setupLangToggle() {
  const buttons = document.querySelectorAll('.lang-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const newLang = btn.dataset.lang;
      if (newLang === state.lang) return;
      state.lang = newLang;
      buttons.forEach(b => {
        const active = b.dataset.lang === newLang;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active);
      });
      renderAll();
      // Re-déclencher les animations de révélation puisque le DOM est recréé
      setupObservers();
      // Les catégories déjà visibles doivent apparaître immédiatement
      requestAnimationFrame(() => {
        document.querySelectorAll('.category').forEach(cat => {
          const rect = cat.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            cat.classList.add('is-visible');
          }
        });
      });
    });
  });
}

// ---- BACK TO TOP ----
function setupBackToTop() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---- ANNÉE COURANTE ----
function setCurrentYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  setCurrentYear();
  setupLangToggle();
  setupBackToTop();
  loadMenu();
});
