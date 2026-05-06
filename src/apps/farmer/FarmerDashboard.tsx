import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  CreditCard, 
  Users, 
  ChevronRight,
  ExternalLink,
  Save,
  X,
  Bell,
  CheckCircle2,
  Upload
} from 'lucide-react';
import { User, Product, Order } from '../../types';
import UserProfileModal from '../../components/UserProfileModal';
import { AnimatePresence } from 'motion/react';

export default function FarmerDashboard({ user }: { user: User }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedBuyerStats, setSelectedBuyerStats] = useState<Record<number, any>>({});
  const [viewingProfileId, setViewingProfileId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{message: string, id: number} | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    category: 'Vegetables',
    image_url: ''
  });

  useEffect(() => {
    fetchData();

    // SSE Notifications
    const eventSource = new EventSource('/api/notifications/subscribe');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_ORDER') {
          setNotification({ message: data.message, id: Date.now() });
          fetchData(); // Refresh list automatically
          
          // Audio cue if possible (browsers might block)
          // const audio = new Audio('/notification.mp3');
          // audio.play().catch(() => {});
        }
      } catch (e) {
        // Heartbeats or malformed JSON
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE Disconnected. Retrying in 5s...', err);
      eventSource.close();
      setTimeout(() => {
        // Reconnection logic is handled naturally if we remount or use a ref
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchData = async () => {
    const pRes = await fetch(`/api/products?farmerId=${user.id}`);
    const pData = await pRes.json();
    setProducts(Array.isArray(pData) ? pData : []); 

    const oRes = await fetch('/api/orders/my');
    const oData = await oRes.json();
    const validatedOrders = Array.isArray(oData) ? oData : [];
    setOrders(validatedOrders);
    
    // Fetch stats for all unique buyers in orders
    const uniqueBuyerIds = Array.from(new Set(validatedOrders.map((o: any) => o.buyer_id)));
    uniqueBuyerIds.forEach(async (id: any) => {
      const sRes = await fetch(`/api/users/${id}/trust-stats`);
      const sData = await sRes.json();
      setSelectedBuyerStats(prev => ({ ...prev, [id]: sData }));
    });
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || uploading) return;
    
    if (!newProduct.image_url) {
      alert("Please upload an image or select a preset photo for your harvest.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          quantity: Number(newProduct.quantity)
        })
      });
      if (res.ok) {
        setNotification({ message: "Harvest list published successfully! It's now live for buyers.", id: Date.now() });
        setIsAdding(false);
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          quantity: 0,
          category: 'Vegetables',
          image_url: ''
        });
        setUploadSuccess(false);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to publish listing");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to remove this harvest listing?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotification({ message: "Listing removed successfully.", id: Date.now() });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large (max 2MB)");
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct(prev => ({ ...prev, image_url: reader.result as string }));
      setUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    };
    reader.onerror = () => {
      alert("Failed to read image");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Live Stock'];

  return (
    <div className="space-y-10">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4"
          >
            <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-2xl border border-white/10 flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-[shimmer_2s_infinite]"></div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Bell className="animate-bounce" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">New Alert</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="font-bold text-sm">{notification.message}</p>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <CheckCircle2 size={20} className="text-emerald-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {viewingProfileId && (
        <UserProfileModal 
          userId={viewingProfileId} 
          onClose={() => setViewingProfileId(null)} 
        />
      )}
      <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl shadow-emerald-200">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-1 bg-red-500 rounded-full"></span>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-100">Farmer Command Center</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-none italic uppercase">
              Growth & <br /> Prosperity
            </h1>
            <p className="max-w-md text-emerald-50 text-lg font-medium opacity-90">
              Welcome back, {user.username}. Your hard work feeds the nation. 
              Manage your harvest and track orders in real-time.
            </p>
          </div>
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 group">
             <div className="absolute inset-0 bg-white/20 rounded-[3rem] rotate-3 group-hover:rotate-6 transition-transform"></div>
             <div className="absolute inset-0 bg-red-500/20 rounded-[3rem] -rotate-3 group-hover:-rotate-6 transition-transform"></div>
             <img 
               src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60" 
               alt="Farmer" 
               className="w-full h-full object-cover rounded-[3rem] relative z-10 shadow-2xl border-4 border-white/30"
               referrerPolicy="no-referrer"
             />
          </div>
        </div>
        <Package className="absolute -right-20 -bottom-20 opacity-10 rotate-12" size={400} />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Total Sales" value={`৳${(Array.isArray(orders) ? orders : []).reduce((acc, o) => acc + (o.total_amount || 0), 0).toFixed(2)}`} icon={<TrendingUp />} color="bg-emerald-600 shadow-xl shadow-emerald-200" />
        <StatCard title="Active Listings" value={(Array.isArray(products) ? products : []).length.toString()} icon={<Package />} color="bg-amber-500 shadow-xl shadow-amber-100" />
        <StatCard title="Total Orders" value={(Array.isArray(orders) ? orders : []).length.toString()} icon={<Users />} color="bg-slate-800 shadow-xl shadow-slate-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Products Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-emerald-100 shadow-sm">
            <div>
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <Package className="text-emerald-500" />
                Inventory
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-medium">Manage your farm listings</p>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              <Plus size={20} /> ADD PRODUCT
            </button>
          </div>

          <div className="bg-white rounded-[32px] border border-emerald-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Harvest</th>
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Stock</th>
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Unit Price</th>
                  <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-sm overflow-hidden border border-slate-100">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{p.category === 'Vegetables' ? '🥦' : p.category === 'Fruits' ? '🍎' : '📦'}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{p.name}</p>
                          <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 font-mono text-sm text-slate-600">{p.quantity} Units</td>
                    <td className="p-6 font-black text-emerald-600">৳{p.price.toFixed(2)}</td>
                    <td className="p-6">
                      <div className="flex gap-2 justify-end">
                        <button className="p-2.5 hover:bg-emerald-50 rounded-xl text-slate-400 hover:text-emerald-600 transition-all"><Edit3 size={18} /></button>
                        <button 
                          onClick={() => deleteProduct(p.id)}
                          className="p-2.5 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-emerald-100 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <CreditCard className="text-amber-500" />
              Incoming Orders
            </h2>
            <p className="text-sm text-slate-400 mt-2 font-medium">Pending purchase requests</p>
          </div>
          <div className="space-y-4">
            {orders.map(o => (
              <motion.div 
                key={o.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-3xl border border-emerald-100 flex flex-col group hover:bg-emerald-50/20 transition-all cursor-pointer"
              >
                <div className="flex items-center w-full mb-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black mr-4 shadow-sm group-hover:bg-white transition-all">
                    #{o.id}
                  </div>
                  <div 
                    className="flex-1"
                    onClick={() => setViewingProfileId(o.buyer_id)}
                  >
                    <p className="font-black text-slate-800">৳{o.total_amount.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-slate-500 font-bold hover:text-emerald-600 transition-colors">Buyer: {o.buyer_name}</p>
                      {selectedBuyerStats[o.buyer_id] && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-500">
                          <span>{selectedBuyerStats[o.buyer_id].totalOrders} Orders</span>
                          <span className="text-slate-300">|</span>
                          <span className={selectedBuyerStats[o.buyer_id].successRate > 80 ? 'text-emerald-600' : 'text-amber-600'}>
                            {selectedBuyerStats[o.buyer_id].successRate.toFixed(0)}% Clear
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <span>{new Date(o.created_at).toLocaleDateString()}</span>
                      {o.buyer_phone && <span className="text-emerald-600 font-black">• {o.buyer_phone}</span>}
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest ${
                    o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                    o.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700 font-black'
                  }`}>
                    {o.status}
                  </div>
                </div>
                
                {o.status === 'pending' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(o.id, 'processing');
                    }}
                    className="w-full bg-emerald-600 text-white text-[10px] font-black py-3 rounded-xl uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-50 transition-all"
                  >
                    Accept Order
                  </button>
                )}
              </motion.div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white w-full max-w-xl rounded-[40px] p-10 border border-emerald-100 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black tracking-tight text-slate-800">LIST HARVEST</h2>
              <button onClick={() => setIsAdding(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-rose-500"><X size={24} /></button>
            </div>
            <form onSubmit={addProduct} className="space-y-6">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Crop Name</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800" 
                  placeholder="e.g. Premium Basmati Rice"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Description</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 min-h-[100px] resize-none" 
                  placeholder="Tell buyers about your harvest - harvest date, chemicals used, etc."
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Price Per Unit (৳)</label>
                  <input 
                    type="number" step="0.01" 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    value={newProduct.price || ''}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value ? parseFloat(e.target.value) : 0})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Available Quantity</label>
                  <input 
                    type="number" 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    value={newProduct.quantity || ''}
                    onChange={e => setNewProduct({...newProduct, quantity: e.target.value ? parseInt(e.target.value) : 0})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Crop Image (Upload)</label>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div 
                      onClick={() => !newProduct.image_url && fileInputRef.current?.click()}
                      className={`flex-1 h-48 border-2 border-dashed rounded-[32px] transition-all group overflow-hidden relative flex flex-col items-center justify-center gap-3 ${
                        newProduct.image_url 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-emerald-100 bg-emerald-50/30 cursor-pointer hover:bg-emerald-50 hover:border-emerald-300'
                      }`}
                    >
                      {newProduct.image_url ? (
                        <>
                          <img src={newProduct.image_url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className={`absolute inset-0 transition-opacity flex items-center justify-center pointer-events-none ${uploadSuccess ? 'bg-emerald-600/20 opacity-100' : 'bg-black/20 opacity-0 group-hover:opacity-100'}`}>
                             <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-xl flex items-center gap-2 transition-all ${uploadSuccess ? 'bg-emerald-600 text-white translate-y-0' : 'bg-white text-slate-800'}`}>
                               {uploadSuccess ? (
                                 <>
                                   <CheckCircle2 size={12} />
                                   <span>Upload Successful!</span>
                                 </>
                               ) : (
                                 <span>Selected</span>
                               )}
                             </div>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewProduct(prev => ({ ...prev, image_url: '' }));
                              setUploadSuccess(false);
                            }}
                            className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-md rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white shadow-lg transition-all"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <Upload size={24} />
                          </div>
                          <div className="text-center px-4">
                            <p className="text-[11px] font-black uppercase tracking-widest text-emerald-800 mb-1">Click to Upload</p>
                            <p className="text-[10px] text-slate-400 font-medium">PNG, JPG up to 2MB. Direct upload only.</p>
                          </div>
                        </>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent animate-spin rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>

                  <div className="flex gap-2 items-center">
                     <div className="h-[1px] flex-1 bg-slate-100"></div>
                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-2">OR SELECT PRESET PHOTO</span>
                     <div className="h-[1px] flex-1 bg-slate-100"></div>
                  </div>

                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {[
                      { name: 'Vegetables', url: 'https://images.unsplash.com/photo-1566385101042-1a000c1268c4?q=80&w=2666&auto=format&fit=crop' },
                      { name: 'Fruits', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=2070&auto=format&fit=crop' },
                      { name: 'Grains', url: 'https://images.unsplash.com/photo-1536679545597-c2bb571f4295?q=80&w=2070&auto=format&fit=crop' },
                      { name: 'Live Stock', url: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?q=80&w=2070&auto=format&fit=crop' },
                    ].map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => setNewProduct({...newProduct, image_url: s.url, category: s.name})}
                        className="flex-shrink-0 px-4 py-2 rounded-xl bg-emerald-50 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Crop Category</label>
                <select 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting || uploading}
                className={`w-full ${isSubmitting || uploading ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white py-5 rounded-[24px] font-black text-sm tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-100`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  <Save size={20} />
                )}
                {isSubmitting ? 'PUBLISHING...' : 'PUBLISH LISTING'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-white p-7 rounded-[32px] border border-emerald-100 shadow-sm flex items-center justify-between group hover:border-emerald-300 transition-all">
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">{title}</p>
        <p className="text-4xl font-black tracking-tighter text-slate-900 group-hover:scale-105 transition-transform origin-left">{value}</p>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${color}`}>
        {icon}
      </div>
    </div>
  );
}
