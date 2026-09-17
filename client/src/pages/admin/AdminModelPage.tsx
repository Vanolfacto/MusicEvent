import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../lib/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminModelPage() {
  const queryClient = useQueryClient();
  const [isTraining, setIsTraining] = useState(false);
  const { data: info, isLoading } = useQuery({
    queryKey: ['model', 'info'],
    queryFn: async () => (await api.get('/model/info')).data.data,
  });
  const { data: runs } = useQuery({
    queryKey: ['model', 'runs'],
    queryFn: async () => (await api.get('/model/training-runs')).data.data,
  });

  const retrainMutation = useMutation({
    mutationFn: async () => {
      setIsTraining(true);
      return api.post('/model/train');
    },
    onSuccess: () => {
      toast.success('Model je uspešno ponovo obučen');
      queryClient.invalidateQueries({ queryKey: ['model'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
    onSettled: () => setIsTraining(false),
  });

  if (isLoading) return <LoadingSpinner />;

  const trainingDate = info?.trainingDate
    ? new Date(info.trainingDate).toLocaleString('sr-Latn-RS')
    : null;

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
        <p><span className="text-slate-400">Verzija:</span> <span className="text-white">{info?.modelVersion}</span></p>
        <p><span className="text-slate-400">Algoritam:</span> <span className="text-white">{info?.algorithm}</span></p>
        <p>
          <span className="text-slate-400">Poslednje treniranje:</span>{' '}
          <span className="text-white">{trainingDate || 'nepoznato'}</span>
        </p>
        <p className="text-slate-400">{info?.notes}</p>
        <button
          type="button"
          onClick={() => retrainMutation.mutate()}
          disabled={isTraining}
          className="btn-primary mt-2"
        >
          {isTraining ? 'Treniranje u toku (može potrajati)...' : 'Ponovo treniraj model'}
        </button>
      </div>
      {metrics.length > 0 && (
        <div className="card h-72">
          <h3 className="mb-4 font-semibold text-white">Metrike modela (%)</h3>
          <div aria-hidden="true" style={{ height: '90%' }}>
            <ResponsiveContainer width="100%" height="100%">
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
          <table className="sr-only">
            <caption>Metrike modela u procentima</caption>
            <thead>
              <tr><th scope="col">Metrika</th><th scope="col">Vrednost</th></tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.name}><th scope="row">{m.name}</th><td>{m.value}%</td></tr>
              ))}
            </tbody>
          </table>
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
