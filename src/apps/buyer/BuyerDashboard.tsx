import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Package, Truck, CheckCircle, Clock, Search, Star, User as UserIcon } from 'lucide-react';
import { User, Order } from '../../types';
import UserProfileModal from '../../components/UserProfileModal';

export default function BuyerDashboard({ user }: { user: User }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingProfileId, setViewingProfileId] = useState<number | null>(null);
  const [ratingOrder, setRatingOrder] = useState<number | null>(null);
  const [ratingValue, setRatingValue] = useState(5);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/my');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      
      // Fetch stats for all unique farmers in orders
      // In this app, an order can have multiple items from different farmers, 
      // but for simplicity in UI, we'll just show the first item's farmer info if multiple.
      // A real app would let you rate per item.
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (orderId: number, farmerId: number) => {
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, toId: farmerId, rating: ratingValue })
      });
      if (res.ok) {
        setRatingOrder(null);
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-1 bg-emerald-500 rounded-full"></span>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Buyer Portal</p>
            </div>
            <h1 className="text-6xl font-black tracking-tighter mb-6 leading-none italic">
              FRESH FROM <br /><span className="text-emerald-500 uppercase">THE SOURCE</span>
            </h1>
            <p className="max-w-md text-slate-400 text-lg font-medium leading-relaxed">
              Supporting local heroes with every bite. Track your seasonal harvests and rate our hardworking farmers.
            </p>
          </div>
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 group">
             <div className="absolute inset-0 bg-emerald-500/20 rounded-[3rem] rotate-6 group-hover:rotate-12 transition-transform shadow-2xl shadow-emerald-500/20"></div>
             <img 
               src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60" 
               alt="Bangladeshi Farmer" 
               className="w-full h-full object-cover rounded-[3rem] relative z-10 shadow-2xl border-4 border-white/10"
               referrerPolicy="no-referrer"
             />
          </div>
        </div>
      </div>
      {viewingProfileId && (
        <UserProfileModal 
          userId={viewingProfileId} 
          onClose={() => setViewingProfileId(null)} 
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Spending', value: `৳${(Array.isArray(orders) ? orders : []).reduce((acc, o) => acc + (o.total_amount || 0), 0).toLocaleString()}`, icon: <ShoppingBag />, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
          { label: 'In Transit', value: (Array.isArray(orders) ? orders : []).filter(o => o.status === 'shipped').length, icon: <Truck />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
          { label: 'Delivered', value: (Array.isArray(orders) ? orders : []).filter(o => o.status === 'delivered').length, icon: <CheckCircle />, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
          { label: 'Processing', value: (Array.isArray(orders) ? orders : []).filter(o => o.status === 'pending').length, icon: <Clock />, color: 'text-amber-600', bgColor: 'bg-amber-50' }
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={`p-3 w-fit rounded-2xl mb-4 transition-transform group-hover:scale-110 ${stat.bgColor} ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-900/5 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Order History</h2>
            <p className="text-sm text-slate-500 mt-1">Track and manage your recent purchases</p>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Track order #" 
              className="w-full sm:w-64 pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-sm outline-none border border-transparent focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium">Crunching your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={40} className="text-slate-200" />
            </div>
            <p className="text-slate-500 text-lg">You haven't placed any orders yet.</p>
            <button className="mt-6 text-emerald-600 font-bold hover:underline">Start shopping today</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Order Details</th>
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Placed On</th>
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Payment</th>
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((o, idx) => (
                  <React.Fragment key={o.id}>
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-emerald-50/30 transition-colors group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                            <ShoppingBag size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">#ORD-{o.id}</span>
                            {o.farmer_name && (
                              <button 
                                onClick={() => o.farmer_id && setViewingProfileId(o.farmer_id)}
                                className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 transition-colors text-left"
                              >
                                Farmer: {o.farmer_name}
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-sm text-slate-500">
                        {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-6 font-black text-slate-900">
                        ৳{o.total_amount.toLocaleString()}
                      </td>
                      <td className="p-6">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200/50">
                          {o.payment_method}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <div className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              o.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {o.status}
                          </div>
                          {o.status === 'delivered' && (
                            <button 
                              onClick={() => setRatingOrder(ratingOrder === o.id ? null : o.id)}
                              className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                            >
                              {ratingOrder === o.id ? 'Close' : 'Rate Farmer'}
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                    {ratingOrder === o.id && (
                      <tr>
                        <td colSpan={5} className="p-0 border-none">
                          <div className="px-6 pb-6 bg-emerald-50/20">
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="bg-white p-8 rounded-[32px] border border-emerald-100 shadow-xl max-w-sm ml-auto"
                            >
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 text-center">Rate your experience</p>
                              <div className="flex justify-center gap-3 mb-8">
                                {[1, 2, 3, 4, 5].map(v => (
                                  <button 
                                    key={v}
                                    onClick={() => setRatingValue(v)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                      ratingValue >= v ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300'
                                    }`}
                                  >
                                    <Star size={16} fill={ratingValue >= v ? 'currentColor' : 'none'} />
                                  </button>
                                ))}
                              </div>
                              <button 
                                onClick={() => o.farmer_id && submitRating(o.id, o.farmer_id)}
                                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-800 shadow-lg shadow-emerald-50"
                              >
                                Submit Rating
                              </button>
                            </motion.div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
