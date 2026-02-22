import Link from "next/link";
import { redirect } from "next/navigation";
import { formatUsd, getAllProducts } from "@/lib/products";
import { hasStoreAccess } from "@/lib/store-access";

export default async function CollectionPage() {
  if (!(await hasStoreAccess())) {
    redirect("/");
  }

  const products = getAllProducts();

  return (
    <section className="container page-shell">
      <h1 className="section-title">All Products</h1>
      <div className="product-grid">
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
      </div>
    </section>
  );
}
