/* ==========================================================================
   THEORIA — contenu du site
   --------------------------------------------------------------------------
   Données de démonstration : clubs, joueurs et matchs sont fictifs.
   Remplacez-les par vos propres résumés (voir README.md, « Ajouter un match »).

   Coordonnées (x, y) des actions : en pourcentage du terrain, du point de vue
   de l’équipe qui tire (elle attaque toujours vers x = 100, le but adverse).
   x = 100 → ligne de but adverse · y = 0 → côté gauche · y = 50 → axe.

   Les tirs non listés dans `events` sont générés à partir de `stats.shots`
   et `stats.onTarget`. L’xG de chaque tir est calculé à partir de sa position ;
   `stats.xg` (facultatif) fixe le total par équipe, les tirs générés sont
   alors ajustés pour l’atteindre.
   ========================================================================== */

window.THEORIA_DATA = {
  featured: 'aurore-meridien',
  spotlight: ['lumen-solaris', 'basalte-nordique', 'calanque-brume', 'vallon-cobalt'],
  playersOfWeek: ['aurore-meridien', 'basalte-nordique', 'lumen-solaris', 'calanque-brume'],
  competitions: ['Championnat', 'Coupe', 'Coupe d’Europe'],

  /* ---- Clubs --------------------------------------------------------------
     formation : sert aux compositions et à la reconstitution du hero.
     names     : joueurs nommés (n° → nom). Les autres sont générés.
     color     : couleur utilisée uniquement dans les visuels (affiches),
                 jamais dans l’interface. */
  clubs: {
    aurore: {
      name: 'Racing Aurore', short: 'AUR', color: '#E2231A', formation: '4-3-3',
      stadium: 'Parc de l’Aube',
      names: { 1: 'Hugo Delmas', 2: 'Lucas Ndiaye', 3: 'Anis Benali', 4: 'Sacha Lemaire', 5: 'Florian Hamel', 6: 'Gaël Moreau', 7: 'Yanis Okafor', 8: 'Théo Vasseur', 9: 'Ilan Mercier', 10: 'Kenji Arroyo', 11: 'Evan Duval', 14: 'Nabil Ferhat' }
    },
    meridien: {
      name: 'FC Méridien', short: 'MER', color: '#7A5CFF', formation: '4-2-3-1',
      stadium: 'Stade du Méridien',
      names: { 1: 'Joaquim Perrin', 4: 'Marius Olsen', 6: 'Mateo Quintana', 9: 'Bastien Royer', 10: 'Elias Brandt', 18: 'Ulysse Fontaine' }
    },
    basalte: {
      name: 'Olympique Basalte', short: 'OBA', color: '#FF6A13', formation: '4-4-2',
      stadium: 'Stade de la Coulée',
      names: { 1: 'Yoann Petit', 7: 'Pablo Renard', 9: 'Rayan Sarr', 10: 'Loïc Gomis' }
    },
    nordique: {
      name: 'Stade Nordique', short: 'STN', color: '#3FA9F5', formation: '4-3-3',
      stadium: 'Arena Boréale',
      names: { 1: 'Idrissa Kaboré', 2: 'Timothée Rolland', 8: 'Baptiste Rousseau', 9: 'Axel Lambert', 11: 'Jonas Weber' }
    },
    vallon: {
      name: 'AS Vallon', short: 'ASV', color: '#8DC63F', formation: '4-4-2',
      stadium: 'Stade du Vallon',
      names: { 1: 'Quentin Leclerc', 5: 'Omar Traoré', 9: 'Nathan Dumont' }
    },
    cobalt: {
      name: 'Union Cobalt', short: 'UCO', color: '#1E4FD8', formation: '4-3-3',
      stadium: 'Stade Cobalt',
      names: { 1: 'Simon Ivanov', 7: 'Enzo Marchetti', 9: 'Malik Haddad', 10: 'Aurélien Keita' }
    },
    lumen: {
      name: 'Sporting Lumen', short: 'SPL', color: '#F2A900', formation: '4-3-3',
      stadium: 'Stade Lumen',
      names: { 8: 'Mathis Silva', 9: 'Adrien Kessler', 11: 'Wassim Tadjer', 20: 'Noé Garnier' }
    },
    solaris: {
      name: 'Atlético Solaris', short: 'ATS', color: '#E6007E', formation: '4-2-3-1',
      stadium: 'Stade Solaris',
      names: { 1: 'Ruben Baptista', 10: 'Tiago Navarro', 19: 'Lenny Camara' }
    },
    calanque: {
      name: 'Real Calanque', short: 'RCA', color: '#19C3B3', formation: '3-4-3',
      stadium: 'Stade des Calanques',
      names: { 4: 'Romain Etxeberria', 6: 'Victor Sow', 9: 'Dorian Vidal' }
    },
    brume: {
      name: 'Dynamo Brume', short: 'DYB', color: '#B8BCC2', formation: '4-4-2',
      stadium: 'Stade de la Brume',
      names: { 1: 'Oscar Lindgren', 8: 'Soren Janssen', 9: 'Cheikh Fofana' }
    }
  },

  /* ---- Matchs -------------------------------------------------------------
     t (type d’action) : goal · chance (tir cadré arrêté) · post · yellow · red
                         sub · tactic · var
     key: 1            → l’action apparaît dans « Moments clés »
     {xgH} / {xgA}     → remplacés par les xG calculés de chaque équipe       */
  matches: [
    {
      id: 'aurore-meridien',
      competition: 'Championnat', round: 'Journée 8',
      date: '2026-10-04', kickoff: '20:45',
      home: 'aurore', away: 'meridien', score: [3, 2], ht: [0, 2],
      attendance: 41280, referee: 'Clément Aubry',
      poster: 'shots', tone: 'dark',
      title: 'L’Aurore renverse Méridien en 29 minutes',
      hero: ['De 0–2', 'à 3–2'],
      dek: 'Menés de deux buts à la pause, les Rouges passent à trois derrière, étouffent Méridien et signent le renversement de la saison.',
      story: [
        'Pendant 45 minutes, Méridien a joué le match parfait. Bloc médian, sorties de balle propres, et deux coups de massue : Bastien Royer de la tête sur corner (17e), puis Elias Brandt sur penalty après une main de Sacha Lemaire (39e). À la pause, l’Aurore n’avait cadré qu’une frappe.',
        'Le tournant est venu du banc. Nabil Ferhat entre à la place de Gaël Moreau, l’Aurore passe en 3-4-3 et pousse ses pistons à hauteur des attaquants. Méridien, qui ressortait par ses latéraux, se retrouve pris à cinq contre quatre sur sa propre relance.',
        'Ilan Mercier réduit l’écart d’une reprise de volée au point de penalty (52e), Kenji Arroyo égalise sur coup franc direct (66e). Il faut un réflexe de Hugo Delmas face à Royer (74e) pour éviter la rechute, avant que Mercier ne conclue une récupération haute à trente mètres du but (81e).',
        'Sur l’ensemble du match, l’Aurore produit {xgH} xG contre {xgA} pour Méridien. Le score de la mi-temps mentait. Celui de la fin raconte la seconde période.'
      ],
      analysis: 'Le score à la pause disait 0–2. La structure disait autre chose : Méridien ne sortait le ballon que par ses côtés. En fermant l’axe et en doublant chaque latéral, l’Aurore a transformé la meilleure arme adverse en piège. Trois buts plus tard, la théorie est devenue le score.',
      replay: 81,
      stats: { xg: [2.84, 1.68], possession: [61, 39], shots: [19, 8], onTarget: [8, 4], passes: [588, 371], passAcc: [89, 80], corners: [9, 3], fouls: [10, 14], offsides: [2, 3] },
      motm: { side: 'h', n: 9, rating: 8.9, line: [['Buts', '2'], ['Tirs', '5'], ['Récupérations hautes', '4']] },
      events: [
        { m: 17, t: 'goal', side: 'a', n: 9, a: 10, x: 95, y: 44, how: 'Tête sur corner', key: 1, title: 'Royer frappe le premier', text: 'Corner rentrant de Brandt, Royer devance Lemaire au premier poteau. Méridien marque sur sa première occasion franche.' },
        { m: 33, t: 'yellow', side: 'h', n: 4 },
        { m: 39, t: 'goal', pen: 1, side: 'a', n: 10, x: 89.5, y: 50, how: 'Penalty', key: 1, title: 'Brandt double la mise', text: 'Main de Lemaire repérée par la VAR. Brandt prend Delmas à contre-pied : 0–2 à la pause, et une seule frappe cadrée pour l’Aurore.' },
        { m: 46, t: 'sub', side: 'h', in: 14, out: 6 },
        { m: 46, t: 'tactic', side: 'h', form: '3-4-3', key: 1, title: 'L’Aurore passe à trois', text: 'Ferhat remplace Moreau. Benali et Ndiaye montent d’un cran : l’Aurore presse désormais à cinq sur la relance de Méridien.' },
        { m: 52, t: 'goal', side: 'h', n: 9, a: 2, x: 88, y: 53, how: 'Volée', key: 1, title: 'Mercier relance tout', text: 'Centre en retrait de Ndiaye, reprise de volée de Mercier au point de penalty. Sept minutes après la pause, le plan fonctionne déjà.' },
        { m: 58, t: 'yellow', side: 'a', n: 6 },
        { m: 66, t: 'goal', side: 'h', n: 10, x: 75, y: 41, how: 'Coup franc direct', key: 1, title: 'Arroyo, au-dessus du mur', text: 'Coup franc à 27 mètres, légèrement excentré. Arroyo enroule au-dessus du mur, Perrin reste figé.' },
        { m: 70, t: 'sub', side: 'a', in: 18, out: 10 },
        { m: 74, t: 'chance', side: 'a', n: 9, x: 90, y: 57, key: 1, title: 'Delmas ferme la porte', text: 'Royer s’échappe dans le dos de la défense à trois. Delmas sort au bon moment et détourne en corner.' },
        { m: 81, t: 'goal', side: 'h', n: 9, a: 8, x: 84, y: 46, how: 'Frappe croisée', key: 1, title: 'Mercier, le renversement', text: 'Vasseur récupère à trente mètres et décale Mercier, qui croise sa frappe. 3–2 : trois buts en 29 minutes.' },
        { m: 88, t: 'sub', side: 'h', in: 17, out: 7 },
        { m: 93, t: 'yellow', side: 'h', n: 14 }
      ]
    },

    {
      id: 'basalte-nordique',
      competition: 'Championnat', round: 'Journée 8',
      date: '2026-10-03', kickoff: '17:00',
      home: 'basalte', away: 'nordique', score: [1, 1], ht: [1, 0],
      attendance: 28950, referee: 'Inès Marchal',
      poster: 'heat', tone: 'light',
      title: 'Kaboré tient Nordique debout',
      hero: ['Sept arrêts', 'et un point'],
      dek: 'Dominé de bout en bout, Nordique arrache le nul à la 88e minute. Entre-temps, Idrissa Kaboré a tout arrêté.',
      story: [
        'Basalte a eu le ballon, les occasions et le poteau. Il lui a manqué un deuxième but, et la raison porte un nom : Idrissa Kaboré, auteur de sept arrêts dont un double réflexe à la 71e minute.',
        'Nordique a longtemps subi sans solution, enfermé dans son camp par le pressing de Gomis et Sarr. Un centre et une tête de Jonas Weber à la 88e minute ont suffi pour renverser la lecture du match : {xgH} xG contre {xgA}, mais un point chacun.'
      ],
      analysis: 'Avec {xgH} xG, Basalte gagne ce match neuf fois sur dix. Le problème ne venait pas de l’animation : les occasions étaient là, nettes, répétées. Il venait d’un gardien en état de grâce. Samedi, c’était la dixième fois.',
      replay: 23,
      stats: { xg: [2.92, 0.61], possession: [57, 43], shots: [21, 7], onTarget: [8, 2], passes: [530, 402], passAcc: [86, 82], corners: [8, 2], fouls: [12, 9], offsides: [1, 4] },
      motm: { side: 'a', n: 1, rating: 8.6, line: [['Arrêts', '7'], ['Sorties aériennes', '4'], ['Passes réussies', '81 %']] },
      events: [
        { m: 23, t: 'goal', side: 'h', n: 9, a: 10, x: 90, y: 38, how: 'Frappe croisée', key: 1, title: 'Sarr ouvre le score', text: 'Une-deux avec Gomis à l’entrée de la surface, Sarr ouvre son pied. Le ballon rentre au ras du poteau.' },
        { m: 41, t: 'chance', side: 'h', n: 10, x: 91, y: 55, key: 1, title: 'Kaboré, première parade', text: 'Gomis seul à huit mètres. Kaboré reste debout jusqu’au bout et repousse du pied.' },
        { m: 56, t: 'yellow', side: 'a', n: 5 },
        { m: 62, t: 'post', side: 'h', n: 7, x: 82, y: 30, key: 1, title: 'Renard trouve le poteau', text: 'Frappe enroulée de Renard depuis le côté gauche. Le poteau sauve Nordique, Kaboré était battu.' },
        { m: 71, t: 'chance', side: 'h', n: 9, x: 93, y: 47, key: 1, title: 'Le double arrêt', text: 'Sarr de la tête, puis Gomis sur le rebond. Kaboré se relève en une demi-seconde et capte le second ballon.' },
        { m: 74, t: 'sub', side: 'a', in: 19, out: 9 },
        { m: 88, t: 'goal', side: 'a', n: 11, x: 93, y: 58, how: 'Tête plongeante', key: 1, title: 'Weber égalise', text: 'Nordique n’avait presque rien montré. Centre de la droite, tête plongeante de Weber au second poteau.' },
        { m: 90, t: 'yellow', side: 'h', n: 4 }
      ]
    },

    {
      id: 'vallon-cobalt',
      competition: 'Coupe', round: '32e de finale',
      date: '2026-10-07', kickoff: '19:00',
      home: 'vallon', away: 'cobalt', score: [0, 2], ht: [0, 1],
      attendance: 9400, referee: 'Paul Ferrand',
      poster: 'network', tone: 'dark',
      title: 'Cobalt passe sans trembler',
      hero: ['Cobalt,', 'sans trembler'],
      dek: 'Face à un Vallon combatif puis réduit à dix, Union Cobalt valide son billet pour les seizièmes avec méthode.',
      story: [
        'Le Vallon avait préparé ce match comme une finale : bloc bas, duels gagnés, public debout. Il a tenu 34 minutes, jusqu’à ce que Keita trouve Malik Haddad entre les deux centraux.',
        'L’expulsion d’Omar Traoré à l’heure de jeu a fermé le dernier espoir. Marchetti a conclu un contre éclair à la 72e minute. Cobalt n’a pas brillé, mais il n’a jamais douté : {xgA} xG contre {xgH}.'
      ],
      analysis: 'En coupe, la méthode bat l’élan. Cobalt a laissé le ballon au Vallon quand il le fallait et l’a repris au bon moment. Deux tirs bien choisis, deux buts : c’est moins spectaculaire qu’une remontada, et beaucoup plus reproductible.',
      replay: 34,
      stats: { xg: [0.71, 1.86], possession: [48, 52], shots: [9, 14], onTarget: [2, 6], passes: [401, 452], passAcc: [79, 84], corners: [5, 6], fouls: [15, 10], offsides: [3, 1] },
      motm: { side: 'a', n: 9, rating: 8.0, line: [['Buts', '1'], ['Tirs cadrés', '3'], ['Duels gagnés', '6/9']] },
      events: [
        { m: 22, t: 'yellow', side: 'h', n: 5 },
        { m: 34, t: 'goal', side: 'a', n: 9, a: 10, x: 91, y: 49, how: 'Plat du pied', key: 1, title: 'Haddad ouvre la voie', text: 'Keita trouve Haddad entre les deux centraux. Contrôle orienté, plat du pied : Cobalt mène à la pause.' },
        { m: 44, t: 'chance', side: 'h', n: 9, x: 88, y: 44, key: 1, title: 'Dumont manque l’égalisation', text: 'Seule vraie occasion du Vallon en première période. Ivanov s’interpose de la main gauche.' },
        { m: 60, t: 'red', side: 'h', n: 5, key: 1, title: 'Traoré expulsé', text: 'Second carton jaune pour Traoré, en retard sur Marchetti. Le Vallon doit finir à dix.' },
        { m: 72, t: 'goal', side: 'a', n: 7, x: 87, y: 36, how: 'Contre-attaque', key: 1, title: 'Marchetti plie le match', text: 'Contre éclair après un corner du Vallon. Marchetti traverse le terrain et ajuste Leclerc.' },
        { m: 80, t: 'sub', side: 'a', in: 20, out: 9 }
      ]
    },

    {
      id: 'lumen-solaris',
      competition: 'Coupe d’Europe', round: 'Phase de ligue · J2',
      date: '2026-10-06', kickoff: '21:00',
      home: 'lumen', away: 'solaris', score: [4, 1], ht: [2, 1],
      attendance: 52300, referee: 'Anders Holm',
      poster: 'score', tone: 'light',
      title: 'La leçon de pressing de Lumen',
      hero: ['La leçon', 'de Lumen'],
      dek: 'Quatre buts, un Kessler double buteur et un pressing sans temps mort : Lumen a étouffé Solaris dès la première minute.',
      story: [
        'Huit minutes, une récupération haute, un but. Le scénario était posé : Lumen a pressé chaque relance de Solaris, et chaque perte de balle adverse est devenue une occasion.',
        'Navarro a entretenu l’illusion juste avant la pause d’une frappe en pleine lucarne. Kessler a répondu au retour des vestiaires, avant que Garnier, entré à la 70e minute, ne fixe le score. Lumen termine avec {xgH} xG, Solaris avec {xgA}.'
      ],
      analysis: 'Le pressing de Lumen ne visait pas le porteur. Il visait la passe suivante. En coupant les relais intérieurs, il a forcé Solaris à jouer long, puis a gagné les seconds ballons. Quatre buts, dont trois nés d’une récupération dans le dernier tiers.',
      replay: 63,
      stats: { xg: [3.42, 0.94], possession: [55, 45], shots: [22, 10], onTarget: [11, 3], passes: [560, 470], passAcc: [88, 85], corners: [7, 4], fouls: [9, 13], offsides: [2, 2] },
      motm: { side: 'h', n: 9, rating: 8.5, line: [['Buts', '2'], ['Tirs cadrés', '4'], ['Pressions', '27']] },
      events: [
        { m: 8, t: 'goal', side: 'h', n: 11, a: 9, x: 92, y: 63, how: 'Frappe au premier poteau', key: 1, title: 'Tadjer, huit minutes', text: 'Première récupération haute du match, premier but. Tadjer frappe fort au premier poteau.' },
        { m: 27, t: 'goal', side: 'h', n: 9, a: 11, x: 90, y: 51, how: 'Plat du pied', key: 1, title: 'Kessler double la mise', text: 'Tadjer rend la pareille. Centre en retrait, Kessler n’a plus qu’à pousser.' },
        { m: 44, t: 'goal', side: 'a', n: 10, x: 79, y: 45, how: 'Frappe lointaine', key: 1, title: 'Navarro de loin', text: 'Le seul vrai temps faible de Lumen. Navarro déclenche à 23 mètres, en pleine lucarne.' },
        { m: 52, t: 'yellow', side: 'a', n: 6 },
        { m: 63, t: 'goal', side: 'h', n: 9, a: 8, x: 95, y: 47, how: 'Reprise', key: 1, title: 'Kessler, encore', text: 'Centre tendu de Silva, Kessler coupe au premier poteau. Lumen reprend deux buts d’avance.' },
        { m: 70, t: 'sub', side: 'h', in: 20, out: 11 },
        { m: 86, t: 'goal', side: 'h', n: 20, x: 89, y: 56, how: 'Frappe enroulée', key: 1, title: 'Garnier pour finir', text: 'Entré à la 70e minute, Garnier enroule du droit. 4–1.' }
      ]
    },

    {
      id: 'calanque-brume',
      competition: 'Coupe d’Europe', round: 'Phase de ligue · J2',
      date: '2026-10-07', kickoff: '18:45',
      home: 'calanque', away: 'brume', score: [2, 2], ht: [1, 1],
      attendance: 38700, referee: 'Marco Pellegrini',
      poster: 'shots', tone: 'dark',
      title: 'Calanque arrache le nul à dix',
      hero: ['À dix,', 'jusqu’au bout'],
      dek: 'Réduit à dix à la 67e minute, Real Calanque égalise dans le temps additionnel sur une tête de Romain Etxeberria.',
      story: [
        'Un penalty de Dorian Vidal, une réponse immédiate de Brume, puis un renversement signé Cheikh Fofana : à l’heure de jeu, Calanque semblait avoir laissé passer sa soirée.',
        'Le rouge direct de Victor Sow aurait dû l’achever. C’est l’inverse qui s’est produit : à dix, Calanque a tout misé sur les centres et les coups de pied arrêtés. Le dernier corner a été le bon. {xgH} xG pour Calanque, {xgA} pour Brume : un nul qui ressemble au match.'
      ],
      analysis: 'À dix, Calanque a arrêté de construire et commencé à charger la surface : cinq joueurs à la réception de chaque centre. Moins de ballon, plus de présence. Le football de la dernière demi-heure n’avait rien d’élégant. Il était juste.',
      replay: 92,
      stats: { xg: [1.74, 1.69], possession: [44, 56], shots: [12, 15], onTarget: [5, 6], passes: [380, 505], passAcc: [80, 86], corners: [6, 5], fouls: [16, 11], offsides: [2, 3] },
      motm: { side: 'h', n: 4, rating: 7.9, line: [['Buts', '1'], ['Duels aériens', '9/11'], ['Dégagements', '8']] },
      events: [
        { m: 12, t: 'goal', pen: 1, side: 'h', n: 9, x: 89.5, y: 50, how: 'Penalty', key: 1, title: 'Vidal sur penalty', text: 'Fauché dans la surface, Vidal se fait justice lui-même. Frappe sèche, côté gauche.' },
        { m: 30, t: 'goal', side: 'a', n: 8, a: 9, x: 83, y: 38, how: 'Frappe croisée', key: 1, title: 'Janssen égalise', text: 'Fofana dévie de la tête pour Janssen, qui croise du gauche.' },
        { m: 38, t: 'yellow', side: 'h', n: 3 },
        { m: 55, t: 'goal', side: 'a', n: 9, x: 93, y: 52, how: 'Ballon repoussé', key: 1, title: 'Fofana renverse', text: 'Le gardien relâche une frappe lointaine. Fofana est le plus prompt.' },
        { m: 67, t: 'red', side: 'h', n: 6, key: 1, title: 'Rouge direct pour Sow', text: 'Tacle les deux pieds décollés au milieu de terrain. Après revue VAR, le jaune devient rouge.' },
        { m: 92, t: 'goal', side: 'h', n: 4, x: 95, y: 45, how: 'Tête sur corner', key: 1, title: 'Etxeberria, 90+2', text: 'Dernier corner du match. Le défenseur central s’élève plus haut que tout le monde : 2–2.' }
      ]
    },

    {
      id: 'meridien-vallon',
      competition: 'Championnat', round: 'Journée 7',
      date: '2026-09-27', kickoff: '15:00',
      home: 'meridien', away: 'vallon', score: [2, 0], ht: [1, 0],
      attendance: 31100, referee: 'Clément Aubry',
      poster: 'network', tone: 'light',
      title: 'Méridien déroule, Brandt dirige',
      hero: ['Brandt', 'à la baguette'],
      dek: 'Un but de Brandt, un autre de Royer sur un service de Brandt : le numéro 10 de Méridien a dirigé la rencontre de bout en bout.',
      story: [
        'Méridien a eu le ballon 63 % du temps et ne l’a jamais gaspillé. Elias Brandt, repiqué dans l’axe, a ouvert le score dès son premier tir (19e).',
        'Le Vallon a eu une seule vraie occasion, repoussée par Perrin au retour des vestiaires. Royer a conclu une passe en profondeur de Brandt à la 64e minute. {xgH} xG contre {xgA} : un écart à la mesure de la domination.'
      ],
      analysis: 'Brandt ne jouait ni numéro 10 ni ailier. Il occupait l’espace entre le latéral et le central du Vallon, et chaque fois qu’un des deux le suivait, Royer héritait d’un couloir. Un joueur, deux problèmes.',
      replay: 64,
      stats: { xg: [2.21, 0.38], possession: [63, 37], shots: [16, 6], onTarget: [6, 1], passes: [610, 330], passAcc: [90, 77], corners: [6, 1], fouls: [8, 12], offsides: [1, 2] },
      motm: { side: 'h', n: 10, rating: 8.3, line: [['Buts', '1'], ['Passes décisives', '1'], ['Passes clés', '5']] },
      events: [
        { m: 19, t: 'goal', side: 'h', n: 10, x: 80, y: 57, how: 'Frappe enroulée', key: 1, title: 'Brandt enroule', text: 'Repiqué dans l’axe, Brandt enroule du gauche à l’entrée de la surface. Premier tir, premier but.' },
        { m: 48, t: 'chance', side: 'a', n: 9, x: 87, y: 52, key: 1, title: 'Dumont manque le coche', text: 'Seule occasion franche du Vallon. Perrin repousse du bout des gants.' },
        { m: 64, t: 'goal', side: 'h', n: 9, a: 10, x: 95, y: 50, how: 'Plat du pied', key: 1, title: 'Royer conclut', text: 'Passe en profondeur de Brandt, Royer n’a qu’à pousser au fond.' },
        { m: 75, t: 'sub', side: 'h', in: 18, out: 10 }
      ]
    },

    {
      id: 'nordique-calanque',
      competition: 'Championnat', round: 'Journée 7',
      date: '2026-09-26', kickoff: '21:00',
      home: 'nordique', away: 'calanque', score: [3, 0], ht: [2, 0],
      attendance: 35600, referee: 'Inès Marchal',
      poster: 'score', tone: 'dark',
      title: 'Le triplé parfait de Jonas Weber',
      hero: ['Trois buts,', 'un seul nom'],
      dek: 'Gauche, droit, tête : Jonas Weber signe un triplé parfait et Nordique écarte Calanque sans trembler.',
      story: [
        'Jonas Weber a marqué de toutes les façons possibles. Du gauche à la 9e minute, du droit à la 31e, de la tête à la 70e : un triplé parfait, le premier de sa carrière.',
        'Calanque n’a pas démérité dans le jeu, mais Idrissa Kaboré a refusé l’unique occasion nette de Dorian Vidal. {xgH} xG pour Nordique, {xgA} pour Calanque.'
      ],
      analysis: 'Weber partait de l’aile gauche mais finissait chaque action dans l’axe, au moment exact où le piston de Calanque montait. Trois buts nés du même mouvement. Une faille repérée tôt, exploitée trois fois.',
      replay: 70,
      stats: { xg: [2.47, 0.83], possession: [52, 48], shots: [14, 9], onTarget: [7, 2], passes: [470, 455], passAcc: [84, 83], corners: [5, 4], fouls: [11, 10], offsides: [3, 1] },
      motm: { side: 'h', n: 11, rating: 9.1, line: [['Buts', '3'], ['Tirs', '5'], ['Dribbles réussis', '4']] },
      events: [
        { m: 9, t: 'goal', side: 'h', n: 11, a: 9, x: 89, y: 40, how: 'Pied gauche', key: 1, title: 'Weber du gauche', text: 'Lambert décale Weber dans la surface. Frappe du gauche, sous la barre.' },
        { m: 31, t: 'goal', side: 'h', n: 11, a: 8, x: 86, y: 58, how: 'Pied droit', key: 1, title: 'Weber du droit', text: 'Rousseau trouve Weber entre les lignes. Crochet, frappe du droit au premier poteau.' },
        { m: 55, t: 'chance', side: 'a', n: 9, x: 90, y: 46, key: 1, title: 'Kaboré répond présent', text: 'Vidal seul au point de penalty. Kaboré s’interpose, Nordique garde ses deux buts d’avance.' },
        { m: 70, t: 'goal', side: 'h', n: 11, a: 2, x: 94, y: 52, how: 'Tête', key: 1, title: 'Weber de la tête', text: 'Centre de la droite, tête décroisée. Triplé parfait, et ovation de l’Arena Boréale.' }
      ]
    },

    {
      id: 'solaris-cobalt',
      competition: 'Championnat', round: 'Journée 7',
      date: '2026-09-26', kickoff: '17:00',
      home: 'solaris', away: 'cobalt', score: [2, 1], ht: [0, 1],
      attendance: 24800, referee: 'Paul Ferrand',
      poster: 'heat', tone: 'dark',
      title: 'Solaris renverse Cobalt à la 94e minute',
      hero: ['90+4,', 'Camara'],
      dek: 'Menés à la pause, les joueurs de Solaris égalisent par Navarro puis arrachent la victoire dans le temps additionnel.',
      story: [
        'Haddad avait puni Solaris dès la 15e minute, et Cobalt a longtemps contrôlé la suite. Tiago Navarro a remis les deux équipes à égalité d’une frappe sans élan à la 58e minute.',
        'Baptista a sauvé Solaris à la 84e minute en détournant une tête de Haddad sur la barre. Dix minutes plus tard, Navarro lançait Lenny Camara dans le dos de la défense. {xgH} xG contre {xgA} : un match équilibré, tranché par un détail.'
      ],
      analysis: 'Solaris a gagné en changeant de rythme, pas de plan. Après l’entrée de Camara, chaque récupération partait vers la profondeur au lieu d’être sécurisée. Plus de pertes, plus de risques, et la seule occasion qui comptait.',
      replay: 94,
      stats: { xg: [1.38, 1.31], possession: [47, 53], shots: [13, 11], onTarget: [5, 4], passes: [420, 480], passAcc: [82, 85], corners: [5, 5], fouls: [13, 12], offsides: [2, 2] },
      motm: { side: 'h', n: 10, rating: 8.2, line: [['Buts', '1'], ['Passes décisives', '1'], ['Passes clés', '4']] },
      events: [
        { m: 15, t: 'goal', side: 'a', n: 9, a: 7, x: 92, y: 47, how: 'Plat du pied', key: 1, title: 'Haddad, d’entrée', text: 'Centre en retrait de Marchetti, Haddad conclut du plat du pied.' },
        { m: 58, t: 'goal', side: 'h', n: 10, x: 78, y: 50, how: 'Frappe des 20 mètres', key: 1, title: 'Navarro égalise', text: 'Navarro contrôle dans l’axe et frappe sans élan. Le ballon fuit Ivanov.' },
        { m: 68, t: 'sub', side: 'h', in: 19, out: 9 },
        { m: 84, t: 'chance', side: 'a', n: 9, x: 91, y: 53, key: 1, title: 'Baptista sauve Solaris', text: 'Haddad pense doubler la mise de la tête. Baptista détourne sur la barre.' },
        { m: 94, t: 'goal', side: 'h', n: 19, a: 10, x: 90, y: 61, how: 'Frappe croisée', key: 1, title: 'Camara, 90+4', text: 'Navarro lance Camara dans le dos de la défense. Frappe croisée, le stade explose.' }
      ]
    }
  ]
};
