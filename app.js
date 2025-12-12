// ========== MENU BURGER AVEC LOGS ==========
console.log('🚀 Script chargé');

const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

console.log('🍔 Burger:', burger);
console.log('🧭 Nav:', nav);

if (burger && nav) {
  console.log('✅ Burger et Nav trouvés !');
  
  const toggleMenu = (force) => {
    const isOpen = force ?? !nav.hasAttribute('hidden');
    console.log('📍 Toggle appelé - isOpen:', isOpen);
    
    if (isOpen) {
      nav.removeAttribute('hidden');
      burger.setAttribute('aria-expanded', 'true');
      console.log('✅ Menu OUVERT');
    } else {
      nav.setAttribute('hidden', '');
      burger.setAttribute('aria-expanded', 'false');
      console.log('❌ Menu FERMÉ');
    }
    
    const srText = burger.querySelector('.sr-only');
    if (srText) {
      srText.textContent = isOpen ? 'Fermer le menu' : 'Ouvrir le menu';
    }
  };

  burger.addEventListener('click', (e) => {
    console.log('🖱️ CLIC DÉTECTÉ SUR BURGER');
    e.preventDefault();
    toggleMenu();
  });

  // Initialisation
  if (window.innerWidth > 768) {
    nav.removeAttribute('hidden');
    console.log('💻 Desktop détecté - nav visible');
  } else {
    nav.setAttribute('hidden', '');
    console.log('📱 Mobile détecté - nav cachée');
  }
} else {
  console.error('❌ ERREUR : Burger ou Nav introuvable !');
  console.log('Burger:', burger);
  console.log('Nav:', nav);
}

// ========== THÈME CLAIR/SOMBRE PERSISTANT ==========
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;
const KEY = 'theme-dark';

// Charge la préférence sauvegardée
if (localStorage.getItem(KEY) === '1') {
  html.classList.add('theme-dark');
}

// Bascule et sauvegarde au clic
themeToggle?.addEventListener('click', function() {
  const isDark = html.classList.toggle('theme-dark');
  localStorage.setItem(KEY, isDark ? '1' : '0');
  
  // Bonus : aria-pressed pour l'accessibilité
  this.setAttribute('aria-pressed', String(isDark));
});

// ========== VALIDATION DE FORMULAIRE (Partie C) ==========
const form = document.querySelector('form');

// ⬇️ CORRECTION : Déclare les champs ICI pour qu'ils soient accessibles partout
const nom = form?.querySelector('#nom');
const email = form?.querySelector('#email');
const sujet = form?.querySelector('#sujet');
const message = form?.querySelector('#message');

form?.addEventListener('submit', (e) => {
  let ok = true;
  
  // Reset des erreurs précédentes
  form.querySelectorAll('[role="alert"]').forEach(n => n.remove());
  [nom, email, sujet, message].forEach(el => {
    if (el) el.setAttribute('aria-invalid', 'false');
  });
  
  // Validation Nom
  if (nom && !nom.value.trim()) {
    ok = false;
    showError(nom, 'Le nom est requis.');
  }
  
  // Validation Email (regex simple)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    ok = false;
    showError(email, 'Email invalide.');
  }
  
  // Validation Sujet
  if (sujet && !sujet.value.trim()) {
    ok = false;
    showError(sujet, 'Le sujet est requis.');
  }
  
  // Validation Message (minimum 10 caractères)
  if (message && message.value.trim().length < 10) {
    ok = false;
    showError(message, 'Le message doit contenir au moins 10 caractères.');
  }
  
  if (!ok) {
    e.preventDefault();
    // Focus sur le premier champ en erreur
    const firstError = form.querySelector('[aria-invalid="true"]');
    firstError?.focus();
  } else {
    // Si tout est OK, on peut afficher un message de succès
    e.preventDefault(); // Retire ça quand tu auras un vrai backend
    alert('Formulaire envoyé avec succès ! 🎉');
  }
});

// Fonction pour afficher une erreur
function showError(el, msg) {
  el.setAttribute('aria-invalid', 'true');
  const p = document.createElement('p');
  p.setAttribute('role', 'alert');
  p.style.color = '#c1121f';
  p.style.marginTop = '0.25rem';
  p.style.fontSize = '0.9rem';
  p.textContent = msg;
  el.insertAdjacentElement('afterend', p);
}

// Validation live (bonus) : retire l'erreur dès que le champ est corrigé
[nom, email, sujet, message].forEach(field => {
  field?.addEventListener('input', function() {
    if (this.getAttribute('aria-invalid') === 'true') {
      // Revérifie le champ
      let isValid = false;
      
      if (this.id === 'nom' || this.id === 'sujet') {
        isValid = this.value.trim().length > 0;
      } else if (this.id === 'email') {
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
      } else if (this.id === 'message') {
        isValid = this.value.trim().length >= 10;
      }
      
      if (isValid) {
        this.setAttribute('aria-invalid', 'false');
        // Retire le message d'erreur
        const error = this.nextElementSibling;
        if (error && error.getAttribute('role') === 'alert') {
          error.remove();
        }
      }
    }
  });
});

// ========== COMPTEUR DE CARACTÈRES (Partie D) ==========
const msgField = document.getElementById('message');
const compteur = document.getElementById('restant');

msgField?.addEventListener('input', () => {
  if (!compteur) return;
  const max = msgField.maxLength || 280;
  const restant = max - msgField.value.length;
  compteur.textContent = restant;
  
  // Change la couleur si proche de la limite
  if (restant < 20) {
    compteur.style.color = '#c1121f';
    compteur.style.fontWeight = 'bold';
  } else {
    compteur.style.color = '';
    compteur.style.fontWeight = '';
  }
});

// ========== CHARGER PROJETS VIA JSON (Partie E) ==========
async function chargerProjets() {
  const root = document.getElementById('liste-projets');
  if (!root) return; // Pas sur la page projets
  
  try {
    const res = await fetch('projets.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    
    const data = await res.json();
    root.innerHTML = ''; // Vide le conteneur
    
    for (const p of data) {
      const card = document.createElement('article');
      card.className = 'carte';
      card.dataset.tag = p.tag; // Pour les filtres futurs
      
      card.innerHTML = `
        <img src="${p.img}" alt="${p.titre}" loading="lazy" />
        <h3>${p.titre}</h3>
        <div class="meta">
          <span>🏷️ ${p.tag}</span>
        </div>
        <p class="carte-description">${p.desc}</p>
        <button class="toggle-text">Afficher plus</button>
        <a class="btn" href="${p.lien || '#'}">Voir le projet</a>
      `;
      
      root.appendChild(card);
    }
    
    // Réactive le bouton "Afficher plus" sur les nouvelles cartes
    initToggleButtons();
    
  } catch (err) {
    root.innerHTML = '<p style="color: #c1121f;">❌ Impossible de charger les projets.</p>';
    console.error('Erreur fetch:', err);
  }
}

// Appelle la fonction si on est sur la page projets
if (document.getElementById('liste-projets')) {
  chargerProjets();
}

// ========== BOUTON "AFFICHER PLUS" DES CARTES ==========
function initToggleButtons() {
  const cartes = document.querySelectorAll('.carte');
  
  cartes.forEach(carte => {
    const description = carte.querySelector('.carte-description');
    const toggleBtn = carte.querySelector('.toggle-text');
    
    if (!description || !toggleBtn) return;
    
    // Vérifie si le texte dépasse 4 lignes
    if (description.scrollHeight > description.clientHeight) {
      carte.classList.add('has-long-text');
      
      // Gère le clic
      toggleBtn.addEventListener('click', function() {
        description.classList.toggle('expanded');
        this.textContent = description.classList.contains('expanded') ? 'Afficher moins' 
          : 'Afficher plus';
      });
    }
  });
}

// Initialise au chargement de la page
document.addEventListener('DOMContentLoaded', initToggleButtons);

// ========== ANNÉE DYNAMIQUE DANS LE FOOTER ==========
const anneeElement = document.getElementById('annee');
if (anneeElement) {
  anneeElement.textContent = new Date().getFullYear();
}

// ========== BOUTON RETOUR EN HAUT ==========
const backToTopBtn = document.getElementById('back-to-top');

if (backToTopBtn) {
  // Affiche après 300px de scroll
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  
  // Remonte au clic
  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}