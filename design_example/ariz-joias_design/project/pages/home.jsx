// Ariz Joias — Home page

function HomePage({ mobile, onNav, heroVariant = 'split' }) {
  const newArrivals = PRODUCTS.filter(p => p.tag === 'novo' || p.tag === 'exclusivo').slice(0, 4);
  const bestSellers = PRODUCTS.filter(p => p.tag === 'mais amado' || p.rating >= 4.8).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <HeroSection mobile={mobile} variant={heroVariant} onNav={onNav} />

      {/* Category strip */}
      <section style={{ padding: mobile ? '44px 22px' : '88px 48px', background: 'var(--color-bg)', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: mobile ? 28 : 56 }}>
          <div className="az-eyebrow" style={{ marginBottom: 16 }}>universos</div>
          <h2 className="az-display" style={{ fontSize: mobile ? 36 : 56, margin: 0 }}>
            <em style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 300 }}>Para cada</em> sentimento,
            <br/>uma peça que se faz memória
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: mobile ? 14 : 24,
        }}>
          {[
            { name: 'Colares', img: 'assets/circle-pendant-necklace.png', count: 42 },
            { name: 'Brincos', img: 'assets/earring-crystal-hoop.png', count: 67 },
            { name: 'Anéis', img: 'assets/butterfly-ring.png', count: 38 },
            { name: 'Pulseiras', img: 'assets/pearl-infinity-bracelet.png', count: 29 },
          ].map((c, i) => (
            <div key={c.name} onClick={() => onNav?.('plp', c.name)} className="az-reveal" style={{ animationDelay: `${i * 0.08}s`, cursor: 'pointer' }}>
              <div style={{ position: 'relative', aspectRatio: '3 / 4', background: 'var(--color-surface)', overflow: 'hidden' }}>
                <img src={c.img} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.9s cubic-bezier(.2,.7,.3,1)' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(44,35,32,0.4), transparent 50%)' }} />
                <div style={{ position: 'absolute', bottom: mobile ? 16 : 24, left: mobile ? 16 : 24, right: mobile ? 16 : 24 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: mobile ? 26 : 34, color: 'var(--color-bg)', fontWeight: 400, lineHeight: 1 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-bg)', opacity: 0.85, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 6 }}>{c.count} peças</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial feature — large product */}
      <section style={{ background: 'var(--color-surface-2)', padding: mobile ? '44px 22px' : '88px 64px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: mobile ? 24 : 72, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <img src="assets/emerald-clover-earring-model.png" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 20, right: 20, background: 'var(--color-bg)', padding: '14px 18px', maxWidth: 240 }}>
              <div className="az-eyebrow" style={{ color: 'var(--color-sage-dark)', marginBottom: 6 }}>cápsula primavera</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, lineHeight: 1.3 }}>Edição limitada de 200 peças numeradas.</div>
            </div>
          </div>
          <div style={{ padding: mobile ? '0' : '0 20px' }}>
            <div className="az-eyebrow" style={{ marginBottom: 20 }}>✿ coleção trevo</div>
            <h2 className="az-display" style={{ fontSize: mobile ? 44 : 72, margin: '0 0 24px', lineHeight: 1 }}>
              Verde como<br/><em className="az-display-italic" style={{ color: 'var(--color-sage-dark)' }}>um bom presságio</em>
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.8, maxWidth: 440, marginBottom: 28 }}>
              Quartzos verdes com lapidação coração, montados um a um em prata 925. Uma cápsula que celebra a intuição feminina — aquele instinto que sussurra antes mesmo da certeza chegar.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="az-btn az-btn-primary" onClick={() => onNav?.('pdp', 'emerald-clover')}>Ver a cápsula <IconArrowRight s={14} /></button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="az-price" style={{ fontSize: 16 }}>a partir de R$ 279,00</span>
                <span style={{ fontSize: 10.5, color: 'var(--color-text-light)', letterSpacing: '0.08em' }}>6x sem juros</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New arrivals carousel */}
      <ProductGridSection
        mobile={mobile}
        eyebrow="recém chegadas"
        title={<>Novas peças, <em className="az-display-italic">velhos encantos</em></>}
        subtitle="As chegadas desta semana, escolhidas para quem gosta de ser a primeira a notar."
        products={newArrivals}
        onClick={(p) => onNav?.('pdp', p.id)}
      />

      {/* Brand story */}
      <section style={{ background: 'var(--color-text)', color: 'var(--color-text-on-dark)', padding: mobile ? '56px 22px' : '104px 64px', position: 'relative', overflow: 'hidden' }}>
        <div className="az-grain" />
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <ArizLogoMark size={mobile ? 52 : 72} color="var(--color-sage-light)" stroke={1.1} />
          <div className="az-eyebrow" style={{ color: 'var(--color-sage-light)', marginTop: 28, marginBottom: 22 }}>desde 2019</div>
          <h2 className="az-display" style={{ fontSize: mobile ? 32 : 52, margin: 0, fontWeight: 300, color: 'var(--color-bg)', lineHeight: 1.1 }}>
            A casa Ariz nasceu de um desejo simples —<br/>
            <em className="az-display-italic" style={{ color: 'var(--color-primary)' }}>que joia fosse um gesto,</em>
            <br/>não uma vitrine.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(253,250,248,0.7)', lineHeight: 1.9, maxWidth: 520, margin: '32px auto 36px', fontWeight: 300 }}>
            Trabalhamos exclusivamente com prata 925 certificada e pedras selecionadas à mão. Cada peça passa por nove etapas de acabamento no nosso atelier em São Paulo — porque a delicadeza do produto final só aparece quando cada detalhe invisível foi pensado com cuidado.
          </p>
          <button className="az-btn az-btn-ghost" style={{ borderColor: 'var(--color-primary-light)', color: 'var(--color-bg)' }}>Nosso manifesto</button>
        </div>
      </section>

      {/* Best sellers */}
      <ProductGridSection
        mobile={mobile}
        eyebrow="mais amadas"
        title={<>Aquelas que <em className="az-display-italic">não voltam</em> para a vitrine</>}
        subtitle="Escolhidas pelas nossas clientes semana após semana."
        products={bestSellers}
        onClick={(p) => onNav?.('pdp', p.id)}
      />

      {/* Values / trust */}
      <section style={{ padding: mobile ? '40px 22px' : '64px 48px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-primary)', borderBottom: '1px solid var(--color-primary)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: mobile ? 28 : 24 }}>
          {[
            { icon: <IconShip s={24} />, title: 'Entrega cuidada', text: 'Em até 3 dias úteis, em caixa assinatura.' },
            { icon: <IconShield s={24} />, title: 'Garantia vitalícia', text: 'Contra defeito de fabricação, sempre.' },
            { icon: <IconBox s={24} />, title: 'Embalagem presente', text: 'Cartão escrito à mão, cortesia da casa.' },
            { icon: <IconHeart s={24} />, title: 'Trocas em 30 dias', text: 'Sem perguntas, sem burocracia.' },
          ].map(v => (
            <div key={v.title} style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: mobile ? 'flex-start' : 'center', textAlign: mobile ? 'left' : 'center', color: 'var(--color-sage-dark)' }}>
              {v.icon}
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--color-text)', fontWeight: 400 }}>{v.title}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{v.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram feed */}
      <section style={{ padding: mobile ? '40px 22px 56px' : '80px 48px 96px', textAlign: 'center' }}>
        <div className="az-eyebrow" style={{ marginBottom: 10 }}>@arizjoias</div>
        <h3 className="az-display" style={{ fontSize: mobile ? 28 : 40, margin: '0 0 36px' }}>
          Nossa comunidade, <em className="az-display-italic">nosso espelho</em>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: mobile ? 4 : 8 }}>
          {['assets/flower-pendant-set-model.png','assets/set-heart-necklace.png','assets/silver-drop-bracelet.png','assets/earring-crystal-hoop.png','assets/pearl-infinity-bracelet.png','assets/butterfly-ring.png'].map((src, i) => (
            <div key={i} style={{ aspectRatio: '1/1', overflow: 'hidden', position: 'relative', cursor: 'pointer', background: 'var(--color-surface)' }}>
              <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Hero variants ─── */
function HeroSection({ mobile, variant, onNav }) {
  if (variant === 'wordmark') {
    return (
      <section style={{ background: 'var(--color-primary)', padding: mobile ? '80px 22px 64px' : '120px 64px 96px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="az-grain" />
        <div className="az-reveal" style={{ position: 'relative' }}>
          <ArizLogoMark size={mobile ? 44 : 64} />
          <h1 className="az-display" style={{ fontSize: mobile ? 60 : 140, margin: '24px 0 0', fontWeight: 300, letterSpacing: '0.08em', lineHeight: 0.9, color: 'var(--color-text)' }}>
            <em className="az-display-italic">leveza</em>
          </h1>
          <h1 className="az-display" style={{ fontSize: mobile ? 60 : 140, margin: 0, fontWeight: 300, letterSpacing: '0.08em', lineHeight: 1, color: 'var(--color-sage-dark)' }}>&amp; alma</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 36, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
            Coleção primavera / verão 2026 — joias em prata 925 lapidadas à mão em nosso atelier.
          </p>
          <button className="az-btn az-btn-primary" style={{ marginTop: 28 }} onClick={() => onNav?.('plp', 'Lançamentos')}>Ver a coleção <IconArrowRight s={14} /></button>
        </div>
      </section>
    );
  }

  if (variant === 'mosaic') {
    return (
      <section style={{ padding: mobile ? '24px 22px' : '36px 48px', background: 'var(--color-bg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1.2fr 1fr', gap: mobile ? 14 : 20, alignItems: 'stretch' }}>
          <div style={{ position: 'relative', aspectRatio: mobile ? '4/5' : '4/5', background: 'var(--color-primary)', overflow: 'hidden' }}>
            <img src="assets/set-heart-necklace.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, padding: mobile ? 24 : 48, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: 'var(--color-bg)', background: 'linear-gradient(to top, rgba(44,35,32,0.5), transparent 60%)' }}>
              <div className="az-eyebrow" style={{ color: 'var(--color-primary)' }}>primavera 2026</div>
              <h1 className="az-display" style={{ fontSize: mobile ? 48 : 82, fontWeight: 300, margin: '10px 0 0', lineHeight: 0.95 }}>
                Leveza<br/><em className="az-display-italic">que se veste</em>
              </h1>
              <button className="az-btn az-btn-ghost" style={{ marginTop: 24, alignSelf: 'flex-start', borderColor: 'var(--color-bg)', color: 'var(--color-bg)' }}>Ver a coleção <IconArrowRight s={14} /></button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: mobile ? 14 : 20 }}>
            <div style={{ background: 'var(--color-surface-2)', position: 'relative', overflow: 'hidden' }}>
              <img src="assets/earring-crystal-hoop.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ background: 'var(--color-sage-pale)', padding: mobile ? 24 : 36, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="az-eyebrow" style={{ color: 'var(--color-sage-dark)' }}>cápsula trevo</div>
              <h3 className="az-display" style={{ fontSize: mobile ? 26 : 34, margin: '8px 0 14px', fontWeight: 300 }}><em className="az-display-italic">Verde</em> como um bom presságio</h3>
              <button className="az-btn-link" style={{ alignSelf: 'flex-start' }}>Descobrir</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // default: split editorial
  return (
    <section style={{ background: 'var(--color-bg)', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1.1fr', minHeight: mobile ? 'auto' : 'calc(100vh - 120px)' }}>
        <div style={{ padding: mobile ? '48px 22px 32px' : '72px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div className="az-reveal">
            <div className="az-eyebrow" style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 28, height: 1, background: 'var(--color-sage)' }} />
              coleção primavera 2026
            </div>
            <h1 className="az-display" style={{ fontSize: mobile ? 58 : 104, fontWeight: 300, margin: 0, lineHeight: 0.92, color: 'var(--color-text)' }}>
              Joias com<br/>
              <em className="az-display-italic" style={{ color: 'var(--color-sage-dark)' }}>leveza</em>
              <br/>
              &amp; alma
            </h1>
            <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.75, maxWidth: 440, marginTop: 32, fontWeight: 300 }}>
              Peças em prata 925 desenhadas para acompanhar mulheres que sentem — porque um bom gesto nunca pede licença para existir.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 36, flexWrap: 'wrap' }}>
              <button className="az-btn az-btn-primary" onClick={() => onNav?.('plp', 'Lançamentos')}>Explorar coleção <IconArrowRight s={14} /></button>
              <button className="az-btn az-btn-ghost">Nossa história</button>
            </div>
            <div style={{ display: 'flex', gap: mobile ? 20 : 40, marginTop: mobile ? 40 : 80, paddingTop: 32, borderTop: '1px solid var(--color-primary)' }}>
              <div><div className="az-display" style={{ fontSize: 26, color: 'var(--color-sage-dark)' }}>925</div><div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>prata certificada</div></div>
              <div><div className="az-display" style={{ fontSize: 26, color: 'var(--color-sage-dark)' }}>9</div><div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>etapas de acabamento</div></div>
              <div><div className="az-display" style={{ fontSize: 26, color: 'var(--color-sage-dark)' }}>∞</div><div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>garantia vitalícia</div></div>
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', minHeight: mobile ? 380 : 'auto', background: 'var(--color-primary)' }}>
          <img src="assets/flower-pendant-set-model.png" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          {/* floating product card */}
          {!mobile && (
            <div style={{ position: 'absolute', bottom: 40, left: 40, background: 'var(--color-bg)', padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'center', maxWidth: 320, boxShadow: 'var(--shadow-md)' }}>
              <div style={{ width: 54, height: 64, background: 'var(--color-surface)', flexShrink: 0, overflow: 'hidden' }}>
                <img src="assets/flower-pendant-set.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-light)' }}>em destaque</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginTop: 2 }}>Conjunto Flor de Cristal</div>
                <div className="az-price" style={{ fontSize: 12, marginTop: 2 }}>R$ 389,00</div>
              </div>
              <button style={{ background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <IconArrowRight s={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProductGridSection({ mobile, eyebrow, title, subtitle, products, onClick }) {
  return (
    <section style={{ padding: mobile ? '52px 22px' : '96px 48px', background: 'var(--color-bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: mobile ? 28 : 48, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div className="az-eyebrow" style={{ marginBottom: 12 }}>{eyebrow}</div>
          <h2 className="az-display" style={{ fontSize: mobile ? 34 : 52, margin: 0, fontWeight: 300, lineHeight: 1.05 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 12, maxWidth: 460 }}>{subtitle}</p>}
        </div>
        {!mobile && <button className="az-btn-link">Ver todas <IconArrowRight s={12} /></button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: mobile ? 14 : 28 }}>
        {products.map((p, i) => (
          <div key={p.id} className="az-reveal" style={{ animationDelay: `${i * 0.06}s` }}>
            <ProductCard product={p} onClick={() => onClick?.(p)} />
          </div>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { HomePage, HeroSection, ProductGridSection });
