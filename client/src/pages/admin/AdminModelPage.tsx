import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../lib/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminModelPage() {
  const queryClient = useQueryClient();
  const { data: info, isLoading } = useQuery({
    queryKey: ['model', 'info'],
    queryFn: async () => (await api.get('/model/info')).data.data,
  });
  const { data: runs } = useQuery({
    queryKey: ['model', 'runs'],
    queryFn: async () => (await api.get('/model/training-runs')).data.data,
  });

  // Training runs as a background task on the ML service — a single HTTP
  // request can't stay open long enough to wait for it (Render, like most
  // reverse proxies, kills long-idle connections well before the pipeline
  // finishes), so we kick it off and poll its status instead. Fetched on
  // every mount (not just after clicking the button) so reopening this page
  // while a training run is still going resumes polling automatically.
  const { data: status } = useQuery({
    queryKey: ['model', 'trainStatus'],
    queryFn: async () => (await api.get('/model/train/status')).data.data,
    refetchInterval: (query) => (query.state.data?.status === 'training' ? 8000 : false),
  });

  const isTraining = status?.status === 'training';
  const previousStatus = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!status || status.status === previousStatus.current) return;
    const wasTraining = previousStatus.current === 'training';
    previousStatus.current = status.status;
    if (!wasTraining) return;

    if (status.status === 'done') {
      toast.success('Model je uspešno ponovo obučen');
      queryClient.invalidateQueries({ queryKey: ['model', 'info'] });
      queryClient.invalidateQueries({ queryKey: ['model', 'runs'] });
    } else if (status.status === 'error') {
      toast.error(status.error || 'Treniranje nije uspelo');
    }
  }, [status, queryClient]);

  const retrainMutation = useMutation({
    mutationFn: () => api.post('/model/train'),
    onSuccess: () => {
      previousStatus.current = 'training';
      queryClient.invalidateQueries({ queryKey: ['model', 'trainStatus'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
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
          disabled={isTraining || retrainMutation.isPending}
          className="btn-primary mt-2"
        >
          {isTraining ? 'Treniranje u toku (nekoliko minuta)...' : 'Ponovo treniraj model'}
        </button>
        {isTraining && (
          <p className="text-xs text-slate-400" role="status">
            Ova strana provera status na svakih 8 sekundi — možeš i da je zatvoriš, trening se
            nastavlja u pozadini.
          </p>
        )}
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
