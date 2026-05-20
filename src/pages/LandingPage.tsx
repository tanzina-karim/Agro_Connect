import { motion } from "motion/react";
import { Search, ArrowRight, ShieldCheck, Zap, TrendingUp, Users, Leaf, Camera, MapPin, ShoppingCart, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";



export default function LandingPage() {
  const { t, language } = useLanguage();

  const categories = [
    { name: language === "en" ? "Vegetables" : "সবজি", icon: "🥬", count: language === "en" ? "1.2k+ Products" : "১.২কে+ পণ্য" },
    { name: language === "en" ? "Fruits" : "ফল", icon: "🍎", count: language === "en" ? "850+ Products" : "৮৫০+ পণ্য" },
    { name: language === "en" ? "Grains" : "শস্য", icon: "🌾", count: language === "en" ? "2.1k+ Products" : "২.১কে+ পণ্য" },
    { name: language === "en" ? "Dairy" : "দুধ ও দই", icon: "🥛", count: language === "en" ? "400+ Products" : "৪০০+ পণ্য" },
    { name: language === "en" ? "Seafood" : "মাছ", icon: "🐟", count: language === "en" ? "300+ Products" : "৩০০+ পণ্য" },
    { name: language === "en" ? "Livestock" : "গবাদি পশু", icon: "🐄", count: language === "en" ? "150+ Products" : "১৫০+ পণ্য" },
  ];
  return (
    <div className="overflow-hidden bg-earth-50">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 bg-brand-950 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-emerald-950 z-0"></div>
        <div className="absolute top-0 right-0 w-[50%] h-full bg-brand-900/50 skew-x-[-12deg] translate-x-[20%] z-0"></div>
        <div className="absolute top-20 right-[10%] w-96 h-96 bg-brand-500 rounded-full blur-[150px] opacity-20 z-0"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 text-left"
          >
            <h1 className="text-5xl md:text-8xl font-black text-white mb-8 leading-[1] tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              {language === "en" ? "Connecting Farmers," : "কৃষকের সেতুবন্ধন,"} <br />
              <span className="text-brand-400">{language === "en" ? "Growing Together" : "সমৃদ্ধির পথে"}</span>
            </h1>

            <p className="text-xl text-brand-50 mb-12 max-w-xl font-bold leading-relaxed drop-shadow-lg">
              {language === "en" 
                ? "AgroConnect is your all-in-one platform for expert advice, quality products, market access and a strong farming community."
                : "এগ্রোকানেক্ট আপনার সব সমস্যার সমাধান - বিশেষজ্ঞ পরামর্শ, উন্নত কৃষি উপকরণ, বাজার সংযোগ এবং এক শক্তিশালী কৃষক কমিউনিটি।"}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-20">
              <Link 
                to="/dashboard/farmer" 
                className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white px-12 py-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-2xl shadow-brand-900/40"
              >
                {language === "en" ? "Explore Services" : "সার্ভিসগুলো দেখুন"} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/register" 
                className="w-full sm:w-auto bg-white hover:bg-brand-50 text-brand-900 px-12 py-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-xl"
              >
                {language === "en" ? "Join Our Community" : "আমাদের সাথে যুক্ত হোন"}
              </Link>
            </div>

            <div className="flex items-center gap-6">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-12 h-12 rounded-full border-4 border-brand-800 object-cover shadow-lg" alt="User" />
                  ))}
               </div>
               <div className="text-white/80 text-sm font-medium">
                  <span className="text-white font-bold block text-base">{language === "en" ? "Join 50k+ Farmers" : "৫০ হাজার কৃষকের সাথে যুক্ত হোন"}</span>
                  {language === "en" ? "Growing their business online" : "তাদের ব্যবসা অনলাইনে বড় করছেন"}
               </div>
            </div>

            <div className="max-w-xl bg-brand-950/40 backdrop-blur-3xl p-2 rounded-3xl mt-12 border border-white/20 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex-grow flex items-center gap-3 px-6 py-3 group">
                  <Search className="w-5 h-5 text-brand-300 group-focus-within:text-white" />
                  <input 
                    type="text" 
                    placeholder={language === "en" ? "Search for fresh produce..." : "তাজা কৃষি পণ্য খুঁজুন..."}
                    className="bg-transparent border-none outline-none w-full text-white placeholder-brand-200/60 font-black text-lg"
                  />
                </div>
                <button className="w-full sm:w-auto bg-white text-brand-900 hover:bg-brand-50 px-10 py-4 rounded-2xl font-black transition-all shadow-xl">
                  {language === "en" ? "Search" : "খুঁজুন"}
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-7 relative flex flex-col items-center lg:items-end justify-center gap-8 lg:-mt-24 xl:-mt-32 z-10"
          >
            <div className="relative rounded-[3.5rem] overflow-hidden border-[16px] border-white/10 shadow-3xl max-w-sm sm:max-w-md lg:max-w-[530px] xl:max-w-[600px] w-full transform hover:scale-[1.01] transition-transform duration-500 lg:ml-auto">
               <img 
                src="/src/assets/images/agro_connect_hero_farmer_1779213271051.png" 
                className="w-full aspect-[4/5] object-cover"
                alt="AgroConnect Hero Farmer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 via-transparent to-transparent"></div>
              
              {/* Badge 1: 100% Organic */}
              <div className="absolute top-6 right-6 bg-brand-600/90 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <Leaf className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-[10px] uppercase tracking-widest">
                  {language === "en" ? "100% Organic" : "১০০% অর্গানিক"}
                </span>
              </div>

              {/* Badge 2: Verified Farmer */}
              <div className="absolute bottom-6 left-6 bg-brand-950/90 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span className="text-white font-bold text-[10px] uppercase tracking-widest">
                  {language === "en" ? "Verified Seller" : "সার্টিফাইড বিক্রেতা"}
                </span>
              </div>
            </div>

            {/* Today's Tips Card - Rendered underneath the farmer's main area to avoid overlap */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-emerald-50/95 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl border border-white/20 max-w-sm sm:max-w-md lg:max-w-[530px] xl:max-w-[600px] w-full lg:ml-auto"
            >
              <div className="flex items-center gap-3 mb-4 justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                       <Zap className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-emerald-900 text-sm">Today's Tips</span>
                 </div>
                 <button className="text-emerald-600 font-bold text-sm hover:underline cursor-pointer">
                   {language === "en" ? "Read More" : "আরও পড়ুন"}
                 </button>
              </div>
              <h4 className="text-emerald-950 font-black text-lg leading-tight tracking-tight">
                {language === "en" ? "Ways to prevent waterlogging in rice" : "ধানের জলাবদ্ধতা রোধের উপায়"}
              </h4>
            </motion.div>

            {/* Decorative background circle */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-400 rounded-full blur-[120px] opacity-20 -z-0"></div>
          </motion.div>
        </div>
      </section>

      {/* One Platform, Many Benefits Section */}
      <section className="bg-brand-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-white">
            <h2 className="text-2xl font-black tracking-tight mb-2">One Platform, Many Benefits</h2>
            <div className="w-20 h-1 bg-brand-500 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-grow">
            {[
              { title: "No Middlemen", sub: "Better Price", icon: <ShieldCheck className="w-5 h-5" /> },
              { title: "Fair Deals", sub: "For Farmers", icon: <TrendingUp className="w-5 h-5" /> },
              { title: "Safe & Secure", sub: "Transactions", icon: <ShieldCheck className="w-5 h-5" /> },
              { title: "Growth for All", sub: "Together", icon: <Users className="w-5 h-5" /> },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
                  {b.icon}
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{b.title}</div>
                  <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-brand-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4 block">{language === "en" ? "Categories" : "ক্যাটাগরি"}</span>
              <h2 className="text-4xl md:text-5xl font-black text-brand-950 tracking-tighter uppercase">{t("home.featured_title")}</h2>
            </div>
            <Link to="/marketplace" className="text-brand-600 font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:gap-3 transition-all">
              {language === "en" ? "View All" : "সব দেখুন"} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-[2.5rem] text-center border border-brand-100 hover:border-brand-300 hover:shadow-2xl transition-all cursor-pointer group shadow-sm"
              >
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h3 className="font-black text-brand-950 mb-1 uppercase text-sm tracking-tight">{cat.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-900/40">{cat.count}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Showcase */}
      <section className="py-24 px-6 bg-earth-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1599403273356-02e078ba196a?auto=format&fit=crop&q=80&w=1000" 
                alt="AI Disease Detection"
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-brand-900/20"></div>
              <div className="absolute top-6 left-6 glass p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Scanning...</div>
                  <div className="text-xs font-bold text-gray-900">Leaf Rust Detected (98%)</div>
                </div>
              </div>
            </motion.div>
            {/* Decorative background elements */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-brand-100 rounded-full blur-3xl opacity-50 -z-0"></div>
            <div className="absolute -bottom-12 -right-12 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-50 -z-0"></div>
          </div>

          <div>
            <span className="text-brand-600 font-bold text-sm uppercase tracking-widest mb-4 block">{t("home.smart_agri")}</span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight tracking-tighter">
              {language === "en" ? "AI Powered Disease" : "ফসলের রোগ শনাক্তকরণে"} <br />
              <span className="text-brand-500 underline decoration-brand-200 underline-offset-8">{language === "en" ? "Detection for Crops" : "এআই প্রযুক্তি"}</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {t("home.ai_desc")}
            </p>
            <ul className="space-y-6 mb-10">
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{t("home.ai_accuracy")}</h4>
                  <p className="text-sm text-gray-500">{t("home.ai_accuracy_desc")}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Zap className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{t("home.ai_instant")}</h4>
                  <p className="text-sm text-gray-500">{t("home.ai_instant_desc")}</p>
                </div>
              </li>
            </ul>
            <Link 
              to="/ai-detector" 
              className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-brand-600 transition-all transform hover:scale-105"
            >
              {t("home.try_ai")} <Zap className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>



      {/* How it works */}
      <section className="py-24 px-6 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto mb-16">
          <span className="text-brand-600 font-bold text-sm uppercase tracking-widest mb-4 block">{t("home.process_label")}</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">{t("home.how_it_works")}</h2>
          <p className="text-lg text-gray-600">{t("home.how_it_works_desc")}</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: t("home.step1_title"), desc: t("home.step1_desc"), icon: <Leaf className="w-8 h-8" /> },
            { title: t("home.step2_title"), desc: t("home.step2_desc"), icon: <ShoppingCart className="w-8 h-8" /> },
            { title: t("home.step3_title"), desc: t("home.step3_desc"), icon: <TrendingUp className="w-8 h-8" /> },
          ].map((item, i) => (
            <div key={item.title} className="bg-white p-12 rounded-[3.5rem] shadow-sm relative">
              <div className="w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-brand-500/20">
                {item.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-gray-900">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 glass flex items-center justify-center rounded-full font-bold text-brand-600 border-2 border-white">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      </section>


    </div>
  );
}
