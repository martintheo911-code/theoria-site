# FOOD — micro-ferme organique à Guînes

Site vitrine de FOOD : ferme organique en traction asine, fruits et légumes
de saison, producteur labellisé Nature & Progrès.
Site statique (HTML, CSS, JavaScript sans dépendance ni étape de build).

## Lancer en local

```bash
cd food
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Structure

```
food/
  index.html            contenu de la page (textes, saisons, adresse)
  assets/css/food.css   styles, jetons de design, animations
  assets/js/art.js      logo vectorisé, illustrations (légumes, âne, charrue)
  assets/js/food.js     moteur d’animation (scroll, survol, curseur, saisons…)
  assets/img/           logo, favicon, photos
  assets/video/         vidéo facultative du hero (à créer)
```

## Ajouter vos photos

Chaque emplacement photo affiche une illustration tant que le fichier
n’existe pas. Déposez la photo sous le bon nom et elle remplace
l’illustration automatiquement, sans toucher au code.

| Fichier | Emplacement | Illustration en attendant |
|---|---|---|
| `assets/img/ane-et-paysan.jpg` | Hero, piste « Traction asine », pastille « nos ânes » | déjà fournie |
| `assets/img/benji.jpg` | Carte de Benji | âne |
| `assets/img/teoula.jpg` | Carte de Téoula | âne |
| `assets/img/philomene.jpg` | Carte de Philomène | branche |
| `assets/img/manifeste-biodiversite.jpg` | Pastille après « biodiversité » | fleur |
| `assets/img/manifeste-legumes.jpg` | Pastille après « fruits et légumes de saison » | carotte |
| `assets/img/recolte-1.jpg` à `recolte-6.jpg` | Mosaïque « Les récoltes » | carotte, chou, tomate, poireau, betterave, fraise |

Conseils : JPG, 1600 px maximum sur le grand côté. Pensez à adapter dans
`index.html` la légende (`<figcaption>`) et le texte alternatif (`alt`) de
chaque photo de récolte.

## Ajouter la vidéo

Déposez une vidéo courte et légère (MP4, H.264, sans son, 10 à 20 s) sous
`assets/video/ferme.mp4`. Elle remplace la photo de la carte du hero et tourne
en boucle, muette. Sans fichier, la photo reste affichée.

## Modifier le contenu

- **Saisons** : les listes de légumes et de fruits sont dans `index.html`
  (section `#saisons`). La saison en cours s’ouvre automatiquement.
- **Adresse et Instagram** : section `#venir` et pied de page.
- **Bandeau défilant** : liste `marquee__group` en haut de `index.html`.

## Design

Inspiré de la référence « Arva » : fond crème `#f1efdf`, vert forêt `#07503f`
pour les bandes structurantes, tuiles pastel (ciel, pêche, sauge, cendre),
citron vert `#e8fe85` réservé au bandeau et aux petits accents, boutons
pilules de 100 px de rayon, aucune ombre sur les cartes.

- Titres : Fraunces (substitut libre de Reckless), graisse 300.
- Texte : Inter.
- Logo : dessin F.O.O.D vectorisé depuis le logo de la ferme. Les rayons sont
  des tracés séparés, animés un par un.

## Animations

- Intro une fois par session : les rayons du logo se lèvent, puis les lettres.
- Hero : titre lettre par lettre, légumes flottants qui suivent la souris,
  champs vus d’avion qui défilent, carte photo qui se dévoile et s’incline,
  cadre qui s’arrondit au scroll.
- Bandeau citron dont la vitesse et le sens suivent le scroll.
- Manifeste qui s’allume mot à mot, avec pastilles d’images.
- « Traction asine » : défilement horizontal épinglé ; l’âne marche avec la
  charrue et des pousses sortent derrière lui.
- Titres qui montent mot à mot, tuiles qui s’inclinent en 3D au survol,
  icônes qui se dessinent, compteurs, bandeau géant lié au scroll.
- Saisons : pastille d’onglet qui glisse, fond qui change de couleur,
  légume qui rebondit, étiquettes qui arrivent en cascade.
- Mosaïque de récoltes en parallaxe, badge Nature & Progrès qui tourne avec
  le scroll, logo géant qui se lève dans le pied de page.
- Survol : boutons magnétiques à texte roulant et remplissage circulaire,
  curseur personnalisé avec étiquettes, oreilles et queue de l’âne qui bougent.

`prefers-reduced-motion` est respecté : tout s’affiche immédiatement, sans
intro ni défilement épinglé.

## Publier sur GitHub Pages

Settings → Pages → Source : « Deploy from a branch », dossier `/ (root)`.
Le site est alors servi à l’adresse `…/food/`.
