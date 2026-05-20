import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { User as UserIcon, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { User, Role } from '../../types';

export default function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles: { value: Role; label: string; icon: any }[] = [
    { value: 'buyer', label: 'Buyer', icon: <UserIcon size={16} /> },
    { value: 'farmer', label: 'Farmer', icon: <ShieldCheck size={16} /> },
    { value: 'transport', label: 'Transport', icon: <ShieldCheck size={16} /> },
    { value: 'admin', label: 'Admin', icon: <ShieldCheck size={16} /> }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
        navigate('/dashboard');
      } else {
        console.error('Login failed:', data);
        setError(data.error || 'Invalid username or password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[40px] shadow-sm border border-emerald-100"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <UserIcon className="text-emerald-500" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-2">Access your agricultural network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`py-3 flex items-center justify-center gap-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all border-2 ${
                    role === r.value 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
                      : 'bg-slate-50 text-slate-400 border-transparent hover:border-emerald-100 hover:bg-white'
                  }`}
                >
                  {r.icon}
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none font-medium text-slate-700"
                placeholder="agro_pro"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none font-medium text-slate-700"
                placeholder="********"
                required
              />
            </div>
          </div>

          {error && <p className="text-rose-500 text-xs bg-rose-50 p-4 rounded-2xl border border-rose-100 font-bold italic">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-emerald-100"
          >
            {loading ? 'Authenticating...' : 'SIGN IN'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-[#666]">
          Don't have an account? <Link to="/register" className="text-[#4A5D23] font-bold hover:underline">Register now</Link>
        </p>
      </motion.div>
    </div>
  );
}
