import { StoreGate } from "@/components/StoreGate";
import { formatUsd, getAllProducts } from "@/lib/products";
import { hasStoreAccess } from "@/lib/store-access";

export default async function HomePage() {
  const unlocked = await hasStoreAccess();

  if (!unlocked) {
    return <StoreGate />;
  }

  const products = getAllProducts();

  return (
    <div className="store-shell">
      <section className="container home-intro">
        <p className="gate-kicker">Welcome to foreigngallery.co</p>
        <p className="gate-kicker">Store Open</p>
        <h1>New drop is live.</h1>
        <p>Limited pieces available now.</p>
      </section>

      <section className="container product-grid">
        {products.map((product) => (
          <article key={product.handle} className="product-card">
            <div className={`product-art ${product.artClass}`} aria-hidden="true" />
            <p className="product-subtitle">{product.subtitle}</p>
            <h2>{product.title}</h2>
            <p>{formatUsd(product.priceCents)}</p>
            <Link href={`/products/${product.handle}`} className="text-link">
              View Product
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
