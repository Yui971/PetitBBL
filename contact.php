<?php
// contact.php
// Configuration de base
mb_internal_encoding('UTF-8');

// Fonction pour échapper les données affichées (anti-XSS)
function e(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// Initialisation des variables
$errors = [];
$nom = '';
$email = '';
$sujet = '';
$message = '';
$success = false;

// Si le formulaire a été soumis
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer et nettoyer les données
    $nom = trim($_POST['nom'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $sujet = trim($_POST['sujet'] ?? '');
    $message = trim($_POST['message'] ?? '');
    
    // === VALIDATION SERVEUR ===
    
    // Nom requis
    if ($nom === '') {
        $errors['nom'] = "Le nom est requis.";
    }
    
    // Email valide
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = "L'adresse email est invalide.";
    }
    
    // Sujet requis
    if ($sujet === '') {
        $errors['sujet'] = "Le sujet est requis.";
    }
    
    // Message minimum 10 caractères
    if (mb_strlen($message) < 10) {
        $errors['message'] = "Le message doit contenir au moins 10 caractères.";
    }
    
    // Si pas d'erreurs : on traite
    if (empty($errors)) {
        $success = true;
        
        // Enregistrer dans un fichier log
        $logLine = sprintf(
            "[%s] %s <%s> - Sujet: %s\nMessage: %s\n---\n",
            date('Y-m-d H:i:s'),
            $nom,
            $email,
            $sujet,
            str_replace(["\r", "\n"], [' ', ' '], $message)
        );
        
        file_put_contents(__DIR__ . '/messages.log', $logLine, FILE_APPEND);
        
        // Vider les champs après envoi réussi
        $nom = $email = $sujet = $message = '';
    }
}
?>
<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Contact — Traitement PHP</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <a href="#contenu" class="skip-link">Aller au contenu principal</a>
    
    <header>
        <div>
            <h1>Chrisnaël BERDIER</h1>
            <p class="subtitle">Contact - Traitement PHP</p>
        </div>
        
        <button id="theme-toggle" aria-label="Basculer entre le mode clair et mode sombre">
            <span class="sun">☀️</span>
            <span class="moon">🌙</span>
            <span class="sr-only">Changer le thème</span>
        </button>
        
        <button id="burger" class="btn" aria-expanded="false" aria-controls="nav">
            <span class="sr-only">Ouvrir le menu</span> ☰
        </button>
        
        <nav id="nav" aria-label="Navigation principale" hidden>
            <ul>
                <li><a href="index.html">Accueil</a></li>
                <li><a href="projets.html">Projets</a></li>
                <li><a class="actif" aria-current="page" href="contact.html">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main id="contenu" role="main">
        <?php if ($success): ?>
            <!-- ========== PAGE DE CONFIRMATION ========== -->
            <section aria-labelledby="t-ok">
                <h2 id="t-ok">✅ Merci, votre message a bien été envoyé !</h2>
                <p>Voici un récapitulatif de votre demande :</p>
                
                <div class="carte" style="margin-top: 1.5rem;">
                    <p><strong>Nom :</strong> <?= e($nom ?: $_POST['nom'] ?? '') ?></p>
                    <p><strong>Email :</strong> <?= e($email ?: $_POST['email'] ?? '') ?></p>
                    <p><strong>Sujet :</strong> <?= e($sujet ?: $_POST['sujet'] ?? '') ?></p>
                    <p><strong>Message :</strong></p>
                    <p style="background: var(--card); padding: 1rem; border-radius: 8px;">
                        <?= nl2br(e($message ?: $_POST['message'] ?? '')) ?>
                    </p>
                </div>
                
                <p style="margin-top: 1.5rem;">
                    <a href="contact.html" class="btn">← Envoyer un nouveau message</a>
                </p>
            </section>
            
        <?php else: ?>
            <!-- ========== FORMULAIRE AVEC ERREURS ========== -->
            <section aria-labelledby="t-form">
                <h2 id="t-form">Formulaire de contact</h2>
                
                <?php if (!empty($errors) && $_SERVER['REQUEST_METHOD'] === 'POST'): ?>
                    <div role="alert" class="carte" style="border: 2px solid #c1121f; padding: 1rem; margin-bottom: 1.5rem; background: #ffe6e6;">
                        <p style="margin: 0 0 0.5rem; font-weight: bold;">⚠️ Le formulaire contient des erreurs :</p>
                        <ul style="margin: 0; padding-left: 1.5rem;">
                            <?php foreach ($errors as $field => $msg): ?>
                                <li><?= e($msg) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>
                
                <form class="carte" action="contact.php" method="post" novalidate>
                    <!-- CHAMP NOM -->
                    <label for="nom">Nom</label>
                    <input
                        id="nom"
                        name="nom"
                        type="text"
                        required
                        value="<?= e($nom) ?>"
                        placeholder="Votre nom complet"
                        aria-invalid="<?= isset($errors['nom']) ? 'true' : 'false' ?>"
                        aria-describedby="nom-aide"
                    >
                    <span id="nom-aide" class="sr-only">Indiquez votre nom et prénom</span>
                    <?php if (isset($errors['nom'])): ?>
                        <p role="alert" style="color: #c1121f; margin: 0.25rem 0 0.5rem; font-size: 0.9rem;">
                            <?= e($errors['nom']) ?>
                        </p>
                    <?php endif; ?>
                    
                    <!-- CHAMP EMAIL -->
                    <label for="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value="<?= e($email) ?>"
                        placeholder="votre.email@exemple.com"
                        aria-invalid="<?= isset($errors['email']) ? 'true' : 'false' ?>"
                        aria-describedby="email-aide"
                    >
                    <span id="email-aide" class="sr-only">Indiquez votre adresse email</span>
                    <?php if (isset($errors['email'])): ?>
                        <p role="alert" style="color: #c1121f; margin: 0.25rem 0 0.5rem; font-size: 0.9rem;">
                            <?= e($errors['email']) ?>
                        </p>
                    <?php endif; ?>
                    
                    <!-- CHAMP SUJET -->
                    <label for="sujet">Sujet</label>
                    <input
                        id="sujet"
                        name="sujet"
                        type="text"
                        required
                        value="<?= e($sujet) ?>"
                        placeholder="Ex : Proposition d'alternance"
                        aria-invalid="<?= isset($errors['sujet']) ? 'true' : 'false' ?>"
                        aria-describedby="sujet-aide"
                    >
                    <span id="sujet-aide" class="sr-only">Indiquez l'objet de votre message</span>
                    <?php if (isset($errors['sujet'])): ?>
                        <p role="alert" style="color: #c1121f; margin: 0.25rem 0 0.5rem; font-size: 0.9rem;">
                            <?= e($errors['sujet']) ?>
                        </p>
                    <?php endif; ?>
                    
                    <!-- CHAMP MESSAGE -->
                    <label for="message">Message (max 280 car.)</label>
                    <textarea
                        id="message"
                        name="message"
                        rows="6"
                        maxlength="280"
                        required
                        placeholder="Écrivez votre message ici..."
                        aria-invalid="<?= isset($errors['message']) ? 'true' : 'false' ?>"
                        aria-describedby="message-aide help-msg"
                    ><?= e($message) ?></textarea>
                    <span id="message-aide" class="sr-only">Décrivez votre demande en détail</span>
                    <p id="help-msg" class="muted">Reste : <span id="restant">280</span> caractères.</p>
                    <?php if (isset($errors['message'])): ?>
                        <p role="alert" style="color: #c1121f; margin: 0.25rem 0 0.5rem; font-size: 0.9rem;">
                            <?= e($errors['message']) ?>
                        </p>
                    <?php endif; ?>
                    
                    <button class="btn" type="submit">Envoyer le message</button>
                </form>
            </section>
        <?php endif; ?>
    </main>
    
    <footer role="contentinfo">
        <small>© <?= date('Y') ?> Chrisnaël BERDIER — BUT MMI • R1.12 PHP</small>
    </footer>
    
    <button id="back-to-top" aria-label="Remonter en haut de la page">
        🚀
    </button>
    
    <script src="app.js" defer></script>
</body>
</html>