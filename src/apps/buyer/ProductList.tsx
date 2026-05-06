import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBasket, Leaf, Search, Filter, Plus, ChevronRight, Star } from 'lucide-react';
import { Product } from '../../types';
import UserProfileModal from '../../components/UserProfileModal';

export default function ProductList({ addToCart }: { addToCart: (p: Product) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedFarmerId, setSelectedFarmerId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    (category === 'All' || p.category === category) &&
    (p.name?.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase()))
  );

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Live Stock'];

  return (
    <div className="space-y-12">
      {selectedFarmerId && (
        <UserProfileModal 
          userId={selectedFarmerId} 
          onClose={() => setSelectedFarmerId(null)} 
        />
      )}
      {/* Hero Section */}
      <section className="relative rounded-[48px] overflow-hidden bg-bdt-green text-white p-10 md:p-24 shadow-2xl shadow-emerald-200">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fee74a62?q=80&w=2664&auto=format&fit=crop" 
            alt="Nature field" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bdt-green via-bdt-green/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-8 shadow-2xl ring-1 ring-white/30 rotate-6"
          >
            <Leaf size={32} className="text-emerald-300" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter mb-8 bg-clip-text text-white drop-shadow-2xl"
          >
            NATURE'S <br />
            <span className="text-emerald-400 italic">BEST</span> PRICE
          </motion.h1>
          <p className="text-xl opacity-90 mb-12 max-w-lg leading-relaxed font-bold tracking-tight text-emerald-50">
            Connecting hardworking Bangladeshi farmers directly with smart urban buyers since 2024.
          </p>
          <div className="flex flex-wrap gap-4">
             <button 
               onClick={() => document.getElementById('market')?.scrollIntoView({ behavior: 'smooth' })}
               className="bg-white text-bdt-green px-12 py-5 rounded-[24px] font-black hover:bg-emerald-50 hover:-translate-y-1 transition-all flex items-center gap-2 shadow-2xl shadow-black/20"
             >
               EXPLORE THE HARVEST <ChevronRight size={18} />
             </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-2/3 h-full hidden lg:flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="relative w-[500px] h-[500px]">
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full"
            />
            <div className="absolute inset-4 overflow-hidden rounded-[80px] bg-emerald-800 shadow-2xl transform rotate-3 ring-8 ring-white/10">
              <img 
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2068&auto=format&fit=crop" 
                alt="Smiling Bangladeshi Farmer" 
                className="w-full h-full object-cover grayscale-0"
                referrerPolicy="no-referrer"
              />
            </div>
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 bg-bdt-red p-6 rounded-full shadow-2xl text-white font-black text-center ring-4 ring-white/20"
            >
              100%<br />ORGANIC
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <div id="market" className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm items-center">
        <div className="relative w-full md:w-1/3">
          <input 
            type="text" 
            placeholder="Search healthy harvests..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
          />
          <Search className="absolute left-4 top-4 text-slate-400" size={18} />
        </div>
        <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                category === c 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                  : 'bg-slate-50 text-slate-500 hover:bg-emerald-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white h-80 rounded-3xl animate-pulse border border-[#DEDCCE]"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((p, i) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white rounded-[32px] overflow-hidden border border-emerald-100/50 hover:shadow-2xl hover:shadow-emerald-200/40 transition-all hover:-translate-y-2"
            >
              <div className="h-56 bg-slate-50 relative overflow-hidden">
                {p.image_url && !imageError[p.id] ? (
                  <img 
                    src={p.image_url} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={() => {
                      setImageError(prev => ({ ...prev, [p.id]: true }));
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <ShoppingBasket size={64} />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-700 shadow-sm">
                  {p.category}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">{p.name}</h3>
                  <span className="font-black text-emerald-600 text-xl">৳{p.price.toFixed(2)}</span>
                </div>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10 leading-relaxed">{p.description}</p>
                <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                  <div 
                    className="flex items-center gap-2 cursor-pointer group/farmer"
                    onClick={() => setSelectedFarmerId(p.farmer_id)}
                  >
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-[10px] font-black text-emerald-700 group-hover/farmer:bg-emerald-600 group-hover/farmer:text-white transition-colors">
                      {p.farmer_name?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 group-hover/farmer:text-emerald-600 transition-colors">{p.farmer_name}</p>
                      {p.farmer_stats && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-[9px] text-amber-500 font-black">
                            <Star size={8} fill="currentColor" className="mr-0.5" />
                            {p.farmer_stats.averageRating ? p.farmer_stats.averageRating.toFixed(1) : "New"}
                          </div>
                          <span className="text-[9px] text-slate-300 font-black tracking-tighter">{p.farmer_stats.successfulSales} Sells</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => addToCart(p)}
                    className="bg-emerald-600 text-white w-10 h-10 rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center shadow-lg shadow-emerald-100"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <ShoppingBasket size={48} className="mx-auto text-[#DEDCCE] mb-4" />
              <h3 className="text-xl font-bold">No products found</h3>
              <p className="text-[#666]">Try adjusting your search or category filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


