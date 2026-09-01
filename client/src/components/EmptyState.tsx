interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="card flex flex-col items-center py-12 text-center">
      <div className="mb-4 text-4xl opacity-50">🎵</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
