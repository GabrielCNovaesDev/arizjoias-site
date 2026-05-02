export default function PedidoPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
      <h1 className="font-display text-4xl font-light" style={{ color: 'var(--charcoal)' }}>
        Pedido #{params.id}
      </h1>
      <p className="font-body text-sm mt-4 opacity-60">Em breve — implementado na Sprint 4.</p>
    </div>
  );
}
