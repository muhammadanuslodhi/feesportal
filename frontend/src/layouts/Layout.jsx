import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';

export default function Layout() {
  const { username, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDark(document.documentElement.classList.contains('dark'));
  };

  const handleLogout = () => { logout(); nav('/login'); };

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/areas', label: 'Areas' },
    { to: '/members', label: 'Members' },
    { to: '/reports', label: 'Reports' },
  ];

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-brand-600 text-white grid place-items-center font-bold">F</div>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">Fees Portal</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end
                className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                {l.label}
              </NavLink>
            ))}
            <button onClick={toggleDark} className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">{dark ? '☀️' : '🌙'}</button>
            <span className="text-sm text-gray-500 ml-2">Hi, {username}</span>
            <button onClick={handleLogout} className="btn-danger ml-2">Logout</button>
          </nav>
          <button className="md:hidden p-2" onClick={() => setOpen(o => !o)}>☰</button>
        </div>
        {open && (
          <div className="md:hidden border-t bg-white dark:bg-gray-800 px-4 py-2 space-y-1">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200">
                {l.label}
              </NavLink>
            ))}
            <button onClick={toggleDark} className="block w-full text-left px-3 py-2 text-sm">Toggle theme</button>
            <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-600">Logout</button>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t mt-10">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          Fees Portal Management System &middot; © 2026 All Rights Reserved
        </div>
      </footer>
    </div>
  );
}
