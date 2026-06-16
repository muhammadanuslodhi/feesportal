import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.username);
      toast.success('Welcome back!');
      nav('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-brand-50 to-white p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-brand-600 text-white grid place-items-center font-bold text-2xl mx-auto mb-3">F</div>
          <h1 className="text-2xl font-bold">Fees Portal</h1>
          <p className="text-sm text-gray-500">Admin sign in</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input className="input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
}
