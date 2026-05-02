// Ariz Joias — Header, Footer, ProductCard, CartDrawer, Cart context.
// Uses primitives from primitives.jsx (globals).

const { useState, useEffect, useRef, createContext, useContext, useMemo } = React;

/* ─── Cart / Favorites context ─── */
const ShopCtx = createContext(null);

function ShopProvider({ children }) {
  const [cart, setCart] = useState([]); // {id, size, color, qty}
  const [favorites, setFavorites] = useState(new Set(['heart-necklace-set', 'emerald-clover']));
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (product, opts = {}) => {
    const entry = { id: product.id, size: opts.size || 'M', color: opts.color || product.colors[0], qty: opts.qty || 1 };
    setCart(prev => {
      const existing = prev.findIndex(p => p.id === entry.id && p.size === entry.size && p.color === entry.color);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], qty: next[existing].qty + entry.qty };
        return next;
      }
      return [...prev, entry];
    });
    setCartOpen(true);
  };
  const updateQty = (idx, qty) => setCart(p => qty <= 0 ? p.filter((_, i) => i !== idx) : p.map((it, i) => i === idx ? { ...it, qty } : it));
  const removeItem = (idx) => setCart(p => p.filter((_, i) => i !== idx));
  const toggleFav = (id) => setFavorites(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const value = { cart, setCart, favorites, toggleFav, cartOpen, setCartOpen, addToCart, updateQty, removeItem };
  return <ShopCtx.Provider value={value}>{children}</ShopCtx.Provider>;
}
const useShop = () => useContext(ShopCtx);

/* ─── Announcement bar ─── */
function AnnouncementBar({ mobile }) {
  const msgs = [
    'Frete grátis em pedidos acima de R$ 350',
    'Embalagem presente incluída · Entrega em até 3 dias úteis',
    'Parcele em até 6x sem juros',
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % msgs.length), 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      background: 'var(--color-text)',
      color: 'var(--color-text-on-dark)',
      padding: mobile ? '8px 14px' : '10px 24px',
      textAlign: 'center',
      fontSize: mobile ? 10 : 11,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      fontWeight: 300,
      overflow: 'hidden',
      position: 'relative',
      height: mobile ? 28 : 34,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span key={i} style={{ animation: 'azFadeUp 0.6s ease both' }}>{msgs[i]}</span>
    </div>
  );
}

/* ─── Header (desktop + mobile) ─── */
function Header({ mobile, activePage = 'home', onNav }) {
  const shop = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const hoverBg = scrolled ? 'rgba(253,250,248,0.88)' : 'var(--color-bg)';

  if (mobile) {
    return (
      <>
        <AnnouncementBar mobile />
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--color-primary)',
          background: 'var(--color-bg)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--color-text)', padding: 4 }}>
            <IconMenu s={20} />
          </button>
          <div onClick={() => onNav?.('home')} style={{ cursor: 'pointer' }}>
            <ArizWordmark size={14} tagline={false} />
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <button style={btnIcon}><IconSearch s={18} /></button>
            <button onClick={() => shop.setCartOpen(true)} style={{ ...btnIcon, position: 'relative' }}>
              <IconBag s={18} />
              {shop.cart.length > 0 && <span style={cartBadge}>{shop.cart.reduce((a, b) => a + b.qty, 0)}</span>}
            </button>
          </div>
        </header>
        {menuOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'var(--color-bg)', zIndex: 50, padding: '20px 24px', animation: 'azFadeUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
              <ArizWordmark size={14} tagline={false} />
              <button onClick={() => setMenuOpen(false)} style={btnIcon}><IconClose s={20} /></button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {CATEGORIES.map(c => (
                <a key={c} onClick={() => { setMenuOpen(false); onNav?.('plp', c); }}
                   style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottom: '1px solid var(--color-primary)' }}>
                  {c} <IconArrowRight s={14} />
                </a>
              ))}
            </nav>
            <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <a style={mobLink}><IconUser s={16} /> Minha conta</a>
              <a style={mobLink}><IconHeart s={16} /> Favoritos ({shop.favorites.size})</a>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <header style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '22px 48px 14px',
        borderBottom: '1px solid var(--color-primary)',
        background: hoverBg,
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {CATEGORIES.slice(0, 5).map(c => (
            <a key={c} onClick={() => onNav?.('plp', c)}
               style={navLink(activePage === 'plp')}>{c}</a>
          ))}
        </nav>
        <div onClick={() => onNav?.('home')} style={{ cursor: 'pointer', textAlign: 'center' }}>
          <ArizLogoLockup mark={32} word={18} />
        </div>
        <div style={{ display: 'flex', gap: 22, alignItems: 'center', justifyContent: 'flex-end' }}>
          <a style={navLink(false)}>Lookbook</a>
          <a style={navLink(false)}>Contato</a>
          <button style={btnIcon}><IconSearch s={17} /></button>
          <button style={btnIcon}><IconUser s={17} /></button>
          <button style={{ ...btnIcon, position: 'relative' }}><IconHeart s={17} />
            {shop.favorites.size > 0 && <span style={{ ...cartBadge, background: 'var(--color-sage)' }}>{shop.favorites.size}</span>}
          </button>
          <button onClick={() => shop.setCartOpen(true)} style={{ ...btnIcon, position: 'relative' }}>
            <IconBag s={17} />
            {shop.cart.length > 0 && <span style={cartBadge}>{shop.cart.reduce((a, b) => a + b.qty, 0)}</span>}
          </button>
        </div>
      </header>
    </>
  );
}

const navLink = (active) => ({
  fontFamily: 'var(--font-body)',
  fontSize: 10.5, fontWeight: 400,
  letterSpacing: '0.22em', textTransform: 'uppercase',
  color: active ? 'var(--color-sage-dark)' : 'var(--color-text-muted)',
  cursor: 'pointer', transition: 'color .2s',
  paddingBottom: 3, borderBottom: active ? '1px solid var(--color-sage)' : '1px solid transparent',
});
const btnIcon = { background: 'none', border: 'none', color: 'var(--color-text)', padding: 4, display: 'flex', cursor: 'pointer', position: 'relative' };
const cartBadge = {
  position: 'absolute', top: -4, right: -6,
  background: 'var(--color-gold)', color: 'var(--color-bg)',
  fontSize: 9, fontWeight: 500, minWidth: 14, height: 14, borderRadius: 7,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font-body)',
};
const mobLink = { display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)' };

/* ─── Product Card ─── */
function ProductCard({ product, onClick, showQuickAdd = true, size = 'md' }) {
  const shop = useShop();
  const fav = shop.favorites.has(product.id);
  const [hover, setHover] = useState(false);
  const [justFav, setJustFav] = useState(false);

  const tagColor = {
    novo: 'var(--color-sage)',
    exclusivo: 'var(--color-gold)',
    'mais amado': 'var(--color-primary-dark)',
  }[product.tag] || 'var(--color-sage)';

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14 }}
      onClick={onClick}
    >
      <div style={{
        position: 'relative',
        background: 'var(--color-surface)',
        aspectRatio: '1 / 1.15',
        overflow: 'hidden',
        borderRadius: 'var(--radius-sm)',
      }}>
        <img src={product.image} alt={product.name}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.8s cubic-bezier(.2,.7,.3,1), opacity 0.4s',
            transform: hover ? 'scale(1.04)' : 'scale(1)',
            opacity: hover && product.alt ? 0 : 1,
          }}
        />
        {product.alt && (
          <img src={product.alt} alt={product.name}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'opacity 0.4s',
              opacity: hover ? 1 : 0,
            }}
          />
        )}

        {/* Tag */}
        {product.tag && (
          <div style={{
            position: 'absolute', top: 14, left: 14,
            background: 'var(--color-bg)',
            color: tagColor,
            fontFamily: 'var(--font-body)', fontSize: 9, letterSpacing: '0.24em',
            textTransform: 'uppercase', fontWeight: 500,
            padding: '6px 10px',
            border: `1px solid ${tagColor}`,
          }}>
            {product.tag}
          </div>
        )}

        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); shop.toggleFav(product.id); setJustFav(true); setTimeout(() => setJustFav(false), 500); }}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'var(--color-bg)', border: 'none',
            width: 34, height: 34, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: fav ? 'var(--color-sage-dark)' : 'var(--color-text-muted)',
            cursor: 'pointer', transition: 'color .2s',
          }}
        >
          <span className={justFav ? 'az-heart-pulse' : ''} style={{ display: 'flex' }}>
            <IconHeart s={15} filled={fav} />
          </span>
        </button>

        {/* Quick add */}
        {showQuickAdd && (
          <button
            onClick={(e) => { e.stopPropagation(); shop.addToCart(product); }}
            style={{
              position: 'absolute', left: 14, right: 14, bottom: 14,
              background: 'var(--color-text)', color: 'var(--color-text-on-dark)',
              border: 'none', padding: '11px 12px',
              fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.2em',
              textTransform: 'uppercase', fontWeight: 400,
              cursor: 'pointer',
              transform: hover ? 'translateY(0)' : 'translateY(6px)',
              opacity: hover ? 1 : 0,
              transition: 'all 0.35s cubic-bezier(.2,.7,.3,1)',
            }}
          >
            Adicionar
          </button>
        )}
      </div>
      <div style={{ padding: '0 2px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-text-light)' }}>
          {product.category}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: size === 'lg' ? 22 : 17, fontWeight: 400, color: 'var(--color-text)', letterSpacing: '0.005em', lineHeight: 1.2 }}>
          {product.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2 }}>
          <span className="az-price" style={{ fontSize: 13 }}>{formatBRL(product.price)}</span>
          {product.oldPrice && (
            <span style={{ fontSize: 11, color: 'var(--color-text-light)', textDecoration: 'line-through' }}>{formatBRL(product.oldPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Cart drawer ─── */
function CartDrawer({ mobile }) {
  const shop = useShop();
  const items = shop.cart.map(it => ({ ...it, product: PRODUCTS.find(p => p.id === it.id) }));
  const subtotal = items.reduce((a, it) => a + it.product.price * it.qty, 0);
  const freeShipRemaining = Math.max(0, 350 - subtotal);
  const pct = Math.min(100, (subtotal / 350) * 100);

  if (!shop.cartOpen) return null;

  return (
    <>
      <div onClick={() => shop.setCartOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(44,35,32,0.28)', zIndex: 100, animation: 'azFadeUp 0.3s ease' }} />
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: mobile ? '100%' : 440,
        background: 'var(--color-bg)', zIndex: 110,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 40px rgba(44,35,32,0.12)',
        animation: 'azSlideIn 0.35s cubic-bezier(.2,.7,.3,1) both',
      }}>
        <style>{`@keyframes azSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        <div style={{ padding: '22px 28px 18px', borderBottom: '1px solid var(--color-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400 }}>Sua sacola</div>
          <button onClick={() => shop.setCartOpen(false)} style={btnIcon}><IconClose s={18} /></button>
        </div>

        {/* Free ship progress */}
        <div style={{ padding: '14px 28px', borderBottom: '1px solid var(--color-primary-light)', background: 'var(--color-primary-light)' }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6, letterSpacing: '0.04em' }}>
            {freeShipRemaining > 0 ? (
              <>Faltam <b style={{ color: 'var(--color-sage-dark)' }}>{formatBRL(freeShipRemaining)}</b> para frete grátis</>
            ) : (
              <><b style={{ color: 'var(--color-sage-dark)' }}>Parabéns!</b> você ganhou frete grátis ✿</>
            )}
          </div>
          <div style={{ height: 2, background: 'var(--color-primary)', borderRadius: 1, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-sage)', transition: 'width 0.6s' }} />
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40, textAlign: 'center' }}>
            <IconBag s={40} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-text)' }}>Sua sacola está vazia</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', maxWidth: 280 }}>Descubra peças que carregam leveza e alma.</div>
            <button className="az-btn az-btn-primary" onClick={() => shop.setCartOpen(false)} style={{ marginTop: 8 }}>Explorar coleção</button>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
              {items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 14, padding: '18px 28px', borderBottom: '1px solid var(--color-primary-light)' }}>
                  <div style={{ width: 76, height: 96, background: 'var(--color-surface)', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={it.product.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-light)' }}>{it.product.category}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 400, marginTop: 3, marginBottom: 4 }}>{it.product.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {it.color === 'gold' ? 'Ouro' : 'Prata'} · Tam {it.size}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-primary-dark)' }}>
                        <button onClick={() => shop.updateQty(idx, it.qty - 1)} style={qtyBtn}><IconMinus s={12} /></button>
                        <span style={{ padding: '0 12px', fontSize: 12, minWidth: 16, textAlign: 'center' }}>{it.qty}</span>
                        <button onClick={() => shop.updateQty(idx, it.qty + 1)} style={qtyBtn}><IconPlus s={12} /></button>
                      </div>
                      <div className="az-price" style={{ fontSize: 13 }}>{formatBRL(it.product.price * it.qty)}</div>
                    </div>
                  </div>
                  <button onClick={() => shop.removeItem(idx)} style={{ ...btnIcon, alignSelf: 'flex-start', color: 'var(--color-text-light)' }}>
                    <IconClose s={14} />
                  </button>
                </div>
              ))}
              <div style={{ padding: '20px 28px', background: 'var(--color-surface)', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-sage-dark)' }}>
                  <IconBox s={16} />
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text)', fontWeight: 400 }}>Embalagem presente</div>
                  <div style={{ fontSize: 10.5, color: 'var(--color-text-muted)' }}>Incluímos cartão, laço e caixa assinatura — cortesia.</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '22px 28px', borderTop: '1px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Subtotal</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-text)' }}>{formatBRL(subtotal)}</span>
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--color-text-muted)', marginBottom: 14 }}>
                Em até 6x de {formatBRL(subtotal / 6)} sem juros
              </div>
              <button className="az-btn az-btn-primary" style={{ width: '100%' }}>
                Finalizar compra <IconArrowRight s={14} />
              </button>
              <button onClick={() => shop.setCartOpen(false)} style={{ ...btnIcon, width: '100%', justifyContent: 'center', marginTop: 10, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                Continuar comprando
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
const qtyBtn = { background: 'none', border: 'none', padding: '6px 8px', cursor: 'pointer', color: 'var(--color-text)', display: 'flex' };

/* ─── Footer ─── */
function Footer({ mobile }) {
  const cols = [
    { title: 'Navegar', links: ['Lançamentos', 'Best-sellers', 'Coleções', 'Noivas', 'Guia de presentes'] },
    { title: 'Atendimento', links: ['Contato', 'Guia de tamanhos', 'Cuidados com a joia', 'Trocas e devoluções', 'Garantia vitalícia'] },
    { title: 'A casa Ariz', links: ['Nosso manifesto', 'Atelier', 'Matérias-primas', 'Sustentabilidade'] },
  ];
  return (
    <footer style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-primary)', padding: mobile ? '48px 22px 28px' : '72px 48px 32px', color: 'var(--color-text)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1.4fr 1fr 1fr 1fr', gap: mobile ? 36 : 56, alignItems: 'start' }}>
        <div>
          <ArizLogoLockup mark={42} word={18} tagline />
          <div style={{ marginTop: 28, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, fontWeight: 300, color: 'var(--color-text-muted)', lineHeight: 1.5, maxWidth: 320 }}>
            "Cada peça é escolhida para acompanhar quem sente o mundo com delicadeza."
          </div>
          <div style={{ marginTop: 24 }}>
            <div className="az-eyebrow" style={{ marginBottom: 10 }}>receba o lookbook</div>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-primary-dark)' }}>
              <input placeholder="seu e-mail" style={{ background: 'none', border: 'none', outline: 'none', padding: '10px 0', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text)', flex: 1 }} />
              <button style={{ background: 'none', border: 'none', color: 'var(--color-sage-dark)', padding: '8px 4px', cursor: 'pointer', display: 'flex' }}>
                <IconArrowRight s={16} />
              </button>
            </div>
          </div>
        </div>
        {cols.map(c => (
          <div key={c.title}>
            <div className="az-eyebrow" style={{ marginBottom: 18 }}>{c.title}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {c.links.map(l => <li key={l} style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}><a>{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ marginTop: mobile ? 40 : 64, paddingTop: 22, borderTop: '1px solid var(--color-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, fontSize: 10.5, color: 'var(--color-text-light)', letterSpacing: '0.08em' }}>
        <div>© 2026 Ariz Joias · CNPJ 00.000.000/0001-00 · Todas as peças com garantia vitalícia contra defeito de fabricação.</div>
        <div style={{ display: 'flex', gap: 18 }}>
          <span>Instagram</span><span>Pinterest</span><span>TikTok</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { ShopProvider, useShop, Header, Footer, ProductCard, CartDrawer, AnnouncementBar });
