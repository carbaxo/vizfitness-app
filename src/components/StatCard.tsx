export default function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "green" | "orange" | "blue";
}) {
  const color =
    accent === "orange"
      ? "text-cardio"
      : accent === "blue"
        ? "text-gym"
        : "text-accent";
  const dot =
    accent === "orange"
      ? "bg-cardio shadow-[0_0_12px] shadow-cardio/60"
      : accent === "blue"
        ? "bg-gym shadow-[0_0_12px] shadow-gym/60"
        : "bg-accent shadow-[0_0_12px] shadow-accent/60";

  return (
    <div className="card !p-4">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>
      <p className={`mt-2 text-[27px] font-bold leading-none tracking-tightest tabular-nums ${color}`}>
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
