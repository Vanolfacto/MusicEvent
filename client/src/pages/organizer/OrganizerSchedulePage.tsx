import { useQuery } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import api from '../../lib/api';
import type { ApiResponse, Performance } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function OrganizerSchedulePage() {
  const { data: performances, isLoading } = useQuery({
    queryKey: ['performances', 'mine', 'organizer'],
    queryFn: async () =>
      (await api.get<ApiResponse<Performance[]>>('/performances/mine/organizer')).data.data,
  });

  const calendarEvents = (performances || []).map((p) => ({
    id: String(p.id),
    title: p.artist?.stageName || 'Nastup',
    start: p.startDateTime,
    end: p.endDateTime,
  }));

  return (
    <div>
      <PageHeader title="Raspored nastupa" subtitle="Kalendarski prikaz zakazanih nastupa" />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="card">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="timeGridWeek"
            events={calendarEvents}
            height="auto"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
          />
        </div>
      )}
    </div>
  );
}
