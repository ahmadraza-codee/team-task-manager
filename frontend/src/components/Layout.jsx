
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { initials } from '../lib/format';

const linkCls = ({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`;
export default function Layout() {
  const { user, logout } = useAuth();
  const { openCreateTask } = useUI();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState('');
  const doLogout = async () => { await logout(); nav('/login'); };
  const submitSearch = (e) => { e.preventDefault(); nav(`/tasks?search=${encodeURIComponent(q)}`); };
  const Sidebar = (
    <div className="flex flex-col h-full">
      <Link to="/" className="font-bold text-xl text-indigo-700 px-3 py-4">Team Task Manager</Link>
      <nav className="space-y-1 px-2 flex-1">
        <NavLink to="/" end className={linkCls} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
        <NavLink to="/my-tasks" className={linkCls} onClick={() => setMenuOpen(false)}>My Tasks</NavLink>
        <NavLink to="/tasks" className={linkCls} onClick={() => setMenuOpen(false)}>All Tasks</NavLink>
        <NavLink to="/teams" className={linkCls} onClick={() => setMenuOpen(false)}>Teams</NavLink>
        <NavLink to="/profile" className={linkCls} onClick={() => setMenuOpen(false)}>Profile</NavLink>
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">{initials(user?.name)}</span>
          <div className="min-w-0"><p className="text-sm font-medium truncate">{user?.name}</p><p className="text-xs text-slate-500 truncate">{user?.email}</p></div>
        </div>
        <button className="btn-secondary w-full !py-1.5 text-sm" onClick={doLogout}>Logout</button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px,1fr]">
      <aside className="hidden lg:block bg-white border-r sticky top-0 h-screen">{Sidebar}</aside>
      {menuOpen && <div className="fixed inset-0 z-40 flex lg:hidden"><div className="bg-white w-64 h-full shadow-xl">{Sidebar}</div><div className="flex-1 bg-black/40" onClick={() => setMenuOpen(false)} /></div>}
      <div className="min-w-0">
        <header className="bg-white border-b sticky top-0 z-20">
          <div className="px-4 py-3 flex items-center gap-3">
            <button className="lg:hidden btn-secondary !px-2.5 !py-1.5" onClick={() => setMenuOpen(true)} aria-label="Menu">☰</button>
            <div className="min-w-0"><h1 className="font-semibold truncate">Welcome back, {user?.name}</h1><p className="text-xs text-slate-500 hidden sm:block">Here is what is happening with your teams today.</p></div>
            <form onSubmit={submitSearch} className="ml-auto hidden md:block w-64"><input className="input !py-1.5" placeholder="Search tasks..." value={q} onChange={e => setQ(e.target.value)} /></form>
            <button className="btn !py-1.5 shrink-0" onClick={() => openCreateTask()}>+ Create Task</button>
            <Link to="/profile" className="w-9 h-9 rounded-full bg-indigo-600 text-white hidden sm:flex items-center justify-center text-xs font-bold shrink-0">{initials(user?.name)}</Link>
          </div>
          <form onSubmit={submitSearch} className="px-4 pb-3 md:hidden"><input className="input !py-1.5" placeholder="Search tasks..." value={q} onChange={e => setQ(e.target.value)} /></form>
        </header>
        <main className="p-4 max-w-7xl mx-auto w-full"><Outlet /></main>
      </div>
    </div>
  );
}
