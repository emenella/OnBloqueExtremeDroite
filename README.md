# Bloqueur auto – onbloquelextremedroite

Extension de navigateur (Manifest V3) qui automatise le blocage de comptes à partir du site [onbloquelextremedroite.fun](https://onbloquelextremedroite.fun/).

Le site propose un bouton « ouvrir le profil » qui ouvre chaque compte dans un nouvel onglet. L'extension enchaîne ensuite les étapes à ta place : elle ouvre le profil, clique sur « Bloquer », confirme, ferme l'onglet et passe au profil suivant.

> **Projet indépendant.** Cette extension n'est ni affiliée ni validée par le site onbloquelextremedroite.fun, ni par X, Instagram, TikTok ou Facebook. Elle agit uniquement sur ton propre compte, dans ton navigateur.

## Fonctionnalités

- Enchaînement automatique : ouverture du profil, blocage, fermeture de l'onglet, profil suivant
- Mode **vérification** : l'extension te demande de confirmer chaque blocage (bouton « Bloquer » ou « Passer »)
- Mode **automatique** : blocage sans clic
- Limite journalière réglable, ou **sans limite**
- Délais aléatoires entre deux profils, pour imiter un comportement humain
- Détection des comptes déjà bloqués (ils sont passés sans être comptés)
- Compteur du jour, total et statistiques par réseau dans le popup
- Pause automatique en cas d'échec, avec l'onglet laissé ouvert pour que tu voies ce qui bloque

## Réseaux supportés

| Réseau | État |
|---|---|
| X (Twitter) | Supporté |
| Instagram | Supporté |
| TikTok | Supporté |
| Facebook | Best-effort, peu testé |
| YouTube | Non automatisé : l'extension se met en pause, bloque à la main |

Les interfaces de ces réseaux changent souvent. Si une étape échoue, voir la section [Adapter les sélecteurs](#adapter-les-sélecteurs).

## Installation

L'extension n'est pas publiée sur un store : elle s'installe en mode développeur. Fonctionne sur Chrome, Edge et Brave.

1. Télécharge ou clone ce dépôt.
2. Ouvre `chrome://extensions` (ou `edge://extensions`, `brave://extensions`).
3. Active le **mode développeur**.
4. Clique sur **Charger l'extension non empaquetée** et sélectionne le dossier du projet.

Il faut aussi être **connecté** à chaque réseau dans le même navigateur : sans connexion, les boutons de blocage n'existent pas.

## Utilisation

1. Va sur [onbloquelextremedroite.fun](https://onbloquelextremedroite.fun/). Un panneau « Bloqueur auto » apparaît en bas à droite.
2. Clique sur **Démarrer**.
3. L'extension ouvre un profil. Selon ton réglage :
   - **Vérification activée** : une barre s'affiche sur le profil, clique sur **Bloquer** ou **Passer**.
   - **Vérification désactivée** : le blocage se lance seul après 2 à 4 secondes.
4. L'onglet se ferme, puis le profil suivant s'ouvre après un délai de 4 à 9 secondes.
5. Clique sur **Arrêter** pour interrompre.

Le site recommande de vérifier chaque profil avant de bloquer, car sa liste peut contenir des erreurs. Le mode vérification est fait pour ça.

## Avertissements

- **Conditions d'utilisation.** L'automatisation de clics peut aller à l'encontre des conditions des plateformes et déclencher des limites, des vérifications ou des restrictions sur ton compte. Garde une limite journalière raisonnable et des délais aléatoires.
- **Liste tierce.** Les comptes proviennent du site, dont tu ne maîtrises pas le contenu. Utilise le mode vérification si tu veux contrôler chaque profil.
- **Aucune garantie.** L'extension dépend de l'interface de sites qui changent sans prévenir et peut cesser de fonctionner à tout moment.
- **Données.** Rien n'est envoyé à un serveur : les réglages et compteurs sont enregistrés localement dans ton navigateur (`chrome.storage`).

## Crédits

Créé par [emenella](https://github.com/emenella).
