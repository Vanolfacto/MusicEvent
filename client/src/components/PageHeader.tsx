interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-2 text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
