import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, ShieldCheck, MapPin, Star, Package, ShoppingBag, Phone, Mail, Calendar } from 'lucide-react';

interface UserProfileModalProps {
  userId: number;
  onClose: () => void;
}

export default function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, sRes] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/users/${userId}/trust-stats`)
        ]);
        const userData = await uRes.json();
        const statsData = await sRes.json();
        setProfile(userData);
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="h-24 bg-emerald-600 relative">
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="absolute -bottom-10 left-8">
              <div className="w-20 h-20 rounded-3xl bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-2xl font-black">
                  {profile.username[0].toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-14 px-8 pb-8">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-black text-slate-800">{profile.username}</h2>
              <ShieldCheck size={18} className="text-emerald-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-6 px-3 py-1 bg-emerald-50 inline-block rounded-full">
              Verified {profile.role}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {profile.role === 'farmer' ? (
                <>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Sells</p>
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={14} className="text-slate-400" />
                      <span className="text-lg font-black text-slate-800">{stats.successfulSales}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Rating</p>
                    <div className="flex items-center gap-2">
                      <Star size={14} fill="#f59e0b" className="text-amber-500" />
                      <span className="text-lg font-black text-slate-800">{stats.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Orders</p>
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-slate-400" />
                      <span className="text-lg font-black text-slate-800">{stats.totalOrders}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Success Rate</p>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span className="text-lg font-black text-slate-800">{stats.successRate.toFixed(0)}%</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-slate-600">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contact</p>
                  <p className="text-sm font-bold">{profile.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Member Since</p>
                  <p className="text-sm font-bold">{new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-xl shadow-slate-200"
            >
              Close Profile
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
