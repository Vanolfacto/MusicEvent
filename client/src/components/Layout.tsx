import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Preskoči na sadržaj
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 focus:outline-none">
        <Outlet />
      </main>
    </div>
  );
}
