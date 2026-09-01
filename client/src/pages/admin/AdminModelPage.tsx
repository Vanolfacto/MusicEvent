import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminModelPage() {
  const { data: info, isLoading } = useQuery({
    queryKey: ['model', 'info'],
    queryFn: async () => (await api.get('/model/info')).data.data,
  });
  const { data: runs } = useQuery({
    queryKey: ['model', 'runs'],
    queryFn: async () => (await api.get('/model/training-runs')).data.data,
  });

  if (isLoading) return <LoadingSpinner />;

  const metrics = info?.metrics
    ? Object.entries(info.metrics as Record<string, number>).map(([name, value]) => ({
        name,
        value: Number((value * 100).toFixed(1)),
      }))
    : [];

  return (
    <div>
      <PageHeader title="ML model" subtitle="Verzija, metrike i istorija treniranja" />
      <div className="card mb-6 space-y-2 text-sm">
        <p><span className="text-slate-500">Verzija:</span> <span className="text-white">{info?.modelVersion}</span></p>
        <p><span className="text-slate-500">Algoritam:</span> <span className="text-white">{info?.algorithm}</span></p>
        <p className="text-slate-400">{info?.notes}</p>
      </div>
      {metrics.length > 0 && (
        <div className="card h-72">
          <h3 className="mb-4 font-semibold text-white">Metrike modela (%)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={metrics}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#c4b5fd' }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {runs?.length > 0 && (
        <div className="card mt-6">
          <h3 className="mb-4 font-semibold text-white">Istorija treniranja</h3>
          <p className="text-sm text-slate-300">Poslednji run: {runs[0].algorithm} — F1: {Number(runs[0].f1Score).toFixed(4)}</p>
        </div>
      )}
    </div>
  );
}
