import type { ReactNode } from "react";

export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  action?: ReactNode;
}) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <section className="page-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${base}${image}`} alt="" className="page-hero-image" />
      <div className="page-hero-scrim" />
      <div className="page-hero-content">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </section>
  );
}
