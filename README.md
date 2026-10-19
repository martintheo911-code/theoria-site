# THEORIA

Site de résumés de match : moments clés, chiffres, xG et lecture tactique.
Site statique (HTML, CSS, JavaScript sans dépendance ni étape de build),
directement publiable sur GitHub Pages.

Le dossier [`food/`](food/README.md) contient un second site, indépendant :
FOOD, micro-ferme organique à Guînes.

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : match à la une, résultats, résumés de la semaine, moments clés, chiffres, archives filtrables, joueurs de la semaine, newsletter |
| `match.html#<id>` | Résumé complet d’un match : score, récit, fiche, moments clés, chiffres, analyse, compositions |

## Lancer en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Structure

```
assets/
  css/theoria.css     styles, jetons de design, états d’animation
  js/data.js          contenu : clubs et matchs (à remplacer)
  js/model.js         calculs : effectifs, tirs, xG, score courant, formats
  js/graphics.js      visuels : terrain 3D, reconstitution du but, affiches, graphiques SVG
  js/motion.js        moteur d’animation (scroll, apparitions, curseur, bandeau…)
  js/ui.js            en-tête, pied de page, composants partagés
  js/home.js          page d’accueil
  js/match.js         page match
  img/favicon.svg
```

## Ajouter un match

Tout le contenu est dans `assets/js/data.js`. Les clubs, joueurs et matchs
fournis sont **fictifs** : remplacez-les par les vôtres.

1. Ajoutez les clubs manquants dans `clubs` (nom, code à trois lettres,
   couleur, formation, joueurs nommés par numéro).
2. Ajoutez un objet dans `matches` :

```js
{
  id: 'club-a-club-b',                 // utilisé dans l’URL : match.html#club-a-club-b
  competition: 'Championnat', round: 'Journée 9',
  date: '2026-10-11', kickoff: '21:00',
  home: 'clubA', away: 'clubB', score: [2, 1], ht: [1, 0],
  attendance: 30000, referee: 'Nom Prénom',
  poster: 'shots',                     // affiche : shots | network | heat | score
  tone: 'dark',                        // affiche claire ou sombre dans les archives
  title: 'Titre du résumé',
  hero: ['Ligne 1', 'ligne 2'],        // gros titre (deux lignes courtes)
  dek: 'Chapô en une ou deux phrases.',
  story: ['Paragraphe 1', 'Paragraphe 2'],
  analysis: 'La lecture tactique, qui s’allume mot à mot au scroll.',
  replay: 81,                          // minute du but reconstitué en haut de page
  stats: { xg: [1.9, 0.8], possession: [55, 45], shots: [14, 9], onTarget: [6, 3],
           passes: [500, 420], passAcc: [86, 81], corners: [6, 3], fouls: [11, 12], offsides: [2, 1] },
  motm: { side: 'h', n: 9, rating: 8.4, line: [['Buts', '2'], ['Tirs', '4'], ['Duels', '6/9']] },
  events: [
    { m: 23, t: 'goal', side: 'h', n: 9, a: 10, x: 88, y: 46, how: 'Frappe croisée',
      key: 1, title: 'Titre du moment', text: 'Description du moment.' }
  ]
}
```

- **Types d’actions (`t`)** : `goal`, `chance` (tir cadré arrêté), `post`,
  `yellow`, `red`, `sub` (`in` / `out`), `tactic` (`form: '3-4-3'`), `var`.
  Ajoutez `pen: 1` à un but sur penalty.
- **`key: 1`** fait apparaître l’action dans « Moments clés ».
- **Coordonnées `x`, `y`** : en pourcentage du terrain, du point de vue de
  l’équipe qui tire (elle attaque vers `x = 100` ; `y = 50` est l’axe).
- **Tirs et xG** : les tirs absents de `events` sont générés pour respecter
  `shots` et `onTarget`. Si `stats.xg` est renseigné, les tirs générés sont
  ajustés pour atteindre ce total ; sinon l’xG vient de la position des tirs.
- **`{xgH}` / `{xgA}`** dans `story` ou `analysis` sont remplacés par l’xG
  calculé de chaque équipe.
- Une incohérence entre les buts listés et `score` est signalée dans la console.

Réglez enfin `featured` (match du hero), `spotlight` (les quatre tuiles
« À la une ») et `playersOfWeek` (les cartes joueurs) en haut du fichier.

## Newsletter

Le formulaire valide l’adresse mais ne l’envoie nulle part. Pour le brancher,
remplacez le gestionnaire `submit` de la fonction `newsletter()` dans
`assets/js/ui.js` par un appel à votre outil d’e-mailing.

## Design

Inspiré de la galerie monochrome de Nike.com : interface noire, blanche et
grise, boutons pilules de 30 px, tuiles à angles vifs, aucune ombre. La couleur
ne vient que des visuels de match (affiches génératives et reconstitution du
but), jamais de l’interface.

- Texte : Helvetica Neue / Inter, graisses 400 et 500.
- Titres display : Anton (substitut libre de Futura condensé), 76 px maximum
  pour les titres ; les scores et minutes, traités comme des images, vont au-delà.
- Le Θ du logo est le rond central traversé par la ligne médiane.

## Animations

- Intro (une fois par session), reconstitution 3D du but en temps réel dans
  le hero, caméra qui bascule en vue du dessus au scroll, effet rideau.
- Mots et lignes qui montent, tuiles qui se dévoilent, compteurs, barres,
  courbe xG tracée au scroll, carte des tirs, compositions.
- Moments clés en défilement horizontal épinglé, avec horloge et frise du match.
- Bandeau de résultats dont la vitesse suit le scroll, texte d’analyse qui
  s’allume mot à mot, mot-symbole géant du pied de page.
- Survol : boutons magnétiques à texte roulant, lumière qui suit le pointeur,
  cartes joueurs inclinées en 3D, curseur personnalisé, méga-menu.

`prefers-reduced-motion` est respecté : tout le contenu s’affiche immédiatement,
sans animation ni défilement épinglé.

## Publier sur GitHub Pages

Settings → Pages → Source : « Deploy from a branch », branche voulue, dossier
`/ (root)`. Aucun build n’est nécessaire.
