import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { 
  TrendingUp, Users, ShoppingBag, DollarSign, Leaf, MapPin, 
  ChevronRight, Calendar, AlertCircle, Plus, Send, RefreshCw,
  Sun, CloudRain, ThermometerSun, Wind, Droplets, Cloud, Package
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { useLanguage } from "../contexts/LanguageContext";
import { useProducts } from "../contexts/ProductContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

const SALES_DATA = [
  { name: "Mon", sales: 4000 },
  { name: "Tue", sales: 3000 },
  { name: "Wed", sales: 2000 },
  { name: "Thu", sales: 2780 },
  { name: "Fri", sales: 1890 },
  { name: "Sat", sales: 2390 },
  { name: "Sun", sales: 3490 },
];

export default function FarmerDashboard() {
  const { t, language } = useLanguage();
  const { addProduct, orders, updateOrderStatus } = useProducts();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) return null;
  if (!user) return null;
  
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: language === "bn" ? 'হ্যালো, আমি আপনার এআই ফার্মিং অ্যাসিস্ট্যান্ট। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?' : "Hello, I’m your AI Farming Assistant. How can I help you optimize your crops today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weather, setWeather] = useState<{ 
    temp: number, 
    condition: string, 
    moisture: number,
    windSpeed: string,
    rainChance: number,
    forecast: any[],
    location: string
  } | null>(null);

  // New crop form state
  const [formData, setFormData] = useState({
    name: "",
    unit: "kg",
    price: "",
    category: "Vegetables",
    description: "",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleListProduct = async () => {
    if (!formData.name || !formData.price || !formData.unit) {
      toast.error(language === "bn" ? "দয়া করে সব ঘর পূরণ করুন" : "Please fill all fields");
      return;
    }

    try {
      await addProduct({
        name: formData.name,
        price: Number(formData.price),
        unit: formData.unit,
        image: formData.image,
        category: formData.category,
        stock: 100,
        description: formData.description || "Fresh from open field."
      });

      setIsModalOpen(false);
      setFormData({
        name: "",
        unit: "kg",
        price: "",
        category: "Vegetables",
        description: "",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
      });
      toast.success(language === "bn" ? "সফলভাবে তালিকাভুক্ত করা হয়েছে!" : "Listed successfully!");
    } catch (err) {
      toast.error(language === "bn" ? "পণ্য যোগ করতে ত্রুটি হয়েছে" : "Error adding product");
    }
  };

  const totalEarnings = orders
    .filter(o => ['paid', 'shipment_accepted', 'collected', 'shipped', 'delivered'].includes(o.status))
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const stats = [
    { label: language === "bn" ? "মোট আয়" : "Total Earnings", value: language === "bn" ? `${totalEarnings}৳` : `$${totalEarnings}`, trend: "+১২%", icon: <DollarSign />, color: "bg-brand-600 text-white" },
    { label: language === "bn" ? "বিক্রিত পণ্য" : "Products Sold", value: orders.filter(o => o.status === 'delivered').length.toString(), trend: "+8%", icon: <ShoppingBag />, color: "bg-brand-600 text-white" },
    { label: language === "bn" ? "অপেক্ষমান অর্ডার" : "Pending Orders", value: orders.filter(o => o.status === 'pending').length.toString(), trend: "+5%", icon: <Users />, color: "bg-brand-600 text-white" },
    { label: language === "bn" ? "ফসলের স্বাস্থ্য" : "Crop Health", value: "94%", trend: language === "bn" ? "স্থির" : "Stable", icon: <Leaf />, color: "bg-brand-600 text-white" },
  ];

  const analyticsData = language === "en"
    ? [
        { name: "Week 1", revenue: 12000, organic: 8000 },
        { name: "Week 2", revenue: 15000, organic: 10000 },
        { name: "Week 3", revenue: 11000, organic: 7000 },
        { name: "Week 4", revenue: 18000, organic: 13000 },
      ]
    : [
        { name: "সপ্তাহ ১", revenue: 12000, organic: 8000 },
        { name: "সপ্তাহ ২", revenue: 15000, organic: 10000 },
        { name: "সপ্তাহ ৩", revenue: 11000, organic: 7000 },
        { name: "সপ্তাহ ৪", revenue: 18000, organic: 13000 },
      ];

  const forecast = [
    { day: language === "en" ? 'Mon' : 'সোম', icon: '☀️' },
    { day: language === "en" ? 'Tue' : 'মঙ্গল', icon: '☁️' },
    { day: language === "en" ? 'Wed' : 'বুধ', icon: '☀️' },
    { day: language === "en" ? 'Thu' : 'Thu', icon: '🌧️' }
  ];

  const getWeatherDesc = (code: number) => {
    const isBn = language === "bn";
    const mapping: Record<number, string> = {
      0: isBn ? "পরিষ্কার আকাশ" : "Clear Sky",
      1: isBn ? "প্রধানত পরিষ্কার" : "Mainly Clear",
      2: isBn ? "আংশিক মেঘলা" : "Partly Cloudy",
      3: isBn ? "মেঘলা আকাশ" : "Overcast",
      45: isBn ? "কুয়াশা" : "Fog",
      48: isBn ? "তুষার কুয়াশা" : "Rime Fog",
      51: isBn ? "হালকা গুঁড়িগুঁড়ি বৃষ্টি" : "Light Drizzle",
      53: isBn ? "মাঝারি গুঁড়িগুঁড়ি বৃষ্টি" : "Moderate Drizzle",
      55: isBn ? "ভারী গুঁড়িগুঁড়ি বৃষ্টি" : "Dense Drizzle",
      61: isBn ? "হালকা বৃষ্টি" : "Slight Rain",
      63: isBn ? "মাঝারি বৃষ্টি" : "Moderate Rain",
      65: isBn ? "ভারী বৃষ্টি" : "Heavy Rain",
      71: isBn ? "হালকা তুষারপাত" : "Slight Snow",
      73: isBn ? "মাঝারি তুষারপাত" : "Moderate Snow",
      75: isBn ? "ভারী তুষারপাত" : "Heavy Snow",
      80: isBn ? "হালকা বৃষ্টিঝরনা" : "Slight Rain Showers",
      81: isBn ? "মাঝারি বৃষ্টিঝরনা" : "Moderate Rain Showers",
      82: isBn ? "হিংস্র বৃষ্টিঝরনা" : "Violent Rain Showers",
      95: isBn ? "বজ্রবৃষ্টি" : "Thunderstorm",
      96: isBn ? "শিলাবৃষ্টিসহ বজ্রবৃষ্টি" : "Thunderstorm with Hail",
      99: isBn ? "ভারী শিলাবৃষ্টিসহ বজ্রবৃষ্টি" : "Thunderstorm with Heavy Hail",
    };
    return mapping[code] || (isBn ? "অজানা" : "Unknown");
  };

  const fetchWeatherData = async (lat: number = 23.81, lon: number = 90.41, locationName?: string) => {
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
      if (!response.ok) throw new Error("Weather API limit exceeded");
      const data = await response.json();
      
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const daysBn = ["সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি", "রবি"];

      const forecastData = data.daily.time.slice(1, 6).map((time: string, i: number) => {
        const date = new Date(time);
        const dayIndex = date.getDay(); // 0 is Sunday
        const dayName = language === "bn" ? daysBn[(dayIndex + 6) % 7] : days[(dayIndex + 6) % 7];
        
        return {
          day: dayName,
          condition: getWeatherDesc(data.daily.weather_code[i+1]),
          high: Math.round(data.daily.temperature_2m_max[i+1]),
          low: Math.round(data.daily.temperature_2m_min[i+1]),
          rainChance: data.daily.precipitation_probability_max[i+1],
          code: data.daily.weather_code[i+1]
        };
      });

      setWeather({
        temp: Math.round(data.current.temperature_2m),
        condition: getWeatherDesc(data.current.weather_code),
        moisture: data.current.relative_humidity_2m,
        windSpeed: `${data.current.wind_speed_10m} ${language === "bn" ? "কিমি/ঘ" : "km/h"}`,
        rainChance: data.daily.precipitation_probability_max[0],
        forecast: forecastData,
        location: locationName || (language === "bn" ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh")
      });
    } catch (err) {
      console.error("Weather error:", err);
      if (!weather) {
          setWeather({
              temp: 30,
              condition: language === "bn" ? "অজানা" : "Unknown",
              moisture: 70,
              windSpeed: "10 km/h",
              rainChance: 0,
              forecast: [],
              location: language === "bn" ? "সংযোগ বিচ্ছিন" : "Offline Mode"
          });
      }
    }
  };

  const initWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude, language === "bn" ? "আপনার অবস্থান" : "Your Location");
        },
        (error) => {
          console.warn("Geolocation blocked or failed:", error.message);
          fetchWeatherData(); // Fallback to Dhaka
        },
        { timeout: 10000 }
      );
    } else {
      fetchWeatherData();
    }
  };

  useEffect(() => {
    initWeather();
  }, [language]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    const currentHistory = [...chatHistory];
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg,
          history: currentHistory.map(h => ({ role: h.role, text: h.text }))
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }
      
      setChatHistory(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (err: any) {
      console.error("Chat Error:", err);
      const errorMsg = language === "bn" 
        ? "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।" 
        : (err.message || "Sorry, I'm having trouble connecting right now.");
      setChatHistory(prev => [...prev, { role: 'ai', text: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-900/5 pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-900/60 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-xl p-10 rounded-[4rem] shadow-2xl relative border border-brand-100"
              >
                <div className="text-center mb-10">
                  <div className="bg-brand-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-brand-100">
                    <Plus className="w-10 h-10 text-brand-600" />
                  </div>
                  <h2 className="text-3xl font-black text-brand-950 tracking-tight">{language === "bn" ? "নতুন ফসল তালিকাভুক্ত করুন" : "List New Crop"}</h2>
                  <p className="text-brand-900/60 font-black uppercase tracking-[0.2em] text-[10px] mt-1">{language === "bn" ? "আপনার পণ্যের বিবরণ দিন" : "Enter your crop details"}</p>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-center mb-6">
                     <div className="relative group">
                       <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-3xl border-4 border-brand-50 shadow-xl"
                       />
                       <label className="absolute inset-0 bg-brand-950/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-black text-[10px] uppercase tracking-widest backdrop-blur-sm">
                          {language === "bn" ? "ছবি পরিবর্তন" : "Change Image"}
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                       </label>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-900/40 uppercase tracking-widest ml-3">{language === "bn" ? "ফসলের নাম" : "Crop Name"}</label>
                        <input 
                          value={formData.name}
                          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                          className="w-full bg-brand-50 border-2 border-transparent focus:border-brand-500 focus:bg-white p-4 rounded-2xl outline-none font-bold text-brand-950 transition-all" 
                          placeholder={language === "bn" ? "উদা: আম" : "e.g. Mango"} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-900/40 uppercase tracking-widest ml-3">{language === "bn" ? "পরিমাণ" : "Quantity"}</label>
                        <input 
                          value={formData.unit}
                          onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))}
                          className="w-full bg-brand-50 border-2 border-transparent focus:border-brand-500 focus:bg-white p-4 rounded-2xl outline-none font-bold text-brand-950 transition-all" 
                          placeholder={language === "bn" ? "উদা: ৫০ কেজি" : "e.g. 50kg"} 
                        />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-900/40 uppercase tracking-widest ml-3">{language === "bn" ? "মূল্য (৳)" : "Price (৳)"}</label>
                        <input 
                          type="number"
                          value={formData.price}
                          onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
                          className="w-full bg-brand-50 border-2 border-transparent focus:border-brand-500 focus:bg-white p-4 rounded-2xl outline-none font-bold text-brand-950 transition-all" 
                          placeholder={language === "bn" ? "উদা: ১৫০০" : "e.g. 1500"} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-900/40 uppercase tracking-widest ml-3">{language === "bn" ? "ক্যাটাগরি" : "Category"}</label>
                        <select 
                          value={formData.category}
                          onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                          className="w-full bg-brand-50 border-2 border-transparent focus:border-brand-500 focus:bg-white p-4 rounded-2xl outline-none h-[64px] font-bold text-brand-950 transition-all appearance-none"
                        >
                          <option value="Vegetables">{language === "bn" ? "সবজি" : "Vegetables"}</option>
                          <option value="Fruits">{language === "bn" ? "ফল" : "Fruits"}</option>
                          <option value="Grains">{language === "bn" ? "শস্য" : "Grains"}</option>
                          <option value="Dairy">{language === "bn" ? "দুগ্ধজাত" : "Dairy"}</option>
                        </select>
                    </div>
                   </div>
                </div>

                <div className="flex gap-4 mt-10">
                   <button onClick={() => setIsModalOpen(false)} className="flex-grow bg-brand-100 text-brand-900 font-black py-5 rounded-2xl transition-all hover:bg-brand-200">{language === "bn" ? "বাতিল করুন" : "Cancel"}</button>
                   <button onClick={handleListProduct} className="flex-grow bg-brand-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-brand-600/30 transition-all hover:scale-105 active:scale-95">{language === "bn" ? "জমা দিন" : "Submit"}</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-brand-600 font-black uppercase tracking-[0.2em] text-[10px] mb-3">
              <MapPin className="w-4 h-4" /> {language === "bn" ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh"}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-brand-950 tracking-tighter">
              {language === "bn" ? "স্বাগতম, " : "Welcome, "}
              <span className="text-brand-600">{user?.name || (language === "bn" ? "কৃষক" : "Farmer")}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={initWeather}
              className="bg-white border border-brand-100 p-4 rounded-2xl hover:bg-brand-50 transition-all font-black text-sm flex items-center gap-3 shadow-sm text-brand-900"
             >
               <RefreshCw className="w-5 h-5 text-brand-600" /> {language === "bn" ? "হালনাগাদ" : "Update"}
             </button>
             <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-brand-950 transition-all shadow-2xl shadow-brand-600/30 flex items-center gap-3 text-lg"
             >
               <Plus className="w-5 h-5" /> {language === "bn" ? "ফসল যোগ করুন" : "Add Crop"}
             </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[3rem] border border-brand-100 hover:shadow-2xl transition-all group overflow-hidden relative shadow-sm"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 shadow-xl", stat.color)}>
                  {stat.icon}
                </div>
                <div className="px-4 py-1.5 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100">
                  {stat.trend}
                </div>
              </div>
              <div className="text-[10px] font-black text-brand-900/40 uppercase tracking-[0.2em] mb-2 relative z-10">{stat.label}</div>
              <div className="text-4xl font-black text-brand-950 tracking-tight relative z-10">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Charts & Orders */}
          <div className="lg:col-span-2 space-y-10">
            {/* Sales Chart */}
            <div className="bg-white p-10 rounded-[4rem] border border-brand-100 shadow-sm relative overflow-hidden">
               <div className="flex items-center justify-between mb-10">
                 <h3 className="text-2xl font-black text-brand-950 tracking-tight uppercase">{language === "en" ? "Revenue Analytics" : "আয় বিশ্লেষণ"}</h3>
                 <div className="flex bg-brand-50 p-1.5 rounded-2xl border border-brand-100">
                    <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-600/20">{language === "en" ? "Weekly" : "সাপ্তাহিক"}</button>
                    <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-brand-900/40">{language === "en" ? "Monthly" : "মাসিক"}</button>
                 </div>
               </div>
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                      <Area type="monotone" dataKey="organic" stroke="#10b981" strokeWidth={4} fillOpacity={0} />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-10 rounded-[4rem] border border-brand-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black text-brand-950 tracking-tight uppercase">{language === "en" ? "Recent Orders" : "সাম্প্রতিক অর্ডার"}</h3>
                  <Link to="#" className="text-brand-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group">
                    {language === "en" ? "Full History" : "সম্পূর্ণ ইতিহাস"} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
                <div className="space-y-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-16 text-brand-900/40 font-black uppercase tracking-widest text-xs">
                      {language === "bn" ? "কোনো অর্ডার পাওয়া যায়নি" : "No orders found"}
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-brand-50/50 rounded-[2.5rem] group hover:bg-brand-50 transition-all border border-brand-100/50 hover:border-brand-200 gap-6">
                        <div className="flex items-center gap-6">
                          <div className="bg-white p-4 rounded-2xl shadow-xl border border-brand-100 text-brand-600 font-black text-[10px] tracking-tighter">
                            #{order.id.slice(-4).toUpperCase()}
                          </div>
                          <div>
                            <Link 
                              to={`/profile/${order.buyerId}-buyer`} 
                              className="font-black text-brand-950 text-xl tracking-tight hover:text-brand-600 transition-colors uppercase block"
                            >
                              {order.buyerName}
                            </Link>
                            <div className="text-xs font-bold text-brand-900/60 mt-1 flex items-center gap-2">
                               <Package className="w-3.5 h-3.5 text-brand-400" /> {order.productName} ({order.quantity})
                            </div>
                            {order.deliveryAddress && (
                              <div className="text-[10px] text-brand-900/40 font-black uppercase tracking-widest mt-2 border-l-2 border-brand-200 pl-3">
                                {order.deliveryAddress.street}, {order.deliveryAddress.city}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-10 flex-grow pt-6 md:pt-0 border-t md:border-t-0 border-brand-100">
                          <div className="text-left md:text-right">
                             <div className="text-[10px] font-black text-brand-900/40 uppercase tracking-widest mb-1">Total Amount</div>
                             <div className="text-2xl font-black text-brand-950 tracking-tighter">৳{order.totalAmount}</div>
                             <div className={cn(
                               "text-[10px] font-black uppercase tracking-[0.2em] mt-2 inline-block px-3 py-1 rounded-full border",
                               order.status === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                               order.status === 'shipped' ? "bg-blue-50 text-blue-600 border-blue-100" :
                               order.status === 'collected' ? "bg-orange-50 text-orange-600 border-orange-100" :
                               order.status === 'paid' ? "bg-purple-50 text-purple-600 border-purple-100" :
                               "bg-brand-50 text-brand-900/40 border-brand-200"
                             )}>
                               {language === "bn" ? (
                                 order.status === 'pending' ? 'অপেক্ষমান' :
                                 order.status === 'accepted' ? 'গৃহীত' :
                                 order.status === 'rejected' ? 'বাতিল' :
                                 order.status === 'paid' ? 'পরিশোধিত' :
                                 order.status === 'shipment_accepted' ? 'পরিবহনকারী নিয়েছে' :
                                 order.status === 'collected' ? 'সংগৃহীত' :
                                 order.status === 'shipped' ? 'পরিবহনে' :
                                 order.status === 'delivered' ? 'পৌঁছেছে' : order.status
                               ) : order.status.replace('_', ' ')}
                             </div>
                          </div>
                          <div className="flex gap-2">
                              {order.status === 'pending' && (
                                <>
                                  <button 
                                   onClick={() => updateOrderStatus(order.id, 'accepted')}
                                   className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                                  >
                                    {language === "bn" ? "গ্রহণ করুন" : "Accept"}
                                  </button>
                                  <button 
                                   onClick={() => updateOrderStatus(order.id, 'rejected')}
                                   className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                  >
                                    {language === "bn" ? "বাতিল করুন" : "Reject"}
                                  </button>
                                </>
                              )}
                             {/* Note: Farmer doesn't need to mark shipped if transporter is involved, but we keep it as fallback */}
                             {order.status === 'paid' && (
                               <div className="text-[10px] font-bold text-gray-400 italic">
                                 {language === "bn" ? "পরিবহনকারীর অপেক্ষায়" : "Awaiting Transporter"}
                               </div>
                             )}
                             {order.status === 'shipment_accepted' && (
                               <div className="text-[10px] font-bold text-blue-600 italic">
                                 {language === "bn" ? "পরিবহনকারী আসছে" : "Transporter is coming"}
                               </div>
                             )}
                             {order.status === 'collected' && (
                               <div className="text-[10px] font-bold text-orange-600 italic">
                                 {language === "bn" ? "ফার্ম থেকে সংগ্রহ করা হয়েছে" : "Picked up from farm"}
                               </div>
                             )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-10">
            {/* Weather Widget */}
              <div className="bg-gradient-to-br from-brand-900 to-emerald-950 p-8 rounded-[4rem] text-white overflow-hidden relative shadow-2xl">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                       <div className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-1">
                        {language === "bn" ? "Local Weather" : "Current Weather"}
                       </div>
                       <h3 className="text-2xl font-black tracking-tight">{weather?.condition || (language === "bn" ? "লোড হচ্ছে..." : "Loading...")}</h3>
                     </div>
                     <div className="bg-white/10 p-5 rounded-[2rem] backdrop-blur-xl border border-white/10">
                        <Sun className="w-10 h-10 text-brand-400" />
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-8 mb-12">
                     <div className="text-7xl font-black tracking-tighter drop-shadow-2xl">{weather?.temp || "--"}°</div>
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 text-brand-200 text-sm font-medium">
                           <MapPin className="w-4 h-4" /> {weather?.location || (language === "bn" ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh")}
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-2 text-xs font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                              <Droplets className="w-4 h-4 text-brand-400" /> {weather?.moisture}%
                           </div>
                           <div className="flex items-center gap-2 text-xs font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                              <Wind className="w-4 h-4 text-brand-400" /> {weather?.windSpeed}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-white/20">
                    <div className="text-xs font-black uppercase tracking-widest text-brand-200">
                      {language === "bn" ? "৫ দিনের পূর্বাভাস" : "5-Day Forecast"}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {weather?.forecast.map((item, i) => (
                        <div key={i} className="bg-white/10 p-3 rounded-2xl text-center backdrop-blur-sm hover:bg-white/20 transition-all cursor-default group">
                          <div className="text-[10px] font-black uppercase mb-2 opacity-60">{item.day}</div>
                          <div className="mb-3 flex justify-center">
                            {item.code === 0 ? (
                                <Sun className="w-5 h-5 text-yellow-300" />
                            ) : [1, 2, 3].includes(item.code) ? (
                                <Cloud className="w-5 h-5 text-brand-200" />
                            ) : item.code >= 61 && item.code <= 65 ? (
                                <CloudRain className="w-5 h-5 text-blue-300" />
                            ) : item.code >= 95 ? (
                                <AlertCircle className="w-5 h-5 text-red-300" />
                            ) : (
                                <Sun className="w-5 h-5 text-yellow-300" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-black">{item.high}°</div>
                            <div className="text-[10px] opacity-60 font-bold">{item.low}°</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -ml-20 -mb-20"></div>
            </div>

            {/* AI Assistant Chatbot */}
            <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col h-[500px]">
               <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-3">
                 {language === "bn" ? "এআই অ্যাসিস্ট্যান্ট" : "AI Assistant"} <div className="w-2 h-2 bg-green-500 rounded-full animate-blink" />
               </h3>
               <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-6 scrollbar-hide">
                 {chatHistory.map((item, i) => (
                   <div key={i} className={cn(
                     "p-4 rounded-2xl text-sm leading-relaxed",
                     item.role === 'user' 
                      ? "bg-brand-600 text-white ml-8 shadow-lg shadow-brand-600/10" 
                      : "bg-brand-50 text-gray-800 mr-8 border border-brand-100"
                   )}>
                     {item.text}
                   </div>
                 ))}
                 {isTyping && (
                   <div className="bg-gray-100 text-gray-400 p-4 rounded-2xl mr-8 text-xs flex gap-1">
                     <span className="animate-bounce">.</span>
                     <span className="animate-bounce delay-75">.</span>
                     <span className="animate-bounce delay-150">.</span>
                   </div>
                 )}
               </div>
               <div className="flex gap-2 p-2 glass bg-white rounded-2xl shadow-inner border border-gray-100">
                 <input 
                   value={chatInput}
                   onChange={e => setChatInput(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                   placeholder={language === "bn" ? "সার, কীটনাশক নিয়ে প্রশ্ন করুন..." : "Ask about fertilizer, pests..."} 
                   className="flex-grow bg-transparent border-none outline-none px-4 text-sm font-medium"
                 />
                 <button 
                  onClick={handleSendMessage}
                  className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
                 >
                   <Send className="w-5 h-5" />
                 </button>
               </div>
            </div>

            {/* Market Alerts */}
            <div className="bg-brand-50 p-8 rounded-[3rem] border border-brand-100 shadow-sm">
               <h4 className="font-bold flex items-center gap-2 text-brand-800 mb-4 text-sm uppercase tracking-wider">
                 <AlertCircle className="w-4 h-4" /> {language === "bn" ? "বাজার সতর্কতা" : "Market Alert"}
               </h4>
               <p className="text-xs text-brand-700 font-medium leading-relaxed">
                 {language === "bn" 
                  ? 'ঢাকায় "হিমসাগর আম" এর দাম এই সপ্তাহে ৫% বৃদ্ধি পেয়েছে। লাভের জন্য দ্রুত বিক্রির কথা বিবেচনা করুন।'
                  : 'The price for "Himsagar Mango" has increased by 5% this week in Dhaka. Consider selling early for better profits.'}
               </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-blink { animation: blink 1.5s infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
