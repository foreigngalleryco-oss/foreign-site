import Link from "next/link";

const footerBottomLinks = [
  { href: "/shipping", label: "Shipping" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" }
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <p>ALL SALES ARE FINAL.</p>
      </div>
      <div className="container footer-bottom-line">
        {footerBottomLinks.map((item, index) => (
          <span key={item.href}>
            <Link href={item.href}>{item.label}</Link>
            {index < footerBottomLinks.length - 1 ? " / " : ""}
          </span>
        ))}
      </div>
    </footer>
  );
}
