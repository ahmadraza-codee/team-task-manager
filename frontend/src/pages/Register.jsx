
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!f.name.trim()) return setErr('Full name is required');
    if (f.password.length < 6) return setErr('Password must be at least 6 characters');
    if (f.password !== f.confirm) return setErr('Passwords do not match');
    setLoading(true);
    try { await register({ name: f.name, email: f.email, password: f.password }); nav('/'); }
    catch (x) { setErr(x.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-1">Create account</h1>
      <p className="text-sm text-slate-500 mb-4">Start managing your team's tasks in minutes.</p>
      {err && <p className="bg-red-50 text-red-700 p-2 rounded mb-3 text-sm">{err}</p>}
      <form onSubmit={submit} className="space-y-3">
        <div><label className="text-sm font-medium">Full name</label><input className="input" placeholder="Full name" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
        <div><label className="text-sm font-medium">Email address</label><input className="input" type="email" placeholder="you@example.com" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
        <div><label className="text-sm font-medium">Password</label>
          <div className="relative"><input className="input pr-16" type={show ? 'text' : 'password'} placeholder="Password (min 6 chars)" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
          <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-indigo-600" onClick={() => setShow(s => !s)}>{show ? 'Hide' : 'Show'}</button></div>
        </div>
        <div><label className="text-sm font-medium">Confirm password</label><input className="input" type={show ? 'text' : 'password'} placeholder="Repeat password" required value={f.confirm} onChange={e => setF({ ...f, confirm: e.target.value })} /></div>
        <button className="btn w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
      </form>
      <p className="text-sm mt-4">Already registered? <Link className="text-indigo-600" to="/login">Login</Link></p>
    </div>
  );
}
