import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { User as UserIcon, Lock, Mail, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { Role } from '../../types';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'buyer' as Role
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          username: formData.username.trim(),
          email: formData.email.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        console.error('Registration failed:', data);
        setError(data.error || 'Registration failed. Try a different username/email.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: Role; label: string; icon: any }[] = [
    { value: 'buyer', label: 'Buyer', icon: <UserIcon size={16} /> },
    { value: 'farmer', label: 'Farmer', icon: <ShieldCheck size={16} /> },
    { value: 'transport', label: 'Transport', icon: <ShieldCheck size={16} /> },
    { value: 'admin', label: 'Admin', icon: <ShieldCheck size={16} /> }
  ];

  if (success) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[40px] shadow-sm border border-emerald-100"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-emerald-600">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Success!</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">Your account has been created successfully. You can now log in to access your dashboard.</p>
          <Link 
            to="/login" 
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-200"
          >
            LOG IN NOW <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[40px] shadow-sm border border-emerald-100"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Join the Collective</h1>
          <p className="text-slate-500 text-sm mt-2">Empowering ethical food production</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Full Identity</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                placeholder="agro_user"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                placeholder="hello@harvest.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Contact Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                placeholder="01XXXXXXXXX"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Secure Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                placeholder="Choose wisely..."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Your Role</label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setFormData({...formData, role: r.value})}
                  className={`py-4 flex flex-col items-center gap-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all border-2 ${
                    formData.role === r.value 
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

          {error && <p className="text-rose-500 text-xs bg-rose-50 p-4 rounded-2xl border border-rose-100 italic">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:-translate-y-1 shadow-xl shadow-emerald-100"
          >
            {loading ? 'Registering...' : 'CREATE ACCOUNT'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[#666]">
          Already have an account? <Link to="/login" className="text-[#4A5D23] font-bold hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
