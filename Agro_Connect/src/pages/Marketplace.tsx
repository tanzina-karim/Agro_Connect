import { useState } from "react";
import { Search, Filter, MapPin, Star, ShoppingCart, ArrowRight, Heart, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { useProducts } from "../contexts/ProductContext";
import { useLanguage } from "../contexts/LanguageContext";

const CATEGORIES = ["All", "Vegetables", "Fruits", "Grains", "Dairy", "Honey"];
const CATEGORIES_BN: Record<string, string> = {
  "All": "সব",
  "Vegetables": "সবজি",
  "Fruits": "ফল",
  "Grains": "শস্য",
  "Dairy": "দুগ্ধজাত",
  "Honey": "মধু"
};

import { toast } from "sonner";

export default function Marketplace() {
  const { products, addToCart } = useProducts();
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success(language === "bn" ? `${product.name} কার্টে যোগ করা হয়েছে!` : `${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-earth-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="max-w-xl">
             <h1 className="text-5xl font-black text-brand-950 tracking-tighter mb-4 uppercase">
               {language === "bn" ? "সরাসরি " : "Direct "}
               <span className="text-brand-600">
                 {language === "bn" ? "বাজার" : "Marketplace"}
               </span>
             </h1>
             <p className="text-brand-900 font-bold leading-relaxed">
               {language === "bn" 
                 ? "সরাসরি কৃষকের কাছ থেকে তাজা অর্গানিক পণ্য কিনুন এবং ক্ষুদ্র কৃষকদের সহায়তা করুন।" 
                 : "Supporting small-scale farmers and providing fresh organic products directly to your doorstep."}
             </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder={language === "bn" ? "পণ্য বা কৃষক খুঁজুন..." : "Search products or farmers..."}
                 className="bg-white border-2 border-gray-100 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-brand-500/30 transition-all w-full md:w-[320px] font-medium"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
             <button className="bg-white border-2 border-gray-100 p-4 rounded-2xl hover:bg-gray-50 transition-all">
               <Filter className="w-6 h-6 text-gray-600" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Sidebar */}
          <aside className="md:col-span-1 space-y-10">
            <div>
              <h3 className="font-bold text-brand-900 mb-6 flex items-center justify-between uppercase tracking-widest text-xs">
                {language === "bn" ? "ক্যাটাগরি" : "Categories"}
                <span className="text-[10px] text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">
                  {language === "bn" ? "লাইভ" : "Live"}
                </span>
              </h3>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-between group text-sm",
                      activeCategory === cat 
                        ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20" 
                        : "text-gray-600 hover:bg-white hover:text-brand-600"
                    )}
                  >
                    {language === "bn" ? CATEGORIES_BN[cat] || cat : cat}
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform group-hover:translate-x-1",
                      activeCategory === cat ? "opacity-100" : "opacity-0"
                    )} />
                  </button>
                ))}
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem]">
              <h3 className="font-bold text-gray-900 mb-4">{language === "bn" ? "মূল্য নির্ধারণ" : "Price Range"}</h3>
              <div className="space-y-4">
                <input type="range" className="w-full accent-brand-600" />
                <div className="flex justify-between text-xs font-bold text-gray-400 font-sans">
                  <span>{language === "bn" ? "৳০" : "৳0"}</span>
                  <span>{language === "bn" ? "৳৫০০০+" : "৳5000+"}</span>
                </div>
              </div>
            </div>

            <div className="bg-brand-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
               <div className="relative z-10">
                 <h3 className="text-2xl font-black mb-4">{language === "bn" ? "সেরা কৃষক" : "Farmer of the Month"}</h3>
                 <p className="text-brand-200 text-sm mb-6">{language === "bn" ? "রহিম মিয়া এআই ডিটেক্টর ব্যবহার করে তাঁর ফসলের উৎপাদন ৪০% বাড়িয়েছেন।" : "Rahim Miya increased his sustainable yield by 40% using AI detector."}</p>
                 <Link to="/marketplace" className="text-brand-300 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                    {language === "bn" ? "গল্পটি পড়ুন" : "Read Story"} <ArrowRight className="w-4 h-4" />
                 </Link>
               </div>
               <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-brand-500 rounded-full blur-[60px] opacity-20"></div>
            </div>
          </aside>

          {/* Main Grid */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-500/5 transition-all shadow-sm"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {product.isOrganic && (
                      <span className="bg-brand-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                        {language === "bn" ? "অর্গানিক" : "Organic"}
                      </span>
                    )}
                  </div>
                  <button className="absolute top-4 right-4 p-3 glass rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-50 hover:text-brand-600">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                  <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-black text-brand-950">{product.rating}</span>
                    <span className="text-[10px] text-brand-900/40 font-black uppercase tracking-widest">
                      ({product.reviews} {language === "bn" ? "রিভিউ" : "reviews"})
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-brand-950 mb-3 truncate group-hover:text-brand-600 transition-colors tracking-tight uppercase">{product.name}</h3>
                  <div className="flex flex-col gap-2 mb-8">
                     <Link 
                       to={`/profile/${product.farmerId}-farmer`} 
                       className="flex items-center gap-2 hover:text-brand-600 transition-colors font-black text-[10px] uppercase tracking-[0.1em]"
                     >
                        <MapPin className="w-3.5 h-3.5 text-brand-500" />
                        <span>{product.farmerName}</span>
                     </Link>
                     <span className="pl-5 text-[9px] text-brand-900/40 font-black uppercase tracking-widest">{product.location}</span>
                  </div>
                   <div className="flex items-center justify-between pt-4 border-t border-brand-50">
                    <div>
                      <span className="text-2xl font-black text-brand-950">৳{product.price}</span>
                      <span className="text-[10px] text-brand-900/40 font-black uppercase tracking-widest ml-1">/ {product.unit}</span>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white p-4 rounded-2xl transition-all shadow-sm"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
