import { Header } from '@/components/shop/header';
import { Footer } from '@/components/shop/footer';

// Layout da loja — header e footer aparecem apenas nas rotas da (shop) e /conta
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
