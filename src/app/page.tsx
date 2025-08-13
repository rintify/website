// app/page.tsx
'use client'

const IndexPage: React.FC = () => {
  const theme = {
    bg: '#0000',
    card: '#0000',
    text: '#000',
    sub: '#000',
    accent: '#000',
    line: '#000',
  }

  const sectionStyle: React.CSSProperties = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '64px 24px',
  }

  const h2Style: React.CSSProperties = {
    fontSize: 28,
    margin: '0 0 24px',
    color: theme.text,
    letterSpacing: 0.5,
  }

  const cardStyle: React.CSSProperties = {
    background: theme.card,
    border: `1px solid ${theme.line}`,
    borderRadius: 16,
    overflow: 'hidden',
  }

  const badge: React.CSSProperties = {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: 999,
    background: 'rgba(70,179,255,0.14)',
    color: theme.accent,
    fontSize: 12,
    border: `1px solid rgba(70,179,255,0.35)`,
  }

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif",
        background: theme.bg,
        color: theme.text,
        lineHeight: 1.6,
      }}
    >
      {/* ── Hero */}
      <section style={{ ...sectionStyle, paddingTop: 72 }}>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'stretch' }}>
          <div style={{ flex: '1 1 420px', minWidth: 320 }}>
            <h1 style={{ fontSize: 44, margin: '16px 0 12px' }}>
              プロダクトを「速く、美しく」届ける
              <br />
              フロントエンドエンジニア
            </h1>
            <p style={{ color: theme.sub, margin: '8px 0 22px' }}>
              Next.js / TypeScript
              を中心に、UI設計から実装・パフォーマンス最適化まで。デザインとコードの「いい感じ」の交差点を探ります。
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href='#work'
                style={{
                  padding: '12px 18px',
                  borderRadius: 12,
                  background: theme.accent,
                  color: '#00111a',
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                作品を見る
              </a>
              <a
                href='#contact'
                style={{
                  padding: '12px 18px',
                  borderRadius: 12,
                  background: 'transparent',
                  color: theme.text,
                  textDecoration: 'none',
                  border: `1px solid ${theme.line}`,
                }}
              >
                相談する
              </a>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 22, color: theme.sub, fontSize: 12 }}>
              <span>Next.js</span>•<span>TypeScript</span>•<span>UI/UX</span>•<span>Perf</span>
            </div>
          </div>

          {/* ヒーロー画像コラージュ */}
          <div style={{ flex: '1 1 420px', minWidth: 320, display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ ...cardStyle, height: 220 }}>
              <img
                alt='モダンUIのイメージ'
                src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop'
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ ...cardStyle, height: 220 }}>
              <img
                alt='デベロッパーのワークスペース'
                src='https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1200&auto=format&fit=crop'
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ ...cardStyle, height: 140 }}>
              <img
                alt='コードのスクリーン'
                src='https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop'
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ ...cardStyle, height: 140 }}>
              <img
                alt='カラーパレット'
                src='https://images.unsplash.com/photo-1587614382346-4ec70e388b28?q=80&w=1200&auto=format&fit=crop'
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Works */}
      <section id='work' style={{ ...sectionStyle }}>
        <h2 style={h2Style}>Selected Works</h2>
        <p style={{ color: theme.sub, margin: '0 0 18px' }}>
          個人・チーム案件から抜粋。サムネイルはフリー素材（Unsplash/Pexels/Picsum）を使用しています。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
          {[
            {
              title: 'SaaS ダッシュボード',
              img: 'https://images.unsplash.com/photo-1551281044-8a5d2a599f8b?q=80&w=1200&auto=format&fit=crop',
              tags: ['Next.js', 'Charts', 'A11y'],
            },
            {
              title: 'EC プロダクトLP',
              img: 'https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?q=80&w=1200&auto=format&fit=crop',
              tags: ['Landing', 'SEO', 'Perf'],
            },
            {
              title: '写真ギャラリー',
              img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
              tags: ['Masonry', 'Lightbox'],
            },
            {
              title: 'モバイルアプリ連携',
              img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop',
              tags: ['API', 'Auth'],
            },
            {
              title: 'ブランドサイト',
              img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1200&auto=format&fit=crop',
              tags: ['Design', 'Animation'],
            },
            {
              title: 'メディア・ブログ',
              img: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1200&auto=format&fit=crop',
              tags: ['MDX', 'OGP'],
            },
          ].map(w => (
            <article key={w.title} style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 180, overflow: 'hidden' }}>
                <img
                  src={w.img}
                  alt={w.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform .4s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
              <div style={{ padding: 16, borderTop: `1px solid ${theme.line}` }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{w.title}</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {w.tags.map(t => (
                    <span
                      key={t}
                      style={{ ...badge, background: 'transparent', borderColor: theme.line, color: theme.sub }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── About */}
      <section id='about' style={{ ...sectionStyle }}>
        <h2 style={h2Style}>About Rin</h2>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div
            style={{ ...cardStyle, width: 220, height: 220, borderRadius: 999, overflow: 'hidden', flex: '0 0 auto' }}
          >
            <img
              alt='Rin のプロフィール画像（フリー素材）'
              src='https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1200'
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ flex: '1 1 420px', minWidth: 300 }}>
            <p style={{ color: theme.sub, margin: 0 }}>
              Web制作会社・自社開発での経験を経て、現在はフロントエンド領域を中心に活動。アクセシビリティとパフォーマンスを両立するUIを素早く実装するのが得意です。
              小さな改善の積み上げと、綺麗なコンポーネント設計が好き。
            </p>
            <ul style={{ margin: '14px 0 0', paddingLeft: 18, color: theme.sub }}>
              <li>得意：Next.js / TypeScript / React / API連携 / SSR & SSG / 画像最適化</li>
              <li>趣味：写真・コーヒー・ガジェット</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Skills */}
      <section id='skills' style={{ ...sectionStyle }}>
        <h2 style={h2Style}>Skills</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {[
            {
              title: 'Frontend',
              points: ['React / Next.js', 'TypeScript', '状態管理 / フォーム', 'アクセシビリティ'],
              img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
            },
            {
              title: 'UI/UX',
              points: ['コンポーネント設計', '情報設計', 'モーション設計', 'デザイン連携'],
              img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
            },
            {
              title: 'Performance',
              points: ['画像/フォント最適化', 'Lighthouse/CLS', 'SSRキャッシュ', '計測と改善'],
              img: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1200&auto=format&fit=crop',
            },
            {
              title: 'Ops',
              points: ['CI/CD', 'Vercel/Cloud', '監視/ロギング', 'セキュリティベーシック'],
              img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
            },
          ].map(s => (
            <div key={s.title} style={{ ...cardStyle }}>
              <div style={{ height: 120, overflow: 'hidden' }}>
                <img
                  alt={`${s.title} イメージ`}
                  src={s.img}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{s.title}</h3>
                <ul style={{ margin: 0, paddingLeft: 18, color: theme.sub }}>
                  {s.points.map(p => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gallery（画像多め） */}
      <section style={{ ...sectionStyle }}>
        <h2 style={h2Style}>Visual Gallery</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
          {[
            'https://picsum.photos/id/1015/800/600',
            'https://picsum.photos/id/1025/800/600',
            'https://picsum.photos/id/1035/800/600',
            'https://picsum.photos/id/1041/800/600',
            'https://picsum.photos/id/1050/800/600',
            'https://picsum.photos/id/1069/800/600',
            'https://picsum.photos/id/1074/800/600',
            'https://picsum.photos/id/1084/800/600',
            'https://picsum.photos/id/1080/800/600',
            'https://picsum.photos/id/1060/800/600',
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?q=80&w=1200&auto=format&fit=crop',
          ].map((src, i) => (
            <div key={src} style={{ ...cardStyle, height: 160 }}>
              <img
                src={src}
                alt={`ギャラリーイメージ ${i + 1}`}
                loading='lazy'
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact */}
      <section id='contact' style={{ ...sectionStyle }}>
        <h2 style={h2Style}>Contact</h2>
        <div style={{ ...cardStyle, padding: 18 }}>
          <p style={{ color: theme.sub, marginTop: 0 }}>
            相談やご依頼はお気軽に。件名に「ポートフォリオ経由」と添えていただけると助かります。
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a
              href='mailto:hello@example.com'
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid ${theme.line}`,
                color: theme.text,
                textDecoration: 'none',
              }}
            >
              hello@example.com
            </a>
            <a
              href='https://github.com/yourname'
              target='_blank'
              rel='noreferrer'
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid ${theme.line}`,
                color: theme.text,
                textDecoration: 'none',
              }}
            >
              GitHub
            </a>
            <a
              href='https://www.linkedin.com/in/yourname'
              target='_blank'
              rel='noreferrer'
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid ${theme.line}`,
                color: theme.text,
                textDecoration: 'none',
              }}
            >
              LinkedIn
            </a>
          </div>
        </div>
        <p style={{ color: theme.sub, fontSize: 12, marginTop: 10 }}>
          画像出典：Unsplash / Pexels / Picsum（各ライセンスに基づき使用）
        </p>
      </section>

      {/* ── Footer */}
      <footer
        style={{ borderTop: `1px solid ${theme.line}`, padding: '20px 24px', color: theme.sub, textAlign: 'center' }}
      >
        © {new Date().getFullYear()} Rin. All rights reserved.
      </footer>
    </div>
  )
}

export default IndexPage
