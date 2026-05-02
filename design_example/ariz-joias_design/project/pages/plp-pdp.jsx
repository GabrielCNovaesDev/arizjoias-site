// Ariz Joias — Product Listing Page (PLP) + Product Detail Page (PDP)

function PLPPage({ mobile, onNav, category = 'Brincos' }) {
  const [sortBy, setSortBy] = useState('Relevância');
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const items = PRODUCTS.filter(p => category === 'Lançamentos' ? p.tag === 'novo' : p.category === category || PRODUCTS.length < 8);
  const displayed = items.length > 0 ? items : PRODUCTS;

  return (
    <div>
      {/* Category banner */}
      <section style={{ background: 'var(--color-primary-light)', padding: mobile ? '36px 22px 28px' : '64px 64px 48px', position: 'relative', overflow: 'hidden' }}>
        <div className="az-grain" />
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1.4fr 1fr', gap: mobile ? 20 : 64, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span onClick={() => onNav?.('home')} style={{ cursor: 'pointer' }}>início</span>
              <span>/</span>
              <span style={{ color: 'var(--color-text)' }}>{category.toLowerCase()}</span>
            </div>
            <h1 className="az-display" style={{ fontSize: mobile ? 56 : 92, margin: 0, fontWeight: 300, lineHeight: 0.95 }}>
              {category}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 460, lineHeight: 1.7, marginTop: 16 }}>
              {category === 'Brincos' && 'Do clássico ao inusitado — brincos que conversam com o rosto e com o gesto.'}
              {category === 'Colares' && 'Peças para camadas e solos, do pescoço ao decote.'}
              {category === 'Anéis' && 'Anéis para o gesto cotidiano — finos, delicados, para usar sempre.'}
              {category === 'Pulseiras' && 'Pulseiras que conversam com o movimento do pulso.'}
              {category === 'Pingentes' && 'Detalhes que contam sua história em poucos milímetros.'}
              {category === 'Conjuntos' && 'Peças pensadas para se completarem — brinco, colar e pingente.'}
              {category === 'Lançamentos' && 'As chegadas desta semana. Pensadas, feitas e embaladas à mão.'}
            </p>
            <div style={{ display: 'flex', gap: 20, marginTop: 22 }}>
              <div><span className="az-display" style={{ fontSize: 22, color: 'var(--color-sage-dark)' }}>{displayed.length}</span> <span style={{ fontSize: 10.5, color: 'var(--color-text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>peças</span></div>
              <div><span className="az-display" style={{ fontSize: 22, color: 'var(--color-sage-dark)' }}>4</span> <span style={{ fontSize: 10.5, color: 'var(--color-text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>coleções ativas</span></div>
            </div>
          </div>
          {!mobile && (
            <div style={{ position: 'relative', height: 260 }}>
              <img src="assets/emerald-clover-earring-model.png" style={{ position: 'absolute', right: 60, top: 0, width: 200, height: 240, objectFit: 'cover', transform: 'rotate(-3deg)' }} />
              <img src="assets/earring-crystal-hoop.png" style={{ position: 'absolute', right: 0, top: 40, width: 150, height: 180, objectFit: 'cover', transform: 'rotate(4deg)', boxShadow: 'var(--shadow-md)' }} />
            </div>
          )}
        </div>
      </section>

      {/* Toolbar */}
      <div style={{ position: 'sticky', top: mobile ? 68 : 90, zIndex: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: mobile ? '14px 22px' : '18px 48px', background: 'rgba(253,250,248,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-primary)', borderTop: '1px solid var(--color-primary)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: mobile ? 10 : 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <FilterPill label="Material" active={activeFilter === 'material'} onClick={() => setActiveFilter(activeFilter === 'material' ? null : 'material')} />
          <FilterPill label="Cor" active={activeFilter === 'color'} onClick={() => setActiveFilter(activeFilter === 'color' ? null : 'color')} />
          <FilterPill label="Pedra" />
          {!mobile && <FilterPill label="Preço" />}
          {!mobile && <FilterPill label="Coleção" />}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ordenar:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text)', cursor: 'pointer' }}>
            <option>Relevância</option><option>Menor preço</option><option>Maior preço</option><option>Lançamentos</option>
          </select>
        </div>
      </div>

      {/* Filter drawer */}
      {activeFilter === 'material' && (
        <div style={{ padding: mobile ? '20px 22px' : '24px 48px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-primary)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['Prata 925', 'Banho ouro', 'Banho ródio', 'Pérola natural', 'Zircônia', 'Quartzo verde'].map(m => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: selectedMaterials.includes(m) ? 'var(--color-sage-pale)' : 'var(--color-bg)', border: `1px solid ${selectedMaterials.includes(m) ? 'var(--color-sage)' : 'var(--color-primary)'}`, cursor: 'pointer', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text)' }}
              onClick={() => setSelectedMaterials(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}>
              {m}
            </label>
          ))}
        </div>
      )}

      {/* Grid */}
      <section style={{ padding: mobile ? '32px 22px 56px' : '48px 48px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: mobile ? 14 : 28, columnGap: mobile ? 14 : 28, rowGap: mobile ? 32 : 56 }}>
          {displayed.map((p, i) => (
            <div key={p.id} className="az-reveal" style={{ animationDelay: `${(i % 8) * 0.04}s` }}>
              <ProductCard product={p} onClick={() => onNav?.('pdp', p.id)} />
            </div>
          ))}
        </div>

        {/* Editorial breaker */}
        <div style={{ marginTop: mobile ? 48 : 96, padding: mobile ? '40px 24px' : '64px 48px', background: 'var(--color-surface-2)', textAlign: 'center', position: 'relative' }}>
          <ArizLogoMark size={40} />
          <div className="az-eyebrow" style={{ marginTop: 16 }}>a casa</div>
          <h3 className="az-display" style={{ fontSize: mobile ? 26 : 38, margin: '10px 0 14px', fontWeight: 300 }}>
            <em className="az-display-italic">Guia de tamanhos</em> personalizado
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.7 }}>
            Ficou em dúvida sobre o tamanho do anel ou a corrente ideal para o seu decote? Nossa equipe responde em até 2 horas pelo WhatsApp.
          </p>
          <button className="az-btn az-btn-ghost">Conversar com uma consultora</button>
        </div>
      </section>
    </div>
  );
}

function FilterPill({ label, active, onClick, dot }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 16px',
      background: active ? 'var(--color-text)' : 'transparent',
      color: active ? 'var(--color-text-on-dark)' : 'var(--color-text)',
      border: `1px solid ${active ? 'var(--color-text)' : 'var(--color-primary-dark)'}`,
      fontFamily: 'var(--font-body)', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase',
      cursor: 'pointer', transition: 'all .2s',
    }}>
      {label} <IconChevronDown s={11} />
    </button>
  );
}

/* ─── PDP ─── */
function PDPPage({ mobile, onNav, productId = 'flower-pendant-set' }) {
  const shop = useShop();
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
  const [selectedImg, setSelectedImg] = useState(0);
  const [size, setSize] = useState('M');
  const [color, setColor] = useState(product.colors[0]);
  const [showDetails, setShowDetails] = useState(false);

  const related = PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
  const images = [product.image, product.alt, product.image, product.alt].filter(Boolean);

  const fav = shop.favorites.has(product.id);

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ padding: mobile ? '14px 22px' : '18px 48px', fontSize: 10.5, color: 'var(--color-text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'flex', gap: 8 }}>
        <span onClick={() => onNav?.('home')} style={{ cursor: 'pointer' }}>início</span><span>/</span>
        <span onClick={() => onNav?.('plp', product.category)} style={{ cursor: 'pointer' }}>{product.category}</span><span>/</span>
        <span style={{ color: 'var(--color-text)' }}>{product.name}</span>
      </div>

      {/* Main product */}
      <section style={{ padding: mobile ? '12px 22px 40px' : '24px 48px 72px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1.15fr 1fr', gap: mobile ? 28 : 64, alignItems: 'start' }}>
          {/* Gallery */}
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '72px 1fr', gap: 16 }}>
            {!mobile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {images.map((src, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)} style={{
                    border: selectedImg === i ? '1px solid var(--color-sage-dark)' : '1px solid var(--color-primary)',
                    padding: 2, background: 'var(--color-surface)', cursor: 'pointer',
                  }}>
                    <img src={src} style={{ width: 64, height: 80, objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <div style={{ aspectRatio: '4/5', background: 'var(--color-surface)', overflow: 'hidden', position: 'relative' }}>
                <img src={images[selectedImg]} style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'azFadeUp 0.4s ease' }} key={selectedImg} />
                {product.tag && (
                  <div style={{ position: 'absolute', top: 18, left: 18, background: 'var(--color-bg)', color: 'var(--color-sage-dark)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 500, padding: '8px 12px', border: '1px solid var(--color-sage)' }}>
                    {product.tag}
                  </div>
                )}
              </div>
              {mobile && (
                <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto' }}>
                  {images.map((src, i) => (
                    <button key={i} onClick={() => setSelectedImg(i)} style={{
                      border: selectedImg === i ? '1px solid var(--color-sage-dark)' : '1px solid var(--color-primary)',
                      padding: 2, background: 'var(--color-surface)', flexShrink: 0,
                    }}>
                      <img src={src} style={{ width: 52, height: 66, objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div style={{ position: mobile ? 'static' : 'sticky', top: 120 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }}>
              {product.category} · {product.id.toUpperCase().slice(0, 6)}
            </div>
            <h1 className="az-display" style={{ fontSize: mobile ? 38 : 54, margin: 0, fontWeight: 300, lineHeight: 1 }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, color: 'var(--color-gold)' }}>
              {[1,2,3,4,5].map(s => <IconStar key={s} s={13} filled={s <= Math.round(product.rating)} />)}
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 4 }}>{product.rating} · {product.reviews} avaliações</span>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 24 }}>
              <span className="az-price" style={{ fontSize: 28, color: 'var(--color-gold-dark)' }}>{formatBRL(product.price)}</span>
              {product.oldPrice && <span style={{ fontSize: 14, color: 'var(--color-text-light)', textDecoration: 'line-through' }}>{formatBRL(product.oldPrice)}</span>}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 4 }}>
              ou 6x de {formatBRL(product.price / 6)} sem juros · <span style={{ color: 'var(--color-sage-dark)' }}>5% no Pix</span>
            </div>

            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.8, margin: '28px 0 0', maxWidth: 460 }}>
              {product.desc}
            </p>

            {/* Acabamento */}
            {product.colors.length > 1 && (
              <div style={{ marginTop: 32 }}>
                <div className="az-eyebrow" style={{ marginBottom: 12 }}>Acabamento</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {product.colors.map(c => (
                    <button key={c} onClick={() => setColor(c)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px',
                      background: color === c ? 'var(--color-primary-light)' : 'transparent',
                      border: `1px solid ${color === c ? 'var(--color-sage)' : 'var(--color-primary-dark)'}`,
                      cursor: 'pointer',
                      fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text)',
                    }}>
                      <span style={{ width: 14, height: 14, borderRadius: '50%', background: c === 'gold' ? 'linear-gradient(135deg,#D4BE93,#8A7045)' : 'linear-gradient(135deg,#EDE4DD,#A89B93)', display: 'inline-block' }} />
                      {c === 'gold' ? 'Ouro' : 'Prata'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tamanho */}
            <div style={{ marginTop: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="az-eyebrow">Tamanho</div>
                <button style={{ fontSize: 10.5, color: 'var(--color-sage-dark)', background: 'none', border: 'none', textDecoration: 'underline', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Guia de tamanhos</button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['P', 'M', 'G', 'Único'].map(s => (
                  <button key={s} onClick={() => setSize(s)} style={{
                    minWidth: 48, padding: '12px 14px',
                    background: size === s ? 'var(--color-text)' : 'transparent',
                    color: size === s ? 'var(--color-text-on-dark)' : 'var(--color-text)',
                    border: `1px solid ${size === s ? 'var(--color-text)' : 'var(--color-primary-dark)'}`,
                    fontSize: 12, fontWeight: 400, letterSpacing: '0.08em',
                    cursor: 'pointer',
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
              <button className="az-btn az-btn-primary" style={{ flex: 1, padding: '18px 24px' }}
                onClick={() => shop.addToCart(product, { size, color })}>
                Adicionar à sacola <IconBag s={14} />
              </button>
              <button onClick={() => shop.toggleFav(product.id)} style={{
                background: 'transparent', border: '1px solid var(--color-primary-dark)',
                width: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                color: fav ? 'var(--color-sage-dark)' : 'var(--color-text)',
              }}><IconHeart s={18} filled={fav} /></button>
            </div>

            {/* Trust row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 28, padding: '20px 0', borderTop: '1px solid var(--color-primary)', borderBottom: '1px solid var(--color-primary)' }}>
              {[
                { icon: <IconShip s={18}/>, t: 'Enviamos em 48h' },
                { icon: <IconShield s={18}/>, t: 'Garantia vitalícia' },
                { icon: <IconBox s={18}/>, t: 'Embalagem presente' },
              ].map(v => (
                <div key={v.t} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--color-sage-dark)', textAlign: 'center' }}>
                  {v.icon}
                  <span style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{v.t}</span>
                </div>
              ))}
            </div>

            {/* Accordion details */}
            <button onClick={() => setShowDetails(!showDetails)} style={{ width: '100%', marginTop: 16, padding: '16px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--color-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
              Detalhes da peça <span style={{ transform: showDetails ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }}><IconChevronDown /></span>
            </button>
            {showDetails && (
              <div style={{ padding: '16px 0', animation: 'azFadeUp 0.3s ease' }}>
                {Object.entries(product.details).filter(([k, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 10, padding: '8px 0', fontSize: 12.5 }}>
                    <span style={{ color: 'var(--color-text-muted)', textTransform: 'capitalize', letterSpacing: '0.04em' }}>{k === 'material' ? 'Material' : k === 'stone' ? 'Pedra' : k === 'chain' ? 'Corrente' : k === 'weight' ? 'Peso' : k}</span>
                    <span style={{ color: 'var(--color-text)' }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Review excerpt */}
      <section style={{ background: 'var(--color-surface)', padding: mobile ? '44px 22px' : '72px 64px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', gap: 4, color: 'var(--color-gold)', marginBottom: 16 }}>
            {[1,2,3,4,5].map(s => <IconStar key={s} s={14} />)}
          </div>
          <p className="az-display" style={{ fontSize: mobile ? 22 : 28, fontWeight: 300, fontStyle: 'italic', lineHeight: 1.4, margin: 0, color: 'var(--color-text)' }}>
            "Ganhei de presente e foi paixão no primeiro dia. O brilho é delicado na luz do dia e marcante à noite. A embalagem já é um presente dentro do presente."
          </p>
          <div style={{ marginTop: 20, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            Beatriz L. · cliente verificada · há 2 semanas
          </div>
        </div>
      </section>

      {/* Related */}
      <ProductGridSection
        mobile={mobile}
        eyebrow="complemente a peça"
        title={<>Combina <em className="az-display-italic">com isto</em></>}
        products={related}
        onClick={(p) => onNav?.('pdp', p.id)}
      />
    </div>
  );
}

Object.assign(window, { PLPPage, PDPPage });
