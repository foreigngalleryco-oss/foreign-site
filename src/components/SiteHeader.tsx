import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-content">
        <nav className="side-nav" aria-label="Main sections">
          <Link href="/foundation">Foundation</Link>
        </nav>

        <Link href="/" className="brand" aria-label="FOREIGN home">
          FOREIGN
        </Link>

        <div className="side-nav side-nav-right" />
      </div>
    </header>
  );
}
