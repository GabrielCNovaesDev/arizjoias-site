// Ariz Joias — Shared primitives
// Logo recreated in SVG (leaf outline + wordmark); icons; product catalog.

/* ───────── Logo ───────── */
// Original leaf-outline mark redrawn fresh (not copied pixel-for-pixel).
// Shape is a simple feathered almond with an inner midrib curve.
function ArizLogoMark({ size = 48, color = 'var(--color-sage-dark)', stroke = 1.3 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'block' }}>
      {/* outer leaf silhouette */}
      <path
        d="M18 54 C 14 44, 17 28, 28 18 C 38 9, 50 9, 52 10 C 53 12, 50 26, 42 38 C 34 48, 24 54, 18 54 Z"
        stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      />
      {/* midrib */}
      <path
        d="M22 50 C 26 42, 32 33, 42 24"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
      />
    </svg>
  );
}

function ArizWordmark({ size = 28, color = 'currentColor', tagline = true }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 400,
        fontSize: size,
        letterSpacing: '0.32em',
        lineHeight: 1,
        paddingLeft: '0.32em',
      }}>
        ARIZ JOIAS
      </div>
      {tagline && (
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: size * 0.28,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          paddingLeft: '0.28em',
        }}>
          joias com leveza e alma
        </div>
      )}
    </div>
  );
}

function ArizLogoLockup({ mark = 40, word = 20, color = 'var(--color-text)', tagline = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <ArizLogoMark size={mark} />
      <ArizWordmark size={word} color={color} tagline={tagline} />
    </div>
  );
}

/* ───────── Icons (stroke-based, elegant) ───────── */
const IconSearch = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.3-4.3"/>
  </svg>
);
const IconBag = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8Z"/>
    <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
  </svg>
);
const IconHeart = ({ s = 18, filled = false }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
    <path d="M12 20s-7-4.5-7-10.2A4.3 4.3 0 0 1 12 6.5a4.3 4.3 0 0 1 7 3.3C19 15.5 12 20 12 20Z"/>
  </svg>
);
const IconUser = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <circle cx="12" cy="9" r="3.5"/><path d="M5 20c1.6-3.5 4.2-5 7-5s5.4 1.5 7 5"/>
  </svg>
);
const IconArrowRight = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
  </svg>
);
const IconPlus = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
);
const IconMinus = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M5 12h14"/></svg>
);
const IconClose = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
);
const IconMenu = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M4 8h16M4 16h16"/></svg>
);
const IconFilter = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
);
const IconChevronDown = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);
const IconStar = ({ s = 12, filled = true }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1"><path d="m12 3 2.6 6 6.4.5-4.9 4.3 1.6 6.5L12 17l-5.7 3.3 1.6-6.5L3 9.5l6.4-.5Z"/></svg>
);
const IconShip = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="13" height="10" rx="1"/><path d="M15 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/>
  </svg>
);
const IconShield = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);
const IconBox = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8 12 4l9 4v9l-9 4-9-4Z"/><path d="M3 8l9 4 9-4"/><path d="M12 12v9"/>
  </svg>
);

/* ───────── Product catalog ───────── */
const PRODUCTS = [
  {
    id: 'flower-pendant-set',
    name: 'Conjunto Flor de Cristal',
    category: 'Conjuntos',
    price: 389,
    oldPrice: 449,
    image: 'assets/flower-pendant-set-model.png',
    alt: 'assets/flower-pendant-set.png',
    tag: 'exclusivo',
    colors: ['silver', 'gold'],
    rating: 4.9,
    reviews: 124,
    desc: 'Brincos e pingente em prata 925 com cristais lapidados em forma de flor. Peça-chave para dias especiais.',
    details: {
      material: 'Prata 925 banhada a ródio',
      stone: 'Cristais de zircônia',
      chain: 'Corrente veneziana 45cm',
      weight: '4.2g',
    },
  },
  {
    id: 'heart-necklace-set',
    name: 'Colar Duo Coração',
    category: 'Colares',
    price: 219,
    image: 'assets/set-heart-necklace.png',
    alt: 'assets/butterfly-ring.png',
    tag: 'mais amado',
    colors: ['silver'],
    rating: 4.8,
    reviews: 203,
    desc: 'Colar duplo com pingentes em formato de coração pavê. Delicado e romântico.',
    details: {
      material: 'Prata 925',
      stone: 'Zircônias brancas',
      chain: 'Dupla — 38cm e 42cm',
      weight: '3.1g',
    },
  },
  {
    id: 'emerald-clover',
    name: 'Brincos Trevo Esmeralda',
    category: 'Brincos',
    price: 279,
    image: 'assets/emerald-clover-earring-model.png',
    alt: 'assets/emerald-clover-earring.png',
    tag: 'novo',
    colors: ['silver'],
    rating: 4.9,
    reviews: 67,
    desc: 'Brincos em forma de trevo com quartzo verde lapidação coração. Símbolo de sorte e prosperidade.',
    details: {
      material: 'Prata 925 banhada a ródio',
      stone: 'Quartzo verde lapidação coração',
      chain: 'Fixação por pino',
      weight: '1.8g',
    },
  },
  {
    id: 'crystal-hoop',
    name: 'Argola Baguete',
    category: 'Brincos',
    price: 329,
    image: 'assets/earring-crystal-hoop.png',
    alt: 'assets/earring-crystal-hoop.png',
    tag: 'novo',
    colors: ['silver', 'gold'],
    rating: 5.0,
    reviews: 42,
    desc: 'Argola média com cristais baguete em sequência. Modelagem envolvente e presença marcante.',
    details: {
      material: 'Prata 925 banhada a ródio',
      stone: 'Cristais lapidação baguete',
      chain: 'Fixação click',
      weight: '3.4g',
    },
  },
  {
    id: 'flower-bracelet',
    name: 'Pulseira Jardim',
    category: 'Pulseiras',
    price: 459,
    image: 'assets/flower-bracelet.png',
    alt: 'assets/flower-pendant-alt.png',
    tag: 'exclusivo',
    colors: ['silver'],
    rating: 4.9,
    reviews: 88,
    desc: 'Pulseira com 10 florzinhas cravejadas espalhadas em corrente delicada.',
    details: {
      material: 'Prata 925',
      stone: 'Zircônias brancas',
      chain: 'Corrente 18cm com ajuste',
      weight: '5.1g',
    },
  },
  {
    id: 'pearl-infinity',
    name: 'Pulseira Infinito Pérola',
    category: 'Pulseiras',
    price: 249,
    image: 'assets/pearl-infinity-bracelet.png',
    alt: 'assets/silver-drop-bracelet.png',
    tag: null,
    colors: ['silver'],
    rating: 4.7,
    reviews: 156,
    desc: 'Pérolas naturais cultivadas com elo infinito em prata. Romântico e atemporal.',
    details: {
      material: 'Prata 925',
      stone: 'Pérolas cultivadas 5mm',
      chain: 'Elástico resistente 17cm',
      weight: '4.8g',
    },
  },
  {
    id: 'drop-bracelet',
    name: 'Pulseira Gota Líquida',
    category: 'Pulseiras',
    price: 519,
    image: 'assets/silver-drop-bracelet.png',
    alt: 'assets/pearl-infinity-bracelet.png',
    tag: 'novo',
    colors: ['silver'],
    rating: 4.8,
    reviews: 34,
    desc: 'Elos em formato de gota com acabamento espelhado. Peso agradável no pulso.',
    details: {
      material: 'Prata 925 polida',
      stone: null,
      chain: 'Elo gota — 19cm',
      weight: '8.2g',
    },
  },
  {
    id: 'circle-pendant',
    name: 'Colar Círculo Pavê',
    category: 'Colares',
    price: 299,
    image: 'assets/circle-pendant-necklace.png',
    alt: 'assets/flower-pendant-alt.png',
    tag: null,
    colors: ['silver', 'gold'],
    rating: 4.8,
    reviews: 91,
    desc: 'Pingente circular cravejado em corrente fina. Minimalista, use sozinho ou em camadas.',
    details: {
      material: 'Prata 925',
      stone: 'Zircônias brancas',
      chain: 'Corrente 45cm',
      weight: '2.4g',
    },
  },
  {
    id: 'butterfly-ring',
    name: 'Anel Borboleta',
    category: 'Anéis',
    price: 189,
    image: 'assets/butterfly-ring.png',
    alt: 'assets/butterfly-ring.png',
    tag: 'mais amado',
    colors: ['silver', 'gold'],
    rating: 4.9,
    reviews: 217,
    desc: 'Anel com borboleta cravejada em haste torcida. Leveza ao toque e brilho delicado.',
    details: {
      material: 'Prata 925',
      stone: 'Zircônias brancas',
      chain: 'Ajustável 14–18',
      weight: '1.2g',
    },
  },
  {
    id: 'flower-pendant-alt',
    name: 'Pingente Flor de Campo',
    category: 'Pingentes',
    price: 199,
    image: 'assets/flower-pendant-alt.png',
    alt: 'assets/flower-pendant-set.png',
    tag: null,
    colors: ['silver'],
    rating: 4.9,
    reviews: 58,
    desc: 'Pingente em forma de flor lapidada com moldura de zircônias.',
    details: {
      material: 'Prata 925',
      stone: 'Zircônia central + moldura',
      chain: 'Corrente veneziana 42cm',
      weight: '2.0g',
    },
  },
];

const CATEGORIES = ['Colares', 'Brincos', 'Anéis', 'Pulseiras', 'Pingentes', 'Conjuntos', 'Lançamentos'];

const formatBRL = (n) => 'R$ ' + n.toFixed(2).replace('.', ',');

Object.assign(window, {
  ArizLogoMark, ArizWordmark, ArizLogoLockup,
  IconSearch, IconBag, IconHeart, IconUser, IconArrowRight, IconPlus, IconMinus,
  IconClose, IconMenu, IconFilter, IconChevronDown, IconStar, IconShip, IconShield, IconBox,
  PRODUCTS, CATEGORIES, formatBRL,
});
