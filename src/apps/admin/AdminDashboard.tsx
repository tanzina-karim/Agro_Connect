import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Shield, 
  Settings, 
  Search,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    revenue: 0,
    products: 0,
    pendingJobs: 0
  });
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (!data.error) {
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-1 bg-amber-500 rounded-full"></span>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-300">Central Command</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-none uppercase italic">
              System <br /> Governance
            </h1>
            <p className="max-w-md text-indigo-100 text-lg font-medium opacity-80 leading-relaxed">
              Monitoring the pulse of AgroConnect. Facilitating growth, transparency, and trust across the nation's harvest.
            </p>
          </div>
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 group">
             <div className="absolute inset-0 bg-white/10 rounded-[3rem] rotate-6 group-hover:rotate-12 transition-transform shadow-2xl"></div>
             <img 
               src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop" 
               alt="Management" 
               className="w-full h-full object-cover rounded-[3rem] relative z-10 shadow-2xl border-4 border-white/20"
               referrerPolicy="no-referrer"
             />
          </div>
        </div>
        <Shield className="absolute -right-20 -bottom-20 opacity-10 rotate-12" size={400} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">SYSTEM OVERVIEW</h1>
          <p className="text-slate-500 mt-1">Global management and system health monitoring</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-100 px-6 py-3 rounded-full border border-emerald-200/50 shadow-sm shadow-emerald-100 self-start">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          LIVE SYSTEM STATUS: OPTIMAL
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStat icon={<Users />} label="Total Users" value={stats.users.toString()} color="text-indigo-600" bgColor="bg-indigo-50" />
        <AdminStat icon={<ShoppingBag />} label="Total Orders" value={stats.orders.toString()} color="text-emerald-600" bgColor="bg-emerald-50" />
        <AdminStat icon={<TrendingUp />} label="Total Revenue" value={`৳${stats.revenue.toLocaleString()}`} color="text-amber-600" bgColor="bg-amber-50" />
        <AdminStat icon={<AlertCircle />} label="Pending Jobs" value={stats.pendingJobs.toString()} color="text-rose-600" bgColor="bg-rose-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-emerald-50 p-8 shadow-xl shadow-emerald-900/5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full sm:w-64 pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-sm outline-none border border-slate-100 focus:border-emerald-500 transition-all font-medium" 
              />
            </div>
          </div>
          <div className="space-y-4">
             {users.map((u, i) => (
               <motion.div 
                 key={u.id} 
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-emerald-50/50 rounded-3xl border border-slate-100 transition-all group"
               >
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-emerald-600 font-black shadow-sm group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                     {u.username[0].toUpperCase()}
                   </div>
                   <div>
                     <p className="font-bold text-slate-900">{u.username}</p>
                     <p className="text-[10px] text-slate-500 font-medium">{u.email} • {u.phone || 'No Phone'}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">{u.role}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active</p>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 space-y-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
              <Shield size={24} className="text-amber-500" /> Control Panel
            </h2>
            <p className="text-sm text-slate-400 font-medium">Global system settings and administrative overrides.</p>
          </div>
          
          <div className="space-y-3 relative z-10">
            <AdminAction label="Marketplace Settings" />
            <AdminAction label="Payment Gateway Config" />
            <AdminAction label="Verify New Transporters" />
            <AdminAction label="System Backup" />
            <AdminAction label="Audit Logs" />
          </div>

          <Shield className="absolute -right-16 -bottom-16 opacity-5 text-amber-500 -rotate-12" size={300} />
        </div>
      </div>
    </div>
  );
}

function AdminStat({ icon, label, value, color, bgColor }: { icon: any, label: string, value: string, color: string, bgColor: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className={`p-4 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110 ${bgColor} ${color}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
      <p className="text-4xl font-black tracking-tight text-slate-900">{value}</p>
    </motion.div>
  );
}

function AdminAction({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-sm font-bold text-slate-200 group">
      {label}
      <Settings size={18} className="text-slate-500 group-hover:text-amber-500 transition-colors" />
    </button>
  );
}
