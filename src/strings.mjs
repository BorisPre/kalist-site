// Interface copy, French and English. Page content lives in content/.
export const STRINGS = {
  fr: {
    locale: 'fr_FR', skip: 'Aller au contenu', menu: 'Menu', home: 'Accueil',
    nav: { guides: 'Guides', exercises: 'Exercices', blog: 'Blog', app: 'L’application' },
    switchTo: 'English', switchLabel: 'Read this page in English',
    paths: { guides: '/guides/', exercises: '/exercices/', blog: '/blog/' },
    tagline: 'Application de calisthenics : programmes au poids du corps, parcours de figures et coach caméra sur l’appareil.',
    store: {
      soon: 'Bientôt sur Google Play et l’App Store',
      notify: 'Être prévenu du lancement',
      notifySubject: 'Prévenez-moi du lancement de KALIST',
      googlePlay: 'Télécharger sur Google Play', appStore: 'Télécharger sur l’App Store'
    },
    hero: {
      eyebrow: 'Application de calisthenics',
      title: 'L’app de calisthenics qui vous mène de la première pompe au front lever',
      lead: 'Programmes au poids du corps, 94 mouvements animés et un coach caméra qui compte vos répétitions directement sur votre téléphone.',
      secondary: 'Voir les guides de progression',
      alt: 'Athlète en L-sit sur des barres parallèles dans une salle d’entraînement'
    },
    stats: [['94', 'mouvements animés'], ['24', 'programmes'], ['7', 'parcours de figures'], ['5', 'langues']],
    features: {
      eyebrow: 'Ce que fait KALIST', title: 'Tout pour progresser au poids du corps',
      items: [
        ['Le Parcours', 'Six mondes, de Beginner à Expert. Chaque étape fixe un objectif clair : répétitions, série, maintien ou maîtrise. Réussissez-la pour débloquer la suivante.'],
        ['94 mouvements animés', 'Chaque variante a son animation anatomique, ses muscles, ses repères techniques et ses erreurs à éviter. Du gainage au front lever.'],
        ['24 programmes', 'Huit programmes par niveau, en cycles de six semaines : échauffement, séries, fourchettes de répétitions et repos. La cible monte quand vous êtes prêt.'],
        ['Un coach caméra privé', 'Posez le téléphone : le coach suit vos articulations, compte les répétitions complètes et mesure vos maintiens. Aucune image ne quitte l’appareil.']
      ]
    },
    shots: {
      eyebrow: 'Dans l’application', title: 'Pensée pour le téléphone, au parc comme à la maison',
      items: [['parcours', 'Le Parcours, de Beginner à Expert'], ['mouvement', 'Une fiche par mouvement, avec son animation'], ['coach', 'Le coach caméra, sur l’appareil']]
    },
    guidesBlock: { eyebrow: 'Guides de progression', title: 'Apprenez les figures de la calisthenics', lead: 'Sept parcours complets, avec chaque étape animée, l’objectif à atteindre et le moment de passer à la suivante.', all: 'Tous les guides' },
    libraryBlock: { eyebrow: 'Bibliothèque', title: '94 exercices au poids du corps, du débutant à l’avancé', lead: 'Pompes, tractions, dips, gainage, jambes, anneaux et figures statiques : chaque mouvement est animé, avec ses muscles et ses repères.', cta: 'Voir tous les exercices' },
    blogBlock: { eyebrow: 'Blog', title: 'Conseils pour bien démarrer', all: 'Tous les articles' },
    privacy: { eyebrow: 'Vie privée', title: 'Votre entraînement reste sur votre téléphone', lead: 'Pas de compte à créer, pas de publicité, pas de pistage. L’analyse vidéo se fait sur l’appareil, vos séances et vos vidéos y restent. Vous exportez une sauvegarde quand vous le souhaitez.' },
    faqTitle: 'Questions fréquentes',
    faq: [
      ['Qu’est-ce que la calisthenics ?', 'La calisthenics (ou callisthénie) est l’entraînement au poids du corps : pompes, tractions, dips, squats, gainage, puis des figures comme le muscle-up, le handstand, le front lever ou la planche. Elle se pratique avec peu de matériel, au parc de street workout comme à la maison.'],
      ['KALIST est-elle gratuite ?', 'Oui. La version gratuite comprend toute la bibliothèque de mouvements, le suivi des séances, le Parcours, quatre programmes et trois analyses caméra par mois. KALIST Premium, en abonnement, débloque les 24 programmes, la création de séances et les analyses sans limite.'],
      ['Faut-il du matériel ?', 'Non pour commencer : de nombreux mouvements se font sans matériel. Une barre de traction, des barres parallèles (parallettes) ou des anneaux ouvrent ensuite les figures de tirage et d’équilibre. Chaque fiche indique le matériel utile.'],
      ['Mes vidéos sont-elles envoyées sur internet ?', 'Non. Le coach analyse l’image de la caméra directement sur votre téléphone. Les vidéos ne sont enregistrées que si vous l’activez, et elles ne quittent l’appareil que si vous les partagez vous-même.'],
      ['Quand sort l’application ?', 'KALIST arrive sur Google Play et l’App Store. Écrivez-nous pour être prévenu du lancement : kalist.support@gmail.com.']
    ],
    finalCta: { title: 'Prêt à passer à la figure suivante ?', lead: 'KALIST arrive bientôt sur Android et iPhone. Gratuit, en français, anglais, espagnol, allemand et chinois.' },
    guide: { eyebrow: 'Guide de progression', steps: 'étapes', step: 'Étape', target: 'Objectif', muscles: 'Muscles', read: 'min de lecture', updated: 'Mis à jour le', toc: 'Sommaire', related: 'Autres guides', inApp: 'Ce parcours est dans KALIST', inAppLead: 'Suivez chaque étape avec son animation, enregistrez vos séries et laissez le coach caméra compter vos répétitions.', animation: 'Animation', seeGuide: 'Voir le guide' },
    library: { all: 'Tous', allLevels: 'Tous niveaux', count: 'mouvements', play: 'Lire l’animation', partOf: 'Dans le guide', target: 'Objectif', filters: 'Filtrer les exercices', category: 'Catégorie', level: 'Niveau' },
    reps: n => `3 × ${n} répétitions`, secs: n => `3 × ${n} s`,
    blog: { eyebrow: 'Blog calisthenics', read: 'Lire l’article' },
    crumbs: { guides: 'Guides', exercises: 'Exercices', blog: 'Blog' },
    footer: { site: 'Le site', legal: 'Informations', privacy: 'Confidentialité', terms: 'Conditions d’utilisation', notice: 'Mentions légales', support: 'Assistance', contact: 'Contact', rights: 'Tous droits réservés.' },
    health: 'Les conseils de ce site sont généraux et ne remplacent pas l’avis d’un médecin. Échauffez-vous, choisissez une variante adaptée et arrêtez en cas de douleur.',
    notFound: { title: 'Page introuvable', lead: 'Cette page n’existe pas ou a changé d’adresse.', back: 'Retour à l’accueil' },
    date: d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  },
  en: {
    locale: 'en_GB', skip: 'Skip to content', menu: 'Menu', home: 'Home',
    nav: { guides: 'Guides', exercises: 'Exercises', blog: 'Blog', app: 'The app' },
    switchTo: 'Français', switchLabel: 'Lire cette page en français',
    paths: { guides: '/en/guides/', exercises: '/en/exercises/', blog: '/en/blog/' },
    tagline: 'Calisthenics app: bodyweight programs, a skill journey and an on-device camera coach.',
    store: {
      soon: 'Coming soon to Google Play and the App Store',
      notify: 'Get notified at launch',
      notifySubject: 'Let me know when KALIST launches',
      googlePlay: 'Get it on Google Play', appStore: 'Download on the App Store'
    },
    hero: {
      eyebrow: 'Calisthenics app',
      title: 'The calisthenics app that takes you from your first push-up to the front lever',
      lead: 'Bodyweight programs, 94 animated movements and a camera coach that counts your reps right on your phone.',
      secondary: 'Explore the progression guides',
      alt: 'Athlete holding an L-sit on parallel bars in a training hall'
    },
    stats: [['94', 'animated movements'], ['24', 'programs'], ['7', 'skill paths'], ['5', 'languages']],
    features: {
      eyebrow: 'What KALIST does', title: 'Everything you need to progress with bodyweight training',
      items: [
        ['The Journey', 'Six worlds from Beginner to Expert. Every step sets a clear goal: reps, a set, a hold or mastery. Clear it to unlock the next one.'],
        ['94 animated movements', 'Every variation has an anatomical animation, the muscles it works, technique cues and mistakes to avoid. From planks to the front lever.'],
        ['24 programs', 'Eight programs per level in six-week cycles: warm-up, sets, rep ranges and rest. Your target rises when you are ready.'],
        ['A private camera coach', 'Set your phone down: the coach tracks your joints, counts full reps and times your holds. No image ever leaves the device.']
      ]
    },
    shots: {
      eyebrow: 'Inside the app', title: 'Built for your phone, at the park or at home',
      items: [['parcours', 'The Journey, from Beginner to Expert'], ['mouvement', 'One page per movement, with its animation'], ['coach', 'The camera coach, on the device']]
    },
    guidesBlock: { eyebrow: 'Progression guides', title: 'Learn the calisthenics skills', lead: 'Seven complete paths, each step animated, with the goal to reach and when to move on.', all: 'All guides' },
    libraryBlock: { eyebrow: 'Library', title: '94 bodyweight exercises, from beginner to advanced', lead: 'Push-ups, pull-ups, dips, core, legs, rings and static holds: every movement is animated, with its muscles and cues.', cta: 'See all exercises' },
    blogBlock: { eyebrow: 'Blog', title: 'Advice to get started', all: 'All articles' },
    privacy: { eyebrow: 'Privacy', title: 'Your training stays on your phone', lead: 'No account to create, no ads, no tracking. Video analysis runs on the device, and your sessions and videos stay there. Export a backup whenever you like.' },
    faqTitle: 'Frequently asked questions',
    faq: [
      ['What is calisthenics?', 'Calisthenics is bodyweight training: push-ups, pull-ups, dips, squats and core work, then skills such as the muscle-up, handstand, front lever and planche. It needs little equipment and works at a street workout park or at home.'],
      ['Is KALIST free?', 'Yes. The free version includes the full movement library, workout tracking, the Journey, four programs and three camera analyses per month. KALIST Premium, a subscription, unlocks all 24 programs, custom workouts and unlimited analyses.'],
      ['Do I need equipment?', 'Not to start: many movements need nothing at all. A pull-up bar, parallettes or rings then open up the pulling and balance skills. Every exercise page lists the equipment it uses.'],
      ['Are my videos uploaded?', 'No. The coach analyses the camera image directly on your phone. Videos are only recorded if you turn recording on, and they only leave the device if you share them yourself.'],
      ['When does the app launch?', 'KALIST is coming to Google Play and the App Store. Email us to hear about the launch: kalist.support@gmail.com.']
    ],
    finalCta: { title: 'Ready for your next skill?', lead: 'KALIST is coming soon to Android and iPhone. Free, in English, French, Spanish, German and Chinese.' },
    guide: { eyebrow: 'Progression guide', steps: 'steps', step: 'Step', target: 'Goal', muscles: 'Muscles', read: 'min read', updated: 'Updated', toc: 'Contents', related: 'More guides', inApp: 'This path is in KALIST', inAppLead: 'Follow every step with its animation, log your sets and let the camera coach count your reps.', animation: 'Animation', seeGuide: 'Read the guide' },
    library: { all: 'All', allLevels: 'All levels', count: 'movements', play: 'Play the animation', partOf: 'In the guide', target: 'Goal', filters: 'Filter exercises', category: 'Category', level: 'Level' },
    reps: n => `3 × ${n} reps`, secs: n => `3 × ${n} s`,
    blog: { eyebrow: 'Calisthenics blog', read: 'Read the article' },
    crumbs: { guides: 'Guides', exercises: 'Exercises', blog: 'Blog' },
    footer: { site: 'Site', legal: 'Information', privacy: 'Privacy', terms: 'Terms of use', notice: 'Legal notice', support: 'Support', contact: 'Contact', rights: 'All rights reserved.' },
    health: 'The advice on this site is general and does not replace a doctor’s opinion. Warm up, choose a suitable variation and stop if you feel pain.',
    notFound: { title: 'Page not found', lead: 'This page does not exist or has moved.', back: 'Back to the home page' },
    date: d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }
};
