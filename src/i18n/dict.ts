/**
 * Dictionnaires d'interface.
 *
 * Le CONTENU du site reste en anglais (noms d'items, descriptions, pools).
 * Seule la « chrome » est traduite : navigation, libellés, boutons, messages.
 *
 * Deux blocs restent volontairement en anglais : le paragraphe d'accueil et les
 * trois étapes d'explication (texte éditorial), ainsi que la page crédits
 * (texte légal). Voir README.
 */

export const LANGS = ['en', 'fr', 'de', 'es', 'it'] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  it: 'Italiano',
};

const en: Record<string, string> = {
  'common.language': 'Language',

  'nav.items': 'Items',
  'nav.chain': 'Chain',
  'nav.calculator': 'Calculator',
  'nav.credits': 'Credits',

  'footer.disclaimer': 'Unofficial fan project, not affiliated with Edmund McMillen, Nicalis or Valve.',
  'footer.free': 'Free site, no ads, no monetization, no accounts, no tracking.',
  'footer.credits': 'Credits & legal',
  'footer.sprites': 'Sprites © Edmund McMillen / Nicalis.',

  'home.eyebrow': 'unofficial · free · no ads',
  'home.title1': 'The item chain,',
  'home.title2': 'end to end.',
  'home.searchPlaceholder': 'Search an item — in any of 20 languages…',
  'home.searchHint': 'Try “Brim”, “Oignon Triste”, “悲しみオニオン”, “Кубик с вычетом”.',
  'home.browse': 'Browse all {n} items',
  'home.openChain': 'Open the chain',
  'home.itemOfDay': 'item of the day',

  'items.title': 'All items',
  'items.lede': '{n} collectibles, sorted by internal ID. Every card opens the item, and every item shows what it Spindowns into.',
  'items.name': 'Name',
  'items.type': 'Type',
  'items.quality': 'Quality',
  'items.pool': 'Pool',
  'items.sort': 'Sort',
  'items.all': 'all',
  'items.byId': 'ID',
  'items.byName': 'Name',
  'items.byQuality': 'Quality',
  'items.namePlaceholder': 'Filter by English name…',
  'items.count': '{n} items',
  'items.countFiltered': '{shown} / {total} items',
  'items.empty': 'No item matches these filters.',

  'item.breadcrumb': 'Items',
  'item.counter': '{id} / {n} collectibles',
  'item.alsoKnownAs': 'also known as',
  'item.effect': 'Effect',
  'item.spindown': 'Spindown Dice',
  'item.becomes': 'With a Spindown, becomes',
  'item.comesFrom': 'Spindowns into this',
  'item.blocked': 'This item cannot be rerolled by any effect, so the chain ends here.',
  'item.noTarget': 'Nothing below this item: it is the first collectible, so a Spindown would destroy it.',
  'item.noSource': 'Nothing Spindowns into this item.',
  'item.noDescription':
    'No effect text for this item in the community data this site is built from. The chain information below is complete — that part comes straight from the game files.',
  'item.chainContext': 'Chain context',
  'item.seeChain': 'See the whole chain →',
  'item.prevLower': '← lower ID',
  'item.nextHigher': 'higher ID →',
  'item.prevNextAria': 'Previous and next item',
  'item.badgeQuality': 'quality {q}',
  'item.notReachable': 'not reachable by Spindown',
  'item.noReroll': 'cannot be rerolled',
  'item.chainStops': 'The chain stops here — {name} cannot be rerolled.',
  'item.chainTop': 'Top of the chain: nothing can Spindown into {id}.',

  'type.passive': 'passive',
  'type.active': 'active',
  'type.familiar': 'familiar',

  'chain.title': 'The chain',
  'chain.lede':
    '{n} collectibles in internal ID order. Each row is exactly one Spindown use below the one above it — except where the ID jumps, because {skippable} IDs are hidden or empty.',
  'chain.lede2':
    "Dad's Note (#668) is immune to rerolls — you can reach it, but nothing can come out of it.",
  'chain.legendWall': "the wall: Dad's Note (#668), immune to rerolls",
  'chain.legendDead': 'unreachable from above',
  'chain.legendSkip': '{n} hidden or empty IDs are jumped over silently',
  'chain.foot': 'Looking for something specific?',
  'chain.footBrowse': 'Browse all {n} items',
  'chain.footOr': 'or',
  'chain.footCalc': 'compute a distance',

  'graph.jumpAria': 'Jump to an item ID',
  'graph.jumpPlaceholder': 'ID…',
  'graph.go': 'Go',
  'graph.hint': 'scroll to zoom · drag to pan · click a row',
  'graph.wall': "✖ Dad's Note #668 — cannot be rerolled: everything below is unreachable from here",

  'calc.title': 'How many Spindowns?',
  'calc.lede':
    "Pick where you are and where you want to end up. The calculator walks the real chain — hidden IDs are skipped, and Dad's Note stops everything dead.",
  'calc.from': 'From',
  'calc.to': 'To',
  'calc.battery': 'Car Battery (two rerolls per use)',
  'calc.placeholder': 'Choose two items to see the path.',
  'calc.uses': '{n} Spindowns',
  'calc.use': '{n} Spindown',
  'calc.impossible': 'Impossible',
  'calc.reason.up': 'Spindown only goes down. The target has a higher ID than the source.',
  'calc.reason.floor': 'The chain ends before reaching that item.',
  'calc.reason.blocked': "Dad's Note (#668) cannot be rerolled, so nothing below it can be reached.",
  'calc.reason.overshoot': 'With Car Battery two rerolls happen at once, which jumps past the target.',
  'calc.reason.unknown': 'One of these items is not part of the chain.',
  'calc.stopped': 'Stopped at {item}.',
};

const fr: Record<string, string> = {
  'common.language': 'Langue',

  'nav.items': 'Items',
  'nav.chain': 'Chaîne',
  'nav.calculator': 'Calculateur',
  'nav.credits': 'Crédits',

  'footer.disclaimer': 'Projet fan non officiel, non affilié à Edmund McMillen, Nicalis ou Valve.',
  'footer.free': 'Site gratuit, sans publicité, sans monétisation, sans compte, sans pistage.',
  'footer.credits': 'Crédits & mentions légales',
  'footer.sprites': 'Sprites © Edmund McMillen / Nicalis.',

  'home.eyebrow': 'non officiel · gratuit · sans pub',
  'home.title1': 'La chaîne des items,',
  'home.title2': 'de bout en bout.',
  'home.searchPlaceholder': 'Chercher un item — dans 20 langues…',
  'home.searchHint': 'Essayez « Brim », « Oignon Triste », « 悲しみオニオン », « Кубик с вычетом ».',
  'home.browse': 'Parcourir les {n} items',
  'home.openChain': 'Ouvrir la chaîne',
  'home.itemOfDay': 'item du jour',

  'items.title': 'Tous les items',
  'items.lede':
    "{n} collectibles, triés par ID interne. Chaque carte ouvre l'item, et chaque item montre ce qu'il devient.",
  'items.name': 'Nom',
  'items.type': 'Type',
  'items.quality': 'Qualité',
  'items.pool': 'Pool',
  'items.sort': 'Tri',
  'items.all': 'tous',
  'items.byId': 'ID',
  'items.byName': 'Nom',
  'items.byQuality': 'Qualité',
  'items.namePlaceholder': 'Filtrer par nom anglais…',
  'items.count': '{n} items',
  'items.countFiltered': '{shown} / {total} items',
  'items.empty': 'Aucun item ne correspond à ces filtres.',

  'item.breadcrumb': 'Items',
  'item.counter': '{id} / {n} collectibles',
  'item.alsoKnownAs': 'aussi appelé',
  'item.effect': 'Effet',
  'item.spindown': 'Spindown Dice',
  'item.becomes': 'Avec un Spindown, devient',
  'item.comesFrom': 'Se transforme en cet item',
  'item.blocked': "Cet item ne peut être reroll par aucun effet : la chaîne s'arrête ici.",
  'item.noTarget': "Rien en dessous : c'est le premier collectible, un Spindown le détruirait.",
  'item.noSource': 'Aucun item ne se transforme en celui-ci.',
  'item.noDescription':
    "Pas de texte d'effet pour cet item dans les données communautaires utilisées ici. Les informations de chaîne ci-dessous sont complètes : elles viennent directement des fichiers du jeu.",
  'item.chainContext': 'Contexte dans la chaîne',
  'item.seeChain': 'Voir la chaîne entière →',
  'item.prevLower': '← ID inférieur',
  'item.nextHigher': 'ID supérieur →',
  'item.prevNextAria': 'Item précédent et suivant',
  'item.badgeQuality': 'qualité {q}',
  'item.notReachable': 'inatteignable par Spindown',
  'item.noReroll': 'non rerollable',
  'item.chainStops': "La chaîne s'arrête ici — {name} ne peut pas être reroll.",
  'item.chainTop': 'Sommet de la chaîne : rien ne peut se transformer en {id}.',

  'type.passive': 'passif',
  'type.active': 'actif',
  'type.familiar': 'familier',

  'chain.title': 'La chaîne',
  'chain.lede':
    "{n} collectibles en ordre d'ID interne. Chaque ligne est exactement une utilisation de Spindown sous celle du dessus — sauf quand l'ID saute, parce que {skippable} IDs sont cachés ou vides.",
  'chain.lede2':
    "Dad's Note (#668) est immunisé au reroll : on peut l'atteindre, mais rien ne peut en sortir.",
  'chain.legendWall': "le mur : Dad's Note (#668), immunisé au reroll",
  'chain.legendDead': 'inatteignable depuis le haut',
  'chain.legendSkip': '{n} IDs cachés ou vides sont sautés en silence',
  'chain.foot': 'Vous cherchez quelque chose ?',
  'chain.footBrowse': 'Parcourir les {n} items',
  'chain.footOr': 'ou',
  'chain.footCalc': 'calculer une distance',

  'graph.jumpAria': "Aller à l'ID d'un item",
  'graph.jumpPlaceholder': 'ID…',
  'graph.go': 'Aller',
  'graph.hint': 'molette pour zoomer · glisser pour déplacer · clic pour ouvrir',
  'graph.wall': "✖ Dad's Note #668 — non rerollable : tout ce qui est en dessous est inatteignable",

  'calc.title': 'Combien de Spindowns ?',
  'calc.lede':
    "Choisissez d'où vous partez et où vous voulez arriver. Le calculateur suit la vraie chaîne — les IDs cachés sont sautés, et Dad's Note arrête tout.",
  'calc.from': 'De',
  'calc.to': 'Vers',
  'calc.battery': 'Car Battery (deux rerolls par utilisation)',
  'calc.placeholder': 'Choisissez deux items pour voir le chemin.',
  'calc.uses': '{n} Spindowns',
  'calc.use': '{n} Spindown',
  'calc.impossible': 'Impossible',
  'calc.reason.up': 'Le Spindown ne fait que descendre. La cible a un ID supérieur à la source.',
  'calc.reason.floor': "La chaîne s'arrête avant d'atteindre cet item.",
  'calc.reason.blocked': "Dad's Note (#668) ne peut pas être reroll : rien en dessous n'est atteignable.",
  'calc.reason.overshoot':
    'Avec Car Battery, deux rerolls ont lieu d\'un coup, ce qui dépasse la cible.',
  'calc.reason.unknown': 'Un de ces items ne fait pas partie de la chaîne.',
  'calc.stopped': 'Arrêt sur {item}.',
};

const de: Record<string, string> = {
  'common.language': 'Sprache',

  'nav.items': 'Items',
  'nav.chain': 'Kette',
  'nav.calculator': 'Rechner',
  'nav.credits': 'Credits',

  'footer.disclaimer': 'Inoffizielles Fanprojekt, nicht mit Edmund McMillen, Nicalis oder Valve verbunden.',
  'footer.free': 'Kostenlose Seite, keine Werbung, keine Monetarisierung, keine Konten, kein Tracking.',
  'footer.credits': 'Credits & Rechtliches',
  'footer.sprites': 'Sprites © Edmund McMillen / Nicalis.',

  'home.eyebrow': 'inoffiziell · kostenlos · werbefrei',
  'home.title1': 'Die Item-Kette,',
  'home.title2': 'von Anfang bis Ende.',
  'home.searchPlaceholder': 'Item suchen — in 20 Sprachen…',
  'home.searchHint': 'Zum Beispiel „Brim“, „Oignon Triste“, „悲しみオニオン“, „Кубик с вычетом“.',
  'home.browse': 'Alle {n} Items ansehen',
  'home.openChain': 'Die Kette öffnen',
  'home.itemOfDay': 'Item des Tages',

  'items.title': 'Alle Items',
  'items.lede':
    'Alle {n} Collectibles, sortiert nach interner ID. Jede Karte öffnet das Item, und jedes Item zeigt, was daraus wird.',
  'items.name': 'Name',
  'items.type': 'Typ',
  'items.quality': 'Qualität',
  'items.pool': 'Pool',
  'items.sort': 'Sortierung',
  'items.all': 'alle',
  'items.byId': 'ID',
  'items.byName': 'Name',
  'items.byQuality': 'Qualität',
  'items.namePlaceholder': 'Nach englischem Namen filtern…',
  'items.count': '{n} Items',
  'items.countFiltered': '{shown} / {total} Items',
  'items.empty': 'Kein Item passt zu diesen Filtern.',

  'item.breadcrumb': 'Items',
  'item.counter': '{id} / {n} Collectibles',
  'item.alsoKnownAs': 'auch bekannt als',
  'item.effect': 'Effekt',
  'item.spindown': 'Spindown Dice',
  'item.becomes': 'Mit einem Spindown wird daraus',
  'item.comesFrom': 'Wird mit einem Spindown zu diesem Item',
  'item.blocked': 'Dieses Item kann durch keinen Effekt gererollt werden — die Kette endet hier.',
  'item.noTarget': 'Nichts darunter: es ist das erste Collectible, ein Spindown würde es zerstören.',
  'item.noSource': 'Kein Item wird zu diesem.',
  'item.noDescription':
    'Für dieses Item gibt es keinen Effekttext in den verwendeten Community-Daten. Die Ketten-Informationen unten sind vollständig — sie stammen direkt aus den Spieldateien.',
  'item.chainContext': 'Zusammenhang in der Kette',
  'item.seeChain': 'Die ganze Kette ansehen →',
  'item.prevLower': '← niedrigere ID',
  'item.nextHigher': 'höhere ID →',
  'item.prevNextAria': 'Vorheriges und nächstes Item',
  'item.badgeQuality': 'Qualität {q}',
  'item.notReachable': 'per Spindown unerreichbar',
  'item.noReroll': 'nicht rerollbar',
  'item.chainStops': 'Die Kette endet hier — {name} kann nicht gererollt werden.',
  'item.chainTop': 'Spitze der Kette: nichts kann zu {id} werden.',

  'type.passive': 'passiv',
  'type.active': 'aktiv',
  'type.familiar': 'Familiar',

  'chain.title': 'Die Kette',
  'chain.lede':
    '{n} Collectibles in interner ID-Reihenfolge. Jede Zeile ist genau ein Spindown unter der darüber — außer wo die ID springt, weil {skippable} IDs versteckt oder leer sind.',
  'chain.lede2':
    "Dad's Note (#668) ist immun gegen Rerolls — man kann es erreichen, aber nichts kann daraus entstehen.",
  'chain.legendWall': "die Wand: Dad's Note (#668), immun gegen Rerolls",
  'chain.legendDead': 'von oben unerreichbar',
  'chain.legendSkip': '{n} versteckte oder leere IDs werden still übersprungen',
  'chain.foot': 'Suchen Sie etwas Bestimmtes?',
  'chain.footBrowse': 'Alle {n} Items ansehen',
  'chain.footOr': 'oder',
  'chain.footCalc': 'eine Distanz berechnen',

  'graph.jumpAria': 'Zu einer Item-ID springen',
  'graph.jumpPlaceholder': 'ID…',
  'graph.go': 'Los',
  'graph.hint': 'scrollen zum Zoomen · ziehen zum Verschieben · klicken zum Öffnen',
  'graph.wall': "✖ Dad's Note #668 — nicht rerollbar: alles darunter ist unerreichbar",

  'calc.title': 'Wie viele Spindowns?',
  'calc.lede':
    'Wählen Sie, wo Sie sind und wo Sie hinwollen. Der Rechner folgt der echten Kette — versteckte IDs werden übersprungen, und Dad\'s Note stoppt alles.',
  'calc.from': 'Von',
  'calc.to': 'Nach',
  'calc.battery': 'Car Battery (zwei Rerolls pro Nutzung)',
  'calc.placeholder': 'Wählen Sie zwei Items, um den Weg zu sehen.',
  'calc.uses': '{n} Spindowns',
  'calc.use': '{n} Spindown',
  'calc.impossible': 'Unmöglich',
  'calc.reason.up': 'Spindown geht nur nach unten. Das Ziel hat eine höhere ID als die Quelle.',
  'calc.reason.floor': 'Die Kette endet, bevor dieses Item erreicht ist.',
  'calc.reason.blocked': "Dad's Note (#668) kann nicht gererollt werden — nichts darunter ist erreichbar.",
  'calc.reason.overshoot':
    'Mit Car Battery passieren zwei Rerolls auf einmal, was über das Ziel hinausschießt.',
  'calc.reason.unknown': 'Eines dieser Items gehört nicht zur Kette.',
  'calc.stopped': 'Gestoppt bei {item}.',
};

const es: Record<string, string> = {
  'common.language': 'Idioma',

  'nav.items': 'Objetos',
  'nav.chain': 'Cadena',
  'nav.calculator': 'Calculadora',
  'nav.credits': 'Créditos',

  'footer.disclaimer': 'Proyecto fan no oficial, no afiliado a Edmund McMillen, Nicalis ni Valve.',
  'footer.free': 'Sitio gratuito, sin anuncios, sin monetización, sin cuentas, sin rastreo.',
  'footer.credits': 'Créditos y avisos legales',
  'footer.sprites': 'Sprites © Edmund McMillen / Nicalis.',

  'home.eyebrow': 'no oficial · gratis · sin anuncios',
  'home.title1': 'La cadena de objetos,',
  'home.title2': 'de principio a fin.',
  'home.searchPlaceholder': 'Busca un objeto — en 20 idiomas…',
  'home.searchHint': 'Prueba «Brim», «Oignon Triste», «悲しみオニオン», «Кубик с вычетом».',
  'home.browse': 'Ver los {n} objetos',
  'home.openChain': 'Abrir la cadena',
  'home.itemOfDay': 'objeto del día',

  'items.title': 'Todos los objetos',
  'items.lede':
    '{n} coleccionables, ordenados por ID interno. Cada tarjeta abre el objeto, y cada objeto muestra en qué se convierte.',
  'items.name': 'Nombre',
  'items.type': 'Tipo',
  'items.quality': 'Calidad',
  'items.pool': 'Pool',
  'items.sort': 'Orden',
  'items.all': 'todos',
  'items.byId': 'ID',
  'items.byName': 'Nombre',
  'items.byQuality': 'Calidad',
  'items.namePlaceholder': 'Filtrar por nombre en inglés…',
  'items.count': '{n} objetos',
  'items.countFiltered': '{shown} / {total} objetos',
  'items.empty': 'Ningún objeto coincide con estos filtros.',

  'item.breadcrumb': 'Objetos',
  'item.counter': '{id} / {n} coleccionables',
  'item.alsoKnownAs': 'también conocido como',
  'item.effect': 'Efecto',
  'item.spindown': 'Spindown Dice',
  'item.becomes': 'Con un Spindown, se convierte en',
  'item.comesFrom': 'Se convierte en este objeto',
  'item.blocked': 'Este objeto no puede ser rerolado por ningún efecto: la cadena termina aquí.',
  'item.noTarget': 'Nada por debajo: es el primer coleccionable, un Spindown lo destruiría.',
  'item.noSource': 'Ningún objeto se convierte en este.',
  'item.noDescription':
    'No hay texto de efecto para este objeto en los datos comunitarios que usa este sitio. La información de la cadena de abajo está completa: viene directamente de los archivos del juego.',
  'item.chainContext': 'Contexto en la cadena',
  'item.seeChain': 'Ver la cadena entera →',
  'item.prevLower': '← ID inferior',
  'item.nextHigher': 'ID superior →',
  'item.prevNextAria': 'Objeto anterior y siguiente',
  'item.badgeQuality': 'calidad {q}',
  'item.notReachable': 'inalcanzable por Spindown',
  'item.noReroll': 'no se puede rerolar',
  'item.chainStops': 'La cadena termina aquí — {name} no se puede rerolar.',
  'item.chainTop': 'Cima de la cadena: nada puede convertirse en {id}.',

  'type.passive': 'pasivo',
  'type.active': 'activo',
  'type.familiar': 'familiar',

  'chain.title': 'La cadena',
  'chain.lede':
    '{n} coleccionables en orden de ID interno. Cada fila es exactamente un uso de Spindown por debajo de la anterior — salvo cuando el ID salta, porque {skippable} IDs están ocultos o vacíos.',
  'chain.lede2':
    "Dad's Note (#668) es inmune a los rerolls: se puede alcanzar, pero nada puede salir de él.",
  'chain.legendWall': "el muro: Dad's Note (#668), inmune a los rerolls",
  'chain.legendDead': 'inalcanzable desde arriba',
  'chain.legendSkip': '{n} IDs ocultos o vacíos se saltan en silencio',
  'chain.foot': '¿Buscas algo concreto?',
  'chain.footBrowse': 'Ver los {n} objetos',
  'chain.footOr': 'o',
  'chain.footCalc': 'calcular una distancia',

  'graph.jumpAria': 'Ir a un ID de objeto',
  'graph.jumpPlaceholder': 'ID…',
  'graph.go': 'Ir',
  'graph.hint': 'rueda para zoom · arrastra para mover · clic para abrir',
  'graph.wall': "✖ Dad's Note #668 — no se puede rerolar: todo lo de abajo es inalcanzable",

  'calc.title': '¿Cuántos Spindowns?',
  'calc.lede':
    "Elige dónde estás y a dónde quieres llegar. La calculadora recorre la cadena real — los IDs ocultos se saltan, y Dad's Note lo detiene todo.",
  'calc.from': 'Desde',
  'calc.to': 'Hasta',
  'calc.battery': 'Car Battery (dos rerolls por uso)',
  'calc.placeholder': 'Elige dos objetos para ver el camino.',
  'calc.uses': '{n} Spindowns',
  'calc.use': '{n} Spindown',
  'calc.impossible': 'Imposible',
  'calc.reason.up': 'El Spindown solo baja. El destino tiene un ID mayor que el origen.',
  'calc.reason.floor': 'La cadena termina antes de llegar a ese objeto.',
  'calc.reason.blocked': "Dad's Note (#668) no se puede rerolar: nada por debajo es alcanzable.",
  'calc.reason.overshoot': 'Con Car Battery ocurren dos rerolls a la vez, lo que se pasa del objetivo.',
  'calc.reason.unknown': 'Uno de estos objetos no forma parte de la cadena.',
  'calc.stopped': 'Detenido en {item}.',
};

const it: Record<string, string> = {
  'common.language': 'Lingua',

  'nav.items': 'Oggetti',
  'nav.chain': 'Catena',
  'nav.calculator': 'Calcolatore',
  'nav.credits': 'Crediti',

  'footer.disclaimer': 'Progetto fan non ufficiale, non affiliato a Edmund McMillen, Nicalis o Valve.',
  'footer.free': 'Sito gratuito, senza pubblicità, senza monetizzazione, senza account, senza tracciamento.',
  'footer.credits': 'Crediti e note legali',
  'footer.sprites': 'Sprite © Edmund McMillen / Nicalis.',

  'home.eyebrow': 'non ufficiale · gratuito · senza pubblicità',
  'home.title1': 'La catena degli oggetti,',
  'home.title2': "da un capo all'altro.",
  'home.searchPlaceholder': 'Cerca un oggetto — in 20 lingue…',
  'home.searchHint': 'Prova «Brim», «Oignon Triste», «悲しみオニオン», «Кубик с вычетом».',
  'home.browse': 'Sfoglia i {n} oggetti',
  'home.openChain': 'Apri la catena',
  'home.itemOfDay': 'oggetto del giorno',

  'items.title': 'Tutti gli oggetti',
  'items.lede':
    "{n} collezionabili, ordinati per ID interno. Ogni scheda apre l'oggetto, e ogni oggetto mostra in cosa si trasforma.",
  'items.name': 'Nome',
  'items.type': 'Tipo',
  'items.quality': 'Qualità',
  'items.pool': 'Pool',
  'items.sort': 'Ordina',
  'items.all': 'tutti',
  'items.byId': 'ID',
  'items.byName': 'Nome',
  'items.byQuality': 'Qualità',
  'items.namePlaceholder': 'Filtra per nome inglese…',
  'items.count': '{n} oggetti',
  'items.countFiltered': '{shown} / {total} oggetti',
  'items.empty': 'Nessun oggetto corrisponde a questi filtri.',

  'item.breadcrumb': 'Oggetti',
  'item.counter': '{id} / {n} collezionabili',
  'item.alsoKnownAs': 'noto anche come',
  'item.effect': 'Effetto',
  'item.spindown': 'Spindown Dice',
  'item.becomes': 'Con uno Spindown diventa',
  'item.comesFrom': 'Diventa questo oggetto con uno Spindown',
  'item.blocked': 'Questo oggetto non può essere rerollato da nessun effetto: la catena finisce qui.',
  'item.noTarget': 'Niente sotto: è il primo collezionabile, uno Spindown lo distruggerebbe.',
  'item.noSource': 'Nessun oggetto diventa questo.',
  'item.noDescription':
    "Nessun testo dell'effetto per questo oggetto nei dati della community usati dal sito. Le informazioni sulla catena qui sotto sono complete: vengono direttamente dai file di gioco.",
  'item.chainContext': 'Contesto nella catena',
  'item.seeChain': "Vedi l'intera catena →",
  'item.prevLower': '← ID inferiore',
  'item.nextHigher': 'ID superiore →',
  'item.prevNextAria': 'Oggetto precedente e successivo',
  'item.badgeQuality': 'qualità {q}',
  'item.notReachable': 'irraggiungibile con lo Spindown',
  'item.noReroll': 'non rerollabile',
  'item.chainStops': 'La catena si ferma qui — {name} non può essere rerollato.',
  'item.chainTop': 'Cima della catena: niente può diventare {id}.',

  'type.passive': 'passivo',
  'type.active': 'attivo',
  'type.familiar': 'familiare',

  'chain.title': 'La catena',
  'chain.lede':
    "{n} collezionabili in ordine di ID interno. Ogni riga è esattamente un uso di Spindown sotto quella sopra — tranne dove l'ID salta, perché {skippable} ID sono nascosti o vuoti.",
  'chain.lede2':
    "Dad's Note (#668) è immune ai reroll: si può raggiungere, ma non se ne può uscire.",
  'chain.legendWall': "il muro: Dad's Note (#668), immune ai reroll",
  'chain.legendDead': "irraggiungibile dall'alto",
  'chain.legendSkip': '{n} ID nascosti o vuoti vengono saltati in silenzio',
  'chain.foot': 'Cerchi qualcosa in particolare?',
  'chain.footBrowse': 'Sfoglia i {n} oggetti',
  'chain.footOr': 'o',
  'chain.footCalc': 'calcola una distanza',

  'graph.jumpAria': 'Vai a un ID oggetto',
  'graph.jumpPlaceholder': 'ID…',
  'graph.go': 'Vai',
  'graph.hint': 'rotella per lo zoom · trascina per spostare · clic per aprire',
  'graph.wall': "✖ Dad's Note #668 — non rerollabile: tutto ciò che sta sotto è irraggiungibile",

  'calc.title': 'Quanti Spindown?',
  'calc.lede':
    'Scegli da dove parti e dove vuoi arrivare. Il calcolatore segue la catena reale — gli ID nascosti vengono saltati e Dad\'s Note ferma tutto.',
  'calc.from': 'Da',
  'calc.to': 'A',
  'calc.battery': 'Car Battery (due reroll per uso)',
  'calc.placeholder': 'Scegli due oggetti per vedere il percorso.',
  'calc.uses': '{n} Spindown',
  'calc.use': '{n} Spindown',
  'calc.impossible': 'Impossibile',
  'calc.reason.up':
    'Lo Spindown va solo verso il basso. La destinazione ha un ID più alto della partenza.',
  'calc.reason.floor': 'La catena finisce prima di raggiungere quell\'oggetto.',
  'calc.reason.blocked': "Dad's Note (#668) non può essere rerollato: nulla sotto è raggiungibile.",
  'calc.reason.overshoot':
    'Con Car Battery avvengono due reroll insieme, che superano la destinazione.',
  'calc.reason.unknown': 'Uno di questi oggetti non fa parte della catena.',
  'calc.stopped': 'Fermo su {item}.',
};

export const dicts: Record<Lang, Record<string, string>> = { en, fr, de, es, it };

/**
 * Textes longs de la page d’accueil et libellés complémentaires.
 * Séparés pour garder les dictionnaires principaux lisibles.
 * Les entrées contenant du balisage sont injectées via innerHTML.
 */
const extra: Record<Lang, Record<string, string>> = {
  en: {
    'common.skip': 'Skip to content',
    'home.lede':
    "Every collectible in <em>Repentance+</em>, and what each one becomes with a Spindown Dice.",
  },
  fr: {
    'common.skip': 'Aller au contenu',
    'home.lede':
    "Tous les collectibles de <em>Repentance+</em>, et ce que chacun devient avec un Spindown Dice.",
  },
  de: {
    'common.skip': 'Zum Inhalt springen',
    'home.lede':
    "Alle Collectibles aus <em>Repentance+</em> — und was aus jedem mit einem Spindown Dice wird.",
  },
  es: {
    'common.skip': 'Saltar al contenido',
    'home.lede':
    "Todos los coleccionables de <em>Repentance+</em>, y en qué se convierte cada uno con un Spindown Dice.",
  },
  it: {
    'common.skip': 'Vai al contenuto',
    'home.lede':
    "Tutti i collezionabili di <em>Repentance+</em>, e in cosa si trasforma ognuno con uno Spindown Dice.",
  },
};

for (const lang of LANGS) {
  Object.assign(dicts[lang], extra[lang]);
}

// Clés ajoutées après coup (petites chaînes transverses).
Object.assign(dicts.en, { 'item.counterTail': '/ {n} collectibles', 'calc.batteryShort': 'Car Battery' });
Object.assign(dicts.fr, { 'item.counterTail': '/ {n} collectibles', 'calc.batteryShort': 'Car Battery' });
Object.assign(dicts.de, { 'item.counterTail': '/ {n} Collectibles', 'calc.batteryShort': 'Car Battery' });
Object.assign(dicts.es, { 'item.counterTail': '/ {n} coleccionables', 'calc.batteryShort': 'Car Battery' });
Object.assign(dicts.it, { 'item.counterTail': '/ {n} collezionabili', 'calc.batteryShort': 'Car Battery' });

Object.assign(dicts.en, { 'calc.search': 'Search an item…' });
Object.assign(dicts.fr, { 'calc.search': 'Chercher un item…' });
Object.assign(dicts.de, { 'calc.search': 'Item suchen…' });
Object.assign(dicts.es, { 'calc.search': 'Buscar un objeto…' });
Object.assign(dicts.it, { 'calc.search': 'Cerca un oggetto…' });

Object.assign(dicts.en, {
  'item.chainDir': 'Spindown flows down: each item becomes the one below it.',
});
Object.assign(dicts.fr, {
  'item.chainDir': 'Le Spindown va vers le bas : chaque item devient celui du dessous.',
});
Object.assign(dicts.de, {
  'item.chainDir': 'Spindown läuft nach unten: aus jedem Item wird das darunter.',
});
Object.assign(dicts.es, {
  'item.chainDir': 'El Spindown va hacia abajo: cada objeto se convierte en el de abajo.',
});
Object.assign(dicts.it, {
  'item.chainDir': 'Lo Spindown scorre verso il basso: ogni oggetto diventa quello sotto.',
});
