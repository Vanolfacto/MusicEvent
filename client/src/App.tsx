import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import EventsPage from './pages/public/EventsPage';
import EventDetailPage from './pages/public/EventDetailPage';
import ArtistsPage from './pages/public/ArtistsPage';
import ArtistDetailPage from './pages/public/ArtistDetailPage';
import OrganizersPage from './pages/public/OrganizersPage';
import OrganizerDetailPage from './pages/public/OrganizerDetailPage';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerEventsPage from './pages/organizer/OrganizerEventsPage';
import OrganizerEventDetailPage from './pages/organizer/OrganizerEventDetailPage';
import OrganizerApplicationsPage from './pages/organizer/OrganizerApplicationsPage';
import EventFormPage from './pages/organizer/EventFormPage';
import RecommendationsPage from './pages/organizer/RecommendationsPage';
import OrganizerSchedulePage from './pages/organizer/OrganizerSchedulePage';
import OrganizerProfilePage from './pages/organizer/OrganizerProfilePage';
import ArtistDashboard from './pages/artist/ArtistDashboard';
import ArtistEventsPage from './pages/artist/ArtistEventsPage';
import ArtistApplicationsPage from './pages/artist/ArtistApplicationsPage';
import ArtistMyEventsPage from './pages/artist/ArtistMyEventsPage';
import ArtistProfilePage from './pages/artist/ArtistProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminModelPage from './pages/admin/AdminModelPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/artists" element={<ArtistsPage />} />
        <Route path="/artists/:id" element={<ArtistDetailPage />} />
        <Route path="/organizers" element={<OrganizersPage />} />
        <Route path="/organizers/:id" element={<OrganizerDetailPage />} />

        <Route
          path="/organizer"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <OrganizerEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/new"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <EventFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/:id"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <OrganizerEventDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/:id/edit"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <EventFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/:eventId/recommendations"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <RecommendationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/applications"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <OrganizerApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/schedule"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <OrganizerSchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/profile"
          element={
            <ProtectedRoute roles={['ORGANIZER']}>
              <OrganizerProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/artist"
          element={
            <ProtectedRoute roles={['ARTIST']}>
              <ArtistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artist/events"
          element={
            <ProtectedRoute roles={['ARTIST']}>
              <ArtistEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artist/applications"
          element={
            <ProtectedRoute roles={['ARTIST']}>
              <ArtistApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artist/my-events"
          element={
            <ProtectedRoute roles={['ARTIST']}>
              <ArtistMyEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artist/profile"
          element={
            <ProtectedRoute roles={['ARTIST']}>
              <ArtistProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/model"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminModelPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
