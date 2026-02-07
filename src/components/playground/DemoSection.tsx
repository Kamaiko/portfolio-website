/** Reusable wrapper for playground demo sections */
export default function DemoSection({
  title,
  number,
  description,
  children,
}: {
  title: string;
  number: number;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="mb-6">
        <span className="text-xs font-mono text-cyan-400/60">
          Demo {number}
        </span>
        <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      {children}
    </section>
  );
}
