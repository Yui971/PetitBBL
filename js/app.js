/* ============================================
   CAPRICE DES ÎLES — app.js V4
   ============================================ */

const state = {
  menu: null,
  lang: 'fr',
};

const LOADER_MIN_DURATION = 1400;
const LOADER_START = performance.now();

// ---- TRADUCTIONS UI ----
const uiText = {
  fr: {
    loading: 'Chargement de la carte…',
    error: 'Impossible de charger la carte. Réessayez plus tard.',
    heroWelcome: 'Bienvenue au',
    heroTagline: 'Saveurs authentiques des Antilles',
    reservationLabel: 'Réservation :',
    scrollMenu: 'Découvrir la carte',
    sidebarLabel: 'La carte',
    footerTagline: 'Saveurs des Antilles',
    footerContactHeading: 'Nous trouver',
    creditsText: 'Design & développement par',
    legalLink: 'Mentions légales',
    htmlLang: 'fr',
    legalTitle: 'Mentions légales',
    legalContent: `
      <h3>Éditeur du site</h3>
      <p>Restaurant <strong>Caprice des Îles</strong><br>
      Av. du Père Labat, Baillif 97123, Guadeloupe<br>
      Téléphone : +590 590 81 74 97</p>

      <h3>Conception &amp; développement</h3>
      <p>Ce site a été conçu et développé par <strong>Chrisnaël Berdier</strong>,
      étudiant en BUT MMI — Parcours Création Numérique à l'IUT de Guadeloupe.</p>
      <p>
        <a href="https://yui971.github.io/portfolio-berdier-chrisnael/" target="_blank" rel="noopener">Portfolio</a> ·
        <a href="https://www.linkedin.com/in/chrisna%C3%ABl-berdier-b634a3389/" target="_blank" rel="noopener">LinkedIn</a>
      </p>

      <h3>Hébergement</h3>
      <p>Ce site est hébergé par <strong>GitHub Pages</strong> — GitHub Inc.,
      88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis.</p>

      <h3>Propriété intellectuelle</h3>
      <p>L'ensemble des contenus (textes, photos, logo, mise en forme) présents sur ce site
      est la propriété du restaurant Caprice des Îles, sauf mention contraire. Toute reproduction
      sans autorisation préalable est interdite.</p>

      <h3>Données personnelles</h3>
      <p>Ce site ne collecte aucune donnée personnelle et n'utilise aucun cookie de suivi.</p>
    `,
  },
  en: {
    loading: 'Loading menu…',
    error: 'Unable to load the menu. Please try again later.',
    heroWelcome: 'Welcome to',
    heroTagline: 'Authentic Caribbean flavors',
    reservationLabel: 'Reservations:',
    scrollMenu: 'Discover the menu',
    sidebarLabel: 'The menu',
    footerTagline: 'Caribbean flavors',
    footerContactHeading: 'Find us',
    creditsText: 'Designed & developed by',
    legalLink: 'Legal notice',
    htmlLang: 'en',
    legalTitle: 'Legal Notice',
    legalContent: `
      <h3>Publisher</h3>
      <p><strong>Caprice des Îles</strong> Restaurant<br>
      Av. du Père Labat, Baillif 97123, Guadeloupe<br>
      Phone: +590 590 81 74 97</p>

      <h3>Design &amp; Development</h3>
      <p>This website was designed and developed by <strong>Chrisnaël Berdier</strong>,
      a Multimedia &amp; Internet student at IUT de Guadeloupe.</p>
      <p>
        <a href="https://yui971.github.io/portfolio-berdier-chrisnael/" target="_blank" rel="noopener">Portfolio</a> ·
        <a href="https://www.linkedin.com/in/chrisna%C3%ABl-berdier-b634a3389/" target="_blank" rel="noopener">LinkedIn</a>
      </p>

      <h3>Hosting</h3>
      <p>This site is hosted by <strong>GitHub Pages</strong> — GitHub Inc.,
      88 Colin P Kelly Jr St, San Francisco, CA 94107, USA.</p>

      <h3>Intellectual property</h3>
      <p>All content (text, photos, logo, layout) on this site is the property of
      Caprice des Îles restaurant unless otherwise stated. Any unauthorized reproduction
      is prohibited.</p>

      <h3>Personal data</h3>
      <p>This site does not collect any personal data and does not use tracking cookies.</p>
    `,
  },
};

// ---- FETCH ----
async function loadMenu() {
  try {
    const response = await fetch('./data/menu.json');
    if (!response.ok) throw new Error('Fetch failed');
    state.menu = await response.json();
    renderAll();
    hideLoaderWithMinDelay();
    setupObservers();
    setupScrollProgress();
  } catch (err) {
    console.error(err);
    document.getElementById('loading-state').textContent = uiText[state.lang].error;
    hideLoaderWithMinDelay();
  }
}

function hideLoaderWithMinDelay() {
  const elapsed = performance.now() - LOADER_START;
  const remaining = Math.max(0, LOADER_MIN_DURATION - elapsed);
  setTimeout(() => {
    document.getElementById('loader').classList.add('is-hidden');
  }, remaining);
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

// ---- RENDUS ----
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

function renderFormule(cat) {
  const sousTitre = cat.sous_titre ? `<span class="category-subtitle">${t(cat.sous_titre)}</span>` : '';
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

function renderCategorieStandard(cat) {
  const sousTitre = cat.sous_titre ? `<span class="category-subtitle">${t(cat.sous_titre)}</span>` : '';
  const note = cat.note_globale ? `<p class="category-note">${t(cat.note_globale)}</p>` : '';
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

// ---- NAVS (sidebar + drawer + header) ----
function renderNavs() {
  const links = state.menu.categories
    .map(cat => `<li><a href="#cat-${cat.id}" data-cat-id="${cat.id}">${t(cat.nom)}</a></li>`)
    .join('');

  document.getElementById('sidebar-nav-list').innerHTML = links;
  document.getElementById('drawer-nav-list').innerHTML = links;
  document.getElementById('header-nav-list').innerHTML = links;
}

// ---- I18N UI ----
function updateUIText() {
  const texts = uiText[state.lang];
  const set = (selector, value) => {
    document.querySelectorAll(selector).forEach(el => el.textContent = value);
  };

  set('[data-i18n="hero-welcome"]', texts.heroWelcome);
  set('[data-i18n="hero-tagline"]', texts.heroTagline);
  set('[data-i18n="reservation-label"]', texts.reservationLabel);
  set('[data-i18n="scroll-menu"]', texts.scrollMenu);
  set('[data-i18n="sidebar-label"]', texts.sidebarLabel);
  set('[data-i18n="footer-tagline"]', texts.footerTagline);
  set('[data-i18n="footer-contact-heading"]', texts.footerContactHeading);
  set('[data-i18n="credits-text"]', texts.creditsText);
  set('[data-i18n="legal-link"]', texts.legalLink);
}

// ---- RENDU COMPLET ----
function renderAll() {
  if (!state.menu) return;
  document.documentElement.lang = uiText[state.lang].htmlLang;

  renderNavs();
  document.getElementById('menu-container').innerHTML =
    state.menu.categories.map(renderCategorie).join('');
  updateUIText();
}

// ---- OBSERVERS (révélation + nav active) ----
let revealObs = null;
let activeObs = null;

function setupObservers() {
  if (revealObs) revealObs.disconnect();
  if (activeObs) activeObs.disconnect();

  // Révélation au scroll
  revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.category').forEach(cat => revealObs.observe(cat));

  // Highlight de l'item actif (sidebar + drawer + header nav)
  const allLinks = document.querySelectorAll('[data-cat-id]');

  activeObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id.replace('cat-', '');
        allLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.catId === id);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  document.querySelectorAll('.category').forEach(cat => activeObs.observe(cat));
}

// ---- BARRE DE PROGRESSION SIDEBAR ----
function setupScrollProgress() {
  const bar = document.getElementById('sidebar-progress-bar');
  if (!bar) return;

  const update = () => {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) return;

    const rect = menuContainer.getBoundingClientRect();
    const containerTop = rect.top + window.scrollY;
    const containerHeight = menuContainer.offsetHeight;
    const scrollPos = window.scrollY + window.innerHeight * 0.4;

    let progress = (scrollPos - containerTop) / containerHeight;
    progress = Math.max(0, Math.min(1, progress));

    bar.style.height = `${progress * 100}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
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
      setupObservers();

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

// ---- DRAWER MOBILE ----
function setupDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const toggleBtn = document.getElementById('drawer-toggle');
  const closeBtns = drawer.querySelectorAll('[data-close-drawer]');
  let lastFocused = null;

  function openDrawer() {
    lastFocused = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('scroll-locked');
    setTimeout(() => drawer.querySelector('.drawer-close')?.focus(), 200);
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('scroll-locked');
    if (lastFocused) lastFocused.focus();
  }

  toggleBtn.addEventListener('click', openDrawer);
  closeBtns.forEach(btn => btn.addEventListener('click', closeDrawer));

  // Fermeture auto au clic sur un lien de catégorie
  drawer.querySelector('#drawer-nav-list').addEventListener('click', (e) => {
    if (e.target.closest('a')) closeDrawer();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });
}

// ---- MODAL MENTIONS LÉGALES ----
function setupLegalModal() {
  const modal = document.getElementById('legal-modal');
  const openBtn = document.getElementById('open-legal');
  const closeBtns = modal.querySelectorAll('[data-close-modal]');
  const body = document.getElementById('legal-modal-body');
  const title = document.getElementById('legal-modal-title');
  let lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    body.innerHTML = uiText[state.lang].legalContent;
    title.textContent = uiText[state.lang].legalTitle;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('scroll-locked');
    setTimeout(() => modal.querySelector('.modal-close').focus(), 100);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('scroll-locked');
    if (lastFocused) lastFocused.focus();
  }

  openBtn.addEventListener('click', openModal);
  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
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
  setupDrawer();
  setupLegalModal();
  loadMenu();
});
