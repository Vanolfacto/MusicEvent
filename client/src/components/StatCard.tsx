interface Props {
  label: string;
  value: string | number;
  hint?: string;
}

export default function StatCard({ label, value, hint }: Props) {
  return (
    <div className="card">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
