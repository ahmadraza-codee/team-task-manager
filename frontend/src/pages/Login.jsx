
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await login(f); nav('/'); }
    catch (x) { setErr(x.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
      <p className="text-sm text-slate-500 mb-4">Login to your Team Task Manager account.</p>
      {err && <p className="bg-red-50 text-red-700 p-2 rounded mb-3 text-sm">{err}</p>}
      <form onSubmit={submit} className="space-y-3">
        <div><label className="text-sm font-medium">Email address</label><input className="input" type="email" placeholder="you@example.com" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
        <div><label className="text-sm font-medium">Password</label>
          <div className="relative"><input className="input pr-16" type={show ? 'text' : 'password'} placeholder="Password" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
          <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-indigo-600" onClick={() => setShow(s => !s)}>{show ? 'Hide' : 'Show'}</button></div>
        </div>
        <button className="btn w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p className="text-sm mt-4">No account? <Link className="text-indigo-600" to="/register">Register</Link></p>
      <p className="text-xs text-slate-500 mt-3">Demo (memory mode): demo@example.com / demo1234</p>
    </div>
  );
}
