import { useQuery } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import api from '../../lib/api';
import type { ApiResponse, EventItem, Paginated, Performance } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function OrganizerSchedulePage() {
  const { data: events } = useQuery({
    queryKey: ['organizer', 'events'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Paginated<EventItem>>>('/events/mine');
      return res.data.data.items;
    },
  });

  const eventIds = (events || []).map((e) => e.id);

  const { data: performances, isLoading } = useQuery({
    queryKey: ['performances', eventIds],
    enabled: eventIds.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        eventIds.map((eventId) =>
          api.get<ApiResponse<Performance[]>>(`/performances/event/${eventId}`),
        ),
      );
      return results.flatMap((res) => res.data.data);
    },
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
