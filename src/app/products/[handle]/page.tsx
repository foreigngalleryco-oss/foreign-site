import { notFound, redirect } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatUsd, getProductByHandle } from "@/lib/products";
import { hasStoreAccess } from "@/lib/store-access";

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  if (!(await hasStoreAccess())) {
    redirect("/");
  }

  const product = getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  return (
    <section className="container page-shell product-shell">
      <div className={`product-art product-art-large ${product.artClass}`} aria-hidden="true" />
      <article className="product-detail">
        {product.badge ? <p className="badge">{product.badge}</p> : null}
        <h1>{product.title}</h1>
        <p className="product-subtitle">{product.subtitle}</p>
        <p className="price-line">{formatUsd(product.priceCents)}</p>
        <p>{product.description}</p>
        <ul>
          {product.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
        <AddToCartButton
          handle={product.handle}
          title={product.title}
          subtitle={product.subtitle}
          priceCents={product.priceCents}
        />
      </article>
    </section>
  );
}
