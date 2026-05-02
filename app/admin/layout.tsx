// Layout do painel admin — sem header/footer da loja
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <main>{children}</main>
    </div>
  );
}
