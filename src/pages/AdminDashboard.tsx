import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, ShoppingBag, Truck, AlertTriangle, ShieldCheck, Activity, Search, Flag, UserPlus, FileText } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const DATA = [
  { name: "Jan", u: 4000, s: 2400 },
  { name: "Feb", u: 3000, s: 1398 },
  { name: "Mar", u: 2000, s: 9800 },
  { name: "Apr", u: 2780, s: 3908 },
  { name: "May", u: 1890, s: 4800 },
  { name: "Jun", u: 2390, s: 3800 },
];

const PIE_DATA = [
  { name: "Farmers", value: 400 },
  { name: "Buyers", value: 300 },
  { name: "Transporters", value: 100 },
];

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b"];

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [user, isLoading, navigate]);

  if (isLoading || !user || user.role !== "admin") {
    if (!isLoading && user && user.role !== "admin") navigate("/");
    return null;
  }
  return (
    <div className="min-h-screen bg-brand-950 pt-24 pb-20 px-6 text-white relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[150px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] -ml-20 -mb-20"></div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-none">System <span className="text-brand-500">Control</span></h1>
             <div className="flex items-center gap-6 text-[10px] font-black text-brand-300 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" /> Server Status: Optimal</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" /> Security: Active</span>
             </div>
          </div>
          <div className="flex gap-4">
             <button className="bg-white/5 hover:bg-white/10 p-5 rounded-2xl transition-all border border-white/5 backdrop-blur-xl">
                <Search className="w-5 h-5 text-brand-300" />
             </button>
             <button className="bg-brand-500 hover:bg-brand-400 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-2xl shadow-brand-500/20 transition-all transform hover:scale-105">
                <FileText className="w-5 h-5" /> Export Intelligence
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: "Network Users", val: "84,392", icon: <Users />, trend: "+450 today" },
             { label: "Listed Inventory", val: "12,504", icon: <ShoppingBag />, trend: "+12.5%" },
             { label: "Logistics Flow", val: "682", icon: <Truck />, trend: "98% Efficiency" },
             { label: "Trust Score", val: "99.98%", icon: <ShieldCheck />, trend: "Optimal" },
           ].map(stat => (
             <div key={stat.label} className="bg-white/5 border border-white/10 p-8 rounded-[3.5rem] backdrop-blur-2xl hover:bg-white/10 transition-all group">
                <div className="w-14 h-14 bg-brand-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-brand-500/30 group-hover:scale-110 transition-transform">
                   {stat.icon}
                </div>
                <div className="text-[10px] font-black text-brand-300 uppercase tracking-widest mb-2">{stat.label}</div>
                <div className="text-4xl font-black tracking-tight mb-4">{stat.val}</div>
                <div className="text-xs font-black text-brand-500 uppercase tracking-wider">{stat.trend}</div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 bg-white/5 border border-white/10 p-10 rounded-[4rem] backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-8">Platform Growth</h3>
              <div className="h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={DATA}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                       <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                       <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                       <Tooltip 
                        contentStyle={{ background: '#111827', border: 'none', borderRadius: '16px' }}
                       />
                       <Area type="monotone" dataKey="u" stroke="#22c55e" fillOpacity={0.2} fill="#22c55e" strokeWidth={3} />
                       <Area type="monotone" dataKey="s" stroke="#3b82f6" fillOpacity={0} border="transparent" strokeWidth={3} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="space-y-10">
              <div className="bg-white/5 border border-white/10 p-10 rounded-[4rem] backdrop-blur-xl">
                 <h3 className="text-xl font-bold mb-6">User Distribution</h3>
                 <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie 
                            data={PIE_DATA} 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="value"
                            stroke="none"
                          >
                             {PIE_DATA.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ background: '#111827', border: 'none', borderRadius: '16px' }}
                          />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex justify-center gap-6">
                     {PIE_DATA.map((item, i) => (
                      <div key={item.name} className="flex flex-col items-center gap-1">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                         <span className="text-[11px] font-black text-brand-200 uppercase tracking-widest">{item.name}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-brand-600 p-8 rounded-[4rem] shadow-2xl relative overflow-hidden">
                 <div className="relative z-10">
                    <Activity className="w-12 h-12 mb-6" />
                    <h3 className="text-2xl font-black mb-4">Network Activity</h3>
                    <p className="text-sm font-bold leading-relaxed mb-6">Processing 1,200 requests per second. Latency: 12ms. All systems normal.</p>
                    <button className="w-full py-4 bg-black/20 rounded-2xl font-bold hover:bg-black/30 transition-all">View Logs</button>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[4rem] overflow-hidden">
           <div className="p-10 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold">Recent Compliance Incidents</h3>
              <button className="text-brand-500 text-sm font-bold">Review All</button>
           </div>
           <div className="p-4">
              {[
                { user: "Farmer Mike", id: "UID-8821", risk: "Low", date: "2 mins ago" },
                { user: "Buyer Alice", id: "UID-8822", risk: "Medium", date: "5 mins ago" },
                { user: "Driver Tom", id: "UID-8823", risk: "Low", date: "12 mins ago" },
              ].map(row => (
                <div key={row.id} className="flex items-center justify-between p-6 hover:bg-white/5 rounded-[2rem] transition-all">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black">
                         {row.user[0]}
                      </div>
                      <div>
                         <div className="font-bold">{row.user}</div>
                         <div className="text-xs text-gray-500">{row.id}</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-12">
                      <div className="hidden md:block">
                         <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Risk Level</div>
                         <div className={cn(
                           "text-xs font-black uppercase tracking-widest",
                           row.risk === "Low" ? "text-brand-500" : "text-yellow-500"
                         )}>{row.risk}</div>
                      </div>
                      <div className="text-xs text-gray-500">{row.date}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
