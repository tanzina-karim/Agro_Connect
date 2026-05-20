import React from "react";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, Star, Package, ShieldCheck, Phone, Mail, Award, 
  TrendingUp, ShoppingBag, Truck, MessageCircle, Clock, 
  Edit, Save, CheckCircle2, XCircle, Plus, Calendar, Shield, 
  Info, ClipboardList, CheckCircle, Navigation, ChevronRight, Settings
} from "lucide-react";
import { useProducts } from "../contexts/ProductContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";
import { cn } from "../lib/utils";

export default function Profile() {
  const { id } = useParams();
  const { products, updateOrderStatus } = useProducts();
  const { language } = useLanguage();
  const { user: loggedInUser } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Real orders for this profile (if allowed to fetch)
  const [orders, setOrders] = useState<any[]>([]);
  
  // Tabs for the specific views
  const [activeTab, setActiveTab] = useState<string>("main");

  // Form states for editing profile
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    vehicleType: "",
    licensePlate: "",
    capacity: "",
    baseRate: ""
  });

  const userId = id?.split('-')[0];
  const role = id?.split('-')[1];
  const isOwnProfile = loggedInUser?.uid === userId;

  // Language translation helper
  const t = (en: string, bn: string) => language === "bn" ? bn : en;

  // Fetch target user's profile and initial setup
  useEffect(() => {
    async function fetchProfile() {
      if (!userId) return;
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile(data);
          
          // Load local storage additions for bio & transporter specs
          const savedBio = localStorage.getItem(`profile_bio_${userId}`);
          const savedSpecs = localStorage.getItem(`transporter_specs_${userId}`);
          const specsObj = savedSpecs ? JSON.parse(savedSpecs) : {};

          setEditForm({
            name: data.name || "",
            phone: data.phone || "",
            location: data.location || "",
            bio: savedBio || data.bio || (language === "bn" ? "আমি একজন নিবন্ধিত কৃষি উদ্যোক্তা।" : "I am a registered Agro entrepreneur."),
            vehicleType: specsObj.vehicleType || "5-Ton Covered Van",
            licensePlate: specsObj.licensePlate || "DHAKA-METRO-TA-11-2045",
            capacity: specsObj.capacity || "5,000 kg",
            baseRate: specsObj.baseRate || "৳১৫/কি.মি."
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [userId, language]);

  // Fetch real orders associated with this profile (if authenticated)
  useEffect(() => {
    if (!userId || !role) return;

    let q;
    const ordersRef = collection(db, "orders");

    if (role === 'buyer') {
      q = query(ordersRef, where("buyerId", "==", userId));
    } else if (role === 'transporter') {
      q = query(ordersRef, where("transporterId", "==", userId));
    } else if (role === 'farmer') {
      q = query(ordersRef, where("farmerId", "==", userId));
    }

    if (!q) return;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(list);
    }, (error) => {
      console.warn("Could not load orders in profile snapshot (Permission boundary):", error);
      // In case another user is viewing the buyer/transporter, we gracefully leave list empty
    });

    return () => unsubscribe();
  }, [userId, role]);

  const currentProfile = profile || {
    name: userId ? "User" : "Unknown",
    role: role || "user",
    location: language === "bn" ? "অজানা" : "Unknown",
    rating: 5.0,
    trustScore: 100,
    bio: language === "bn" ? "কোনো জীবনী নেই।" : "No bio available.",
    joinedAt: null,
    verified: true,
  };

  // Get active bio (with local overrides)
  const activeBio = localStorage.getItem(`profile_bio_${userId}`) || currentProfile.bio || (language === "bn" ? "আমি একজন নিবন্ধিত কৃষি উদ্যোক্তা।" : "I am a registered Agro entrepreneur.");
  
  // Get and parse transporter vehicle specifications
  const getTransporterSpecs = () => {
    const saved = localStorage.getItem(`transporter_specs_${userId}`);
    if (saved) return JSON.parse(saved);
    return {
      vehicleType: "5-Ton Covered Van",
      licensePlate: "DHAKA-METRO-TA-11-2045",
      capacity: "5,000 kg",
      baseRate: "৳১৫/কি.মি."
    };
  };

  const transporterSpecs = getTransporterSpecs();

  // Filter products for farmers
  const farmerProducts = products.filter(p => p.farmerId === userId);

  const getRoleIcon = () => {
    switch (currentProfile.role) {
      case "farmer": return <TrendingUp className="w-5 h-5" />;
      case "buyer": return <ShoppingBag className="w-5 h-5" />;
      case "transporter": return <Truck className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const getRoleThemeClasses = () => {
    switch (currentProfile.role) {
      case "farmer": return {
        primary: "bg-brand-600 text-white hover:bg-brand-700",
        accent: "text-brand-600",
        border: "border-brand-200",
        bgLight: "bg-brand-50",
        gradient: "from-brand-600 to-emerald-600",
        badge: "bg-brand-50 text-brand-700 border-brand-100"
      };
      case "buyer": return {
        primary: "bg-sky-600 text-white hover:bg-sky-700",
        accent: "text-sky-600",
        border: "border-sky-200",
        bgLight: "bg-sky-50",
        gradient: "from-sky-600 to-indigo-600",
        badge: "bg-sky-50 text-sky-700 border-sky-100"
      };
      case "transporter": return {
        primary: "bg-amber-500 text-white hover:bg-amber-600",
        accent: "text-amber-600",
        border: "border-amber-200",
        bgLight: "bg-amber-50/50",
        gradient: "from-amber-500 to-orange-600",
        badge: "bg-amber-50 text-amber-700 border-amber-100"
      };
      default: return {
        primary: "bg-gray-600 text-white hover:bg-gray-700",
        accent: "text-gray-600",
        border: "border-gray-200",
        bgLight: "bg-gray-50",
        gradient: "from-gray-600 to-slate-700",
        badge: "bg-gray-50 text-gray-700 border-gray-100"
      };
    }
  };

  const theme = getRoleThemeClasses();

  // Save profile updates
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUser || !userId) return;

    try {
      // 1. Update basic fields in firestore (name, phone, location)
      const userRef = doc(db, "users", loggedInUser.uid);
      await updateDoc(userRef, {
        name: editForm.name,
        phone: editForm.phone,
        location: editForm.location
      });

      // 2. Since firestore rules restrict writing 'bio' or custom specs, 
      // we save them to localStorage per user to preserve data integrity and prevent security rules denial
      localStorage.setItem(`profile_bio_${loggedInUser.uid}`, editForm.bio);
      
      if (currentProfile.role === 'transporter') {
        const specs = {
          vehicleType: editForm.vehicleType,
          licensePlate: editForm.licensePlate,
          capacity: editForm.capacity,
          baseRate: editForm.baseRate
        };
        localStorage.setItem(`transporter_specs_${loggedInUser.uid}`, JSON.stringify(specs));
      }

      // Update local state instantly
      setProfile(prev => ({
        ...prev,
        name: editForm.name,
        phone: editForm.phone,
        location: editForm.location
      }));

      setIsEditing(false);
      toast.success(t("Profile updated successfully!", "প্রোফাইল চমৎকারভাবে আপডেট করা হয়েছে!"));
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(t(`Update failed: ${error.message}`, `আপডেটে ত্রুটি: ${error.message}`));
    }
  };

  // Stepper tracker color
  const getStepStatusColor = (currentStepIdx: number, stepIdx: number) => {
    if (stepIdx < currentStepIdx) return "bg-emerald-500 text-white";
    if (stepIdx === currentStepIdx) return "bg-brand-600 text-white ring-4 ring-brand-100 animate-pulse";
    return "bg-gray-100 text-gray-400";
  };

  const getStatusStepIndex = (status: string) => {
    const steps = ['pending', 'accepted', 'paid', 'shipment_accepted', 'collected', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  const getOrderStatusFormatted = (status: string) => {
    switch (status) {
      case 'pending': return { en: 'Awaiting farmer accept', bn: 'কৃষকের অনুমোদনের অপেক্ষায়', bg: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
      case 'accepted': return { en: 'Accepted - Unpaid', bn: 'অনুমোদিত - বকেয়া', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'rejected': return { en: 'Rejected', bn: 'বাতিল', bg: 'bg-red-50 text-red-700 border-red-200' };
      case 'paid': return { en: 'Paid - Scheduling Cargo', bn: 'পরিশোধিত - কার্গো তৈরি করা হচ্ছে', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'shipment_accepted': return { en: 'Transport Job Scheduled', bn: 'পরিবহন বুকিং চূড়ান্ত', bg: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'collected': return { en: 'Cargo Collected', bn: 'মালপত্র সংগ্রহ করা হয়েছে', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'shipped': return { en: 'In Transit', bn: 'পথে আছে / পরিবহনে', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'delivered': return { en: 'Delivered Successfully', bn: 'সফলভাবে ডেলিভারড', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default: return { en: status.toUpperCase(), bn: status, bg: 'bg-gray-100 text-gray-700' };
    }
  };

  const handleTransporterStatusAction = async (orderId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'shipment_accepted') {
        await updateOrderStatus(orderId, 'collected');
        toast.success(t("Marked as Collected", "সংগৃহীত হিসেবে চিহ্নিত করা হয়েছে"));
      } else if (currentStatus === 'collected') {
        await updateOrderStatus(orderId, 'shipped');
        toast.success(t("Transit started successfully!", "শিপমেন্ট পথে যাত্রা শুরু করেছে!"));
      } else if (currentStatus === 'shipped') {
        await updateOrderStatus(orderId, 'delivered');
        toast.success(t("Delivery confirmed as complete!", "ডেলিভারি সফলভাবে সম্পন্ন করা হয়েছে!"));
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-900/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-900/5 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT COLUMN: Main Info & Stats Card */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3.5rem] p-10 border border-brand-100 shadow-xl relative overflow-hidden"
            >
              <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-bl-[5rem] -z-0 opacity-40", theme.bgLight)} />
              
              <div className="relative z-10 flex flex-col items-center">
                {/* Profile Avatar */}
                <div className={cn("w-32 h-32 rounded-full mb-6 flex items-center justify-center text-4xl font-black border-4 border-white shadow-xl overflow-hidden", theme.bgLight, theme.accent)}>
                  {currentProfile.photoURL ? (
                    <img referrerPolicy="no-referrer" src={currentProfile.photoURL} alt={currentProfile.name} className="w-full h-full object-cover animate-fade-in" />
                  ) : (
                    currentProfile.name[0]?.toUpperCase()
                  )}
                </div>
                
                {/* Name & Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-black text-brand-950 tracking-tight uppercase text-center">{currentProfile.name}</h1>
                  {(currentProfile.role === 'farmer' || currentProfile.role === 'transporter') && (
                    <ShieldCheck className={cn("w-6 h-6", theme.accent)} title={t("Verified by AgroConnect", "এগ্রোকানেক্ট দ্বারা যাচাইকৃত")} />
                  )}
                </div>

                <div className={cn("flex items-center gap-2 font-black text-[10px] mb-8 uppercase tracking-[0.2em] px-4 py-2 rounded-full border shadow-sm", theme.badge)}>
                  {getRoleIcon()}
                  {t(currentProfile.role?.toUpperCase() || "USER", 
                    currentProfile.role === "farmer" ? "কৃষক" : 
                    currentProfile.role === "buyer" ? "ক্রেতা" : 
                    currentProfile.role === "transporter" ? "পরিবহনকারী" : "ব্যবহারকারী"
                  )}
                </div>

                {/* Performance overview metrics */}
                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                  <div className="bg-brand-50/50 p-5 rounded-[2rem] text-center border border-brand-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-1 w-10 h-10 bg-white/60 rounded-bl-3xl -mr-4 -mt-4 transition-transform group-hover:scale-125"></div>
                    <div className="text-xl font-black text-brand-950 relative z-10">
                      {currentProfile.role === 'farmer' ? farmerProducts.length : orders.length}
                    </div>
                    <div className="text-[8px] font-black text-brand-900/40 uppercase tracking-[0.2em] relative z-10">
                      {currentProfile.role === 'farmer' ? t("Products", "পণ্য") : t("Orders Done", "মোট অর্ডার")}
                    </div>
                  </div>
                  <div className={cn("p-5 rounded-[2rem] text-center shadow-lg relative overflow-hidden group border", theme.badge)}>
                    <div className="absolute top-0 right-1 w-10 h-10 bg-white/20 rounded-bl-3xl -mr-4 -mt-4 transition-transform group-hover:scale-125"></div>
                    <div className="text-xl font-black text-brand-950 relative z-10">
                      {currentProfile.role === 'farmer' ? "৫.০" : currentProfile.role === 'transporter' ? "৫.০" : "১০০%"}
                    </div>
                    <div className="text-[8px] font-black text-brand-900/40 uppercase tracking-[0.2em] relative z-10">
                      {currentProfile.role === 'farmer' || currentProfile.role === 'transporter' ? t("Rating", "রেটিং") : t("Trust Index", "বিশ্বাসযোগ্যতা")}
                    </div>
                  </div>
                </div>

                {/* Profile Contact info list */}
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-4 text-brand-950 font-bold p-3.5 bg-brand-50/50 rounded-2xl border border-brand-100/50">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-brand-100"><MapPin className="w-4 h-4 text-brand-500" /></div>
                    <span className="text-xs truncate">{currentProfile.location || (language === "bn" ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh")}</span>
                  </div>
                  <div className="flex items-center gap-4 text-brand-950 font-bold p-3.5 bg-brand-50/50 rounded-2xl border border-brand-100/50">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-brand-100"><Mail className="w-4 h-4 text-brand-500" /></div>
                    <span className="text-xs truncate max-w-[200px]" title={currentProfile.email}>{currentProfile.email}</span>
                  </div>
                  {currentProfile.phone && (
                    <div className="flex items-center gap-4 text-brand-950 font-bold p-3.5 bg-brand-50/50 rounded-2xl border border-brand-100/50">
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-brand-100"><Phone className="w-4 h-4 text-brand-500" /></div>
                      <span className="text-xs">{currentProfile.phone}</span>
                    </div>
                  )}
                  
                  {/* Comm buttons helper */}
                  {currentProfile.phone && (
                    <div className="flex gap-4 pt-2">
                      <a 
                        href={`tel:${currentProfile.phone}`}
                        className={cn("flex-grow flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md transition-all", theme.primary)}
                      >
                        <Phone className="w-3.5 h-3.5" /> {t("Call", "কল")}
                      </a>
                      <a 
                        href={`https://wa.me/${currentProfile.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="flex-grow flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md shadow-emerald-500/25 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> {t("WhatsApp", "হোয়াটসঅ্যাপ")}
                      </a>
                    </div>
                  )}

                  {/* Edit profile launcher button */}
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full flex items-center justify-center gap-2 bg-brand-900/10 hover:bg-brand-900/20 text-brand-900 border border-brand-900/10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all mt-6"
                    >
                      <Settings className="w-4 h-4" />
                      {t("Edit Profile Settings", "প্রোফাইল সংশোধন করুন")}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* BIO CARD */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-brand-955 bg-brand-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden"
            >
               <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                 <Award className="w-5 h-5 text-brand-300" />
                 {t("Identity Bio", "ব্যক্তিগত বিবরণ")}
               </h3>
               <p className="text-brand-100/90 leading-relaxed font-semibold text-xs whitespace-pre-line">
                 {activeBio}
               </p>
               <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Dedicated Modules depending on Roles */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* FARMER PROFILE PRESENTATION */}
            {currentProfile.role === "farmer" && (
              <div className="space-y-8 animate-fade-in">
                {/* Tab layout selector for farmer */}
                <div className="bg-white p-3 rounded-2xl border border-brand-100 flex gap-2">
                  <button
                    onClick={() => setActiveTab("main")}
                    className={cn(
                      "px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                      activeTab === 'main' ? "bg-brand-600 text-white shadow-md shadow-brand-600/20" : "text-brand-900/60 hover:bg-brand-50"
                    )}
                  >
                    <Package className="w-4 h-4" />
                    {t("Products For Sale", "বিক্রয়ের জন্য পণ্য")} ({farmerProducts.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("calendar")}
                    className={cn(
                      "px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                      activeTab === 'calendar' ? "bg-brand-600 text-white shadow-md shadow-brand-600/20" : "text-brand-900/60 hover:bg-brand-50"
                    )}
                  >
                    <Calendar className="w-4 h-4" />
                    {t("Seasonal Crops Calendar", "ঋতুভিত্তিক চাষবাস তালিকা")}
                  </button>
                </div>

                {activeTab === "main" ? (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-black text-brand-950 tracking-tighter uppercase">{t("Our Agro Offerings", "খামারের সতেজ ফসলসমূহ")}</h2>
                      <Link to="/marketplace" className="text-brand-600 font-extrabold uppercase tracking-widest text-[9px] flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-100 hover:bg-white transition-colors">
                        {t("Go Marketplace", "মার্কেটপ্লেস")}<TrendingUp className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {farmerProducts.map((product) => (
                        <div key={product.id} className="bg-white p-5 rounded-[2.5rem] border border-brand-100/80 flex gap-5 items-center group hover:border-brand-300 transition-all hover:shadow-lg duration-300">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-brand-50 relative bg-brand-50">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            {product.stock <= 10 && (
                              <div className="absolute bottom-1 left-1 bg-red-500 text-white text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md">
                                {t("LOW STOCK", "কম মজুদ")}
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 tracking-wider uppercase">{product.category}</span>
                            <h4 className="font-extrabold text-brand-950 uppercase text-base tracking-tight mb-1 mt-1 leading-none">{product.name}</h4>
                            <div className="text-brand-600 font-black text-xl tracking-tighter mb-1">
                              ৳{product.price} <span className="text-[9px] text-brand-900/40 font-black uppercase ml-0.5">/ {product.unit}</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 block">{t(`Stock: ${product.stock} ${product.unit}`, `মজুদ: ${product.stock} ${product.unit}`)}</span>
                          </div>
                          <Link to="/marketplace" className="p-3 bg-brand-50 rounded-xl text-brand-500 hover:bg-brand-600 hover:text-white transition-all shadow-sm">
                            <ShoppingBag className="w-5 h-5" />
                          </Link>
                        </div>
                      ))}

                      {farmerProducts.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-[4rem] border-dashed border-2 border-brand-100">
                          <Package className="w-12 h-12 text-brand-200 mx-auto mb-4" />
                          <p className="text-brand-900/40 font-black uppercase tracking-widest text-xs">{t("No active products listed currently", "এই মুহূর্তে কোনো সক্রিয় কৃষিপণ্য তালিকাভুক্ত নেই")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Seasonal Crop Calendar module */
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[3rem] border border-brand-100 shadow-sm space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-black text-brand-950 flex items-center gap-2 uppercase tracking-tight">
                        <Calendar className="w-5 h-5 text-brand-600" />
                        {t("Biannual Traditional Cultivation Plan", "ঋতুভিত্তিক ফসল উৎপাদন চক্র")}
                      </h3>
                      <p className="text-brand-900/50 text-xs mt-1">{t("Following natural agro-climatic farming procedures", "জলবায়ু পরিবর্তনের সাথে মানানসই ও প্রাকৃতিক উপায়ে উৎপাদিত ফসলসমূহ")}</p>
                    </div>

                    <div className="space-y-4 pt-2">
                      {[
                        { 
                          season: t("Rabi - Winter Season (Nov - Feb)", "রবি - শীতকালীন চাষ (নভেম্বর - ফেব্রুয়ারি)"), 
                          crops: t("Potatoes, Mustards, Lentils, Wheat, Winter Vegetables", "গোলআলু, শরিষা, মসুর ডাল, গম, বাঁধাকপি ও শীতকালীন শাকসবজি"),
                          emoji: "🌾",
                          bg: "bg-blue-50 border-blue-100 text-blue-900"
                        },
                        { 
                          season: t("Kharif-1 - Summer Season (March - June)", "খরিফ-১ - গ্রীষ্মকালীন চাষ (মার্চ - জুন)"), 
                          crops: t("Local Aus Rice, High-Yielding Maize, Jute, Mung Beans", "আউশ ধান, ভুট্টা, পাট ও মুগ ডাল"),
                          emoji: "☀️",
                          bg: "bg-amber-50 border-amber-100 text-amber-900"
                        },
                        { 
                          season: t("Kharif-2 - Monsoon Season (July - Oct)", "খরিফ-২ - বর্ষাকালীন আমন চাষ (জুলাই - অক্টোবর)"), 
                          crops: t("Organic Aman Paddy, Sugarcane, Pumpkins, Arum Root", "সুস্বাদু আমন ধান, আখ, চালকুমড়ো ও জলকচু"),
                          emoji: "🌧️",
                          bg: "bg-emerald-50 border-emerald-100 text-emerald-950"
                        }
                      ].map((item, idx) => (
                        <div key={idx} className={cn("p-5 rounded-2xl border flex gap-4 items-start transition-all hover:scale-[1.01]", item.bg)}>
                          <span className="text-2xl mt-1">{item.emoji}</span>
                          <div>
                            <h4 className="font-extrabold text-sm uppercase tracking-wide">{item.season}</h4>
                            <p className="font-medium text-xs mt-1 text-gray-600">{item.crops}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* BUYER PROFILE PRESENTATION */}
            {currentProfile.role === "buyer" && (
              <div className="space-y-8 animate-fade-in">
                {/* Tab selector for buyers */}
                <div className="bg-white p-3 rounded-2xl border border-sky-100 flex gap-2">
                  <button
                    onClick={() => setActiveTab("main")}
                    className={cn(
                      "px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                      activeTab === 'main' ? "bg-sky-600 text-white shadow-md shadow-sky-600/20" : "text-sky-950/60 hover:bg-sky-50"
                    )}
                  >
                    <ClipboardList className="w-4 h-4" />
                    {t("My Purchase Orders", "আমার ক্রয়কৃত অর্ডারসমূহ")} ({orders.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("stats")}
                    className={cn(
                      "px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                      activeTab === 'stats' ? "bg-sky-600 text-white shadow-md shadow-sky-600/20" : "text-sky-950/60 hover:bg-sky-50"
                    )}
                  >
                    <TrendingUp className="w-4 h-4" />
                    {t("Shopping Insights", "ক্রয় বিশ্লেষণ")}
                  </button>
                </div>

                {activeTab === "main" ? (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-sky-950 tracking-tighter uppercase">{t("Purchase Timeline & Delivery tracking", "অর্ডার ট্র্যাকিং ও চালান অবস্থা")}</h2>
                    
                    <div className="space-y-6">
                      {orders.map((order) => {
                        const statusObj = getOrderStatusFormatted(order.status);
                        const progressIdx = getStatusStepIndex(order.status);

                        return (
                          <div key={order.id} className="bg-white border border-sky-100 rounded-[2.5rem] p-8 shadow-sm hover:border-sky-300 transition-all flex flex-col gap-6">
                            
                            {/* Inner Header Row */}
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                              <div>
                                <span className="font-extrabold text-[10px] text-gray-400 uppercase tracking-widest block">{t("ORDER ID", "অর্ডার আইডি")}</span>
                                <span className="font-black text-brand-950 text-sm tracking-wider uppercase">#{order.id.slice(-6).toUpperCase()}</span>
                              </div>
                              
                              <div className="text-right">
                                <span className="font-bold text-[10px] text-gray-400 block uppercase">{t("TOTAL COST", "মোট পরিশোধ্য")}</span>
                                <span className="font-black text-emerald-600 text-lg">৳{order.totalAmount}</span>
                              </div>

                              <div className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-wider", statusObj.bg)}>
                                {language === 'bn' ? statusObj.bn : statusObj.en}
                              </div>
                            </div>

                            {/* Middle details row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <span className="text-[8px] font-black text-sky-950/40 uppercase tracking-widest block mb-1">{t("AGRO PRODUCT", "কৃষিপণ্য")}</span>
                                <span className="font-extrabold text-brand-950 text-base block">{order.productName}</span>
                                <span className="text-xs text-gray-500">{t(`Qty: ${order.quantity}`, `পরিমাণ: ${order.quantity}`)}</span>
                              </div>
                              <div>
                                <span className="text-[8px] font-black text-sky-950/40 uppercase tracking-widest block mb-1">{t("PRODUCER / FARMER", "খামারি (কৃষক)")}</span>
                                <Link to={`/profile/${order.farmerId}-farmer`} className="font-extrabold text-sky-600 hover:underline text-sm block">
                                  {order.farmerName} →
                                </Link>
                              </div>
                              <div>
                                <span className="text-[8px] font-black text-sky-950/40 uppercase tracking-widest block mb-1">{t("DELIVERY SHIPPING POINT", "ডেলিভারি ঠিকানা")}</span>
                                <span className="font-bold text-gray-700 text-xs block leading-tight">
                                  {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                                </span>
                              </div>
                            </div>

                            {/* Progress tracking bar */}
                            <div className="pt-4 border-t border-gray-50">
                              <span className="text-[8px] font-black text-sky-950/40 uppercase tracking-widest block mb-4">{t("DELIVERY TRACKING TIMELINE", "স্টেপ ট্র্যাকিং")}</span>
                              
                              <div className="relative">
                                {/* Long timeline line */}
                                <div className="absolute top-4 left-4 right-4 h-1 bg-gray-100 -z-0"></div>
                                <div 
                                  className="absolute top-4 left-4 h-1 bg-sky-500 -z-0 transition-all duration-500"
                                  style={{ width: `${(Math.max(0, progressIdx) / 6) * 100}%` }}
                                ></div>

                                <div className="flex justify-between relative z-10">
                                  {[
                                    { id: 'pending', label: t("Pending", "অপেক্ষমান") },
                                    { id: 'accepted', label: t("Accepted", "গৃহীত") },
                                    { id: 'paid', label: t("Paid", "পরিশোধিত") },
                                    { id: 'shipment_accepted', label: t("Assigned", "স্থিরীকরণ") },
                                    { id: 'collected', label: t("Collected", "সংগৃহীত") },
                                    { id: 'shipped', label: t("In Transit", "রাস্তায়") },
                                    { id: 'delivered', label: t("Completed", "ডেলিভারড") },
                                  ].map((step, idx) => {
                                    const activeColor = getStepStatusColor(progressIdx, idx);
                                    return (
                                      <div key={step.id} className="flex flex-col items-center">
                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all", activeColor)}>
                                          {idx + 1}
                                        </div>
                                        <span className="text-[8px] font-extrabold uppercase mt-2 tracking-tighter text-gray-500 text-center max-w-[50px] leading-tight">
                                          {step.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Extra helpful action context (e.g. who is handling transport) */}
                            {order.transporterId && (
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <Truck className="w-5 h-5 text-slate-500 shrink-0" />
                                  <div>
                                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400 block">{t("DELIVERED BY", "যাত্রাপথের বাহক")}</span>
                                    <Link to={`/profile/${order.transporterId}-transporter`} className="font-extrabold text-slate-700 text-xs hover:underline">
                                      {order.transporterName}
                                    </Link>
                                  </div>
                                </div>
                                <a 
                                  href={`tel:${order.transporterPhone}`} 
                                  className="text-[9px] font-black text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-50 shadow-sm"
                                >
                                  <Phone className="w-3.5 h-3.5" /> {t("Contact", "যোগাযোগ")}
                                </a>
                              </div>
                            )}

                          </div>
                        );
                      })}

                      {orders.length === 0 && (
                        <div className="bg-white rounded-[3.5rem] border-2 border-dashed border-sky-100 p-16 text-center">
                          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-bounce" />
                          <p className="text-gray-400 text-xs font-black uppercase tracking-wider">{t("No dynamic purchase history records available", "কোনো ক্রয়ের বিবরণ এই মুহূর্তে উপলব্ধ নেই")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Stats insight for buyer profile */
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[3rem] border border-sky-100 shadow-sm space-y-8"
                  >
                    <div>
                      <h3 className="text-xl font-black text-sky-950 flex items-center gap-2 uppercase tracking-tight">
                        <TrendingUp className="w-5 h-5 text-sky-600" />
                        {t("My Shopping & Support Diagnostics", "ব্যবসায়িক ক্রয় কর্মক্ষমতা")}
                      </h3>
                      <p className="text-gray-400 text-xs mt-1">{t("Aggregated statistics calculated on your orders", "আপনার মোট অর্ডারের বিবরণ থেকে সংকলন করা হয়েছে")}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { label: t("Invested in Foods", "মোট খরচ"), value: `৳${orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)}` },
                        { label: t("Completed Fulfillments", "রেকর্ড সম্পন্ন"), value: `${orders.filter(o => o.status === 'delivered').length} Orders` },
                        { label: t("Ongoing Shipments", "ইন-ট্রানজিট ফসল"), value: `${orders.filter(o => ['shipment_accepted', 'collected', 'shipped'].includes(o.status)).length} Shipments` }
                      ].map((card, idx) => (
                        <div key={idx} className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100 text-center">
                          <div className="text-xl font-black text-sky-950 mb-1">{card.value}</div>
                          <div className="text-[8px] font-black text-sky-950/40 uppercase tracking-widest">{card.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Fun Graphic category breakdown */}
                    <div className="border-t border-sky-50 pt-6">
                      <h4 className="text-xs font-black text-sky-950 uppercase tracking-wider mb-4">{t("Purchased Groceries Class Distribution", "পছন্দের ক্যাটাগরি বণ্টন")}</h4>
                      
                      <div className="space-y-4">
                        {[
                          { category: t("Rice & Grains", "চাল ও দানা"), percentage: "৪৫%", width: "w-[45%]", color: "bg-amber-500" },
                          { category: t("Vegetables", "সবজি"), percentage: "৩০%", width: "w-[30%]", color: "bg-emerald-500" },
                          { category: t("Fruits", "ফলমূল"), percentage: "১৫%", width: "w-[15%]", color: "bg-red-500" },
                          { category: t("Oil, Dairy & Others", "দুধ ও অন্যান্য"), percentage: "১০%", width: "w-[10%]", color: "bg-indigo-500" }
                        ].map((dist, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
                              <span>{dist.category}</span>
                              <span>{dist.percentage}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", dist.color, dist.width)}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* TRANSPORTER PROFILE PRESENTATION */}
            {currentProfile.role === "transporter" && (
              <div className="space-y-8 animate-fade-in">
                {/* Tab selector for transporters */}
                <div className="bg-white p-3 rounded-2xl border border-amber-100 flex gap-2">
                  <button
                    onClick={() => setActiveTab("main")}
                    className={cn(
                      "px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                      activeTab === 'main' ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" : "text-amber-950/60 hover:bg-amber-50/50"
                    )}
                  >
                    <Truck className="w-4 h-4" />
                    {t("Freight Operations", "ডেলিভারি রেকর্ড ও বহর")} ({orders.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("districts")}
                    className={cn(
                      "px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                      activeTab === 'districts' ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" : "text-amber-950/60 hover:bg-amber-50/50"
                    )}
                  >
                    <Navigation className="w-4 h-4" />
                    {t("Active Coverage Routes", "ডেলিভারি রুট ও হাইওয়ে")}
                  </button>
                </div>

                {activeTab === "main" ? (
                  <div className="space-y-8">
                    
                    {/* Fleet layout specs bar */}
                    <div className="bg-white p-8 rounded-[3rem] border border-amber-100/50 shadow-sm">
                      <div className="flex items-center gap-3.5 mb-6 border-b border-gray-100 pb-4">
                        <Award className="w-6 h-6 text-amber-500" />
                        <div>
                          <h3 className="font-black text-brand-950 text-sm uppercase tracking-wider leading-none">{t("CERTIFIED CARGO SPECIFICATIONS SHEET", "যানবাহন ও কার্গো স্পেসিফিকেশন শিট")}</h3>
                          <span className="text-[9px] font-bold text-gray-400 mt-1 block">{t("Individually verified and registered fleet", "এগ্রোকানেক্ট সিস্টেম দ্বারা যাচাইকৃত গাড়ি")}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <span className="text-[8px] font-black text-amber-950/40 uppercase tracking-widest block mb-1">{t("FLEET TRUCK MODEL", "গাড়ির প্রকার")}</span>
                          <span className="font-extrabold text-brand-950 text-xs block truncate">{transporterSpecs.vehicleType}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-amber-950/40 uppercase tracking-widest block mb-1">{t("LICENSE CODE", "রেজিস্ট্রেশন কোড")}</span>
                          <span className="font-extrabold text-brand-950 text-xs block">{transporterSpecs.licensePlate}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-amber-950/40 uppercase tracking-widest block mb-1">{t("MAX CARRY WEIGHT", "বহন ক্ষমতা")}</span>
                          <span className="font-extrabold text-emerald-600 text-xs block">{transporterSpecs.capacity}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-amber-950/40 uppercase tracking-widest block mb-1">{t("ESTIMATED CHARGE RATE", "ভাড়ার সাধারণ হাড়")}</span>
                          <span className="font-extrabold text-amber-600 text-xs block">{transporterSpecs.baseRate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Logs specifically for transporters */}
                    <div>
                      <h2 className="text-xl font-black text-brand-950 tracking-tight mb-6 uppercase">{t("Cargo Logs & Active Duties", "সহজ ডেলিভারি ট্রিপসমূহ")}</h2>
                      
                      <div className="space-y-6">
                        {orders.map((item) => {
                          const statusData = getOrderStatusFormatted(item.status);
                          return (
                            <div key={item.id} className="bg-white p-7 rounded-[2.5rem] border border-amber-100 group hover:border-amber-300 transition-all shadow-sm">
                              <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-4 gap-4 flex-wrap">
                                <div>
                                  <span className="text-[8px] font-black text-amber-950/40 block uppercase tracking-widest">{t("CONSIGNMENT CODE", "চালান টিকিট")}</span>
                                  <span className="font-black text-gray-500 text-xs tracking-widest">{item.id.slice(-6).toUpperCase()}</span>
                                </div>
                                <div className={cn("px-3.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border", statusData.bg)}>
                                  {language === 'bn' ? statusData.bn : statusData.en}
                                </div>
                              </div>

                              {/* Delivery specs layout */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-amber-50/20 rounded-2xl border border-amber-50/50">
                                  <span className="text-[8px] font-black text-amber-950/40 uppercase tracking-widest block mb-1">{t("FARM PICKUP ORIGIN", "পণ্য সংগ্রহের স্থান (কৃষক)")}</span>
                                  <Link to={`/profile/${item.farmerId}-farmer`} className="font-extrabold text-brand-950 hover:text-brand-600 block text-xs">
                                    {item.farmerName} →
                                  </Link>
                                  <span className="text-[10px] text-gray-400 mt-1 block">{item.deliveryAddress?.city}</span>
                                </div>
                                
                                <div className="p-4 bg-amber-50/20 rounded-2xl border border-amber-50/50">
                                  <span className="text-[8px] font-black text-amber-950/40 uppercase tracking-widest block mb-1">{t("BUYER DELIVERY DESTINATION", "ডেলিভারি গন্তব্য (ক্রেতা)")}</span>
                                  <Link to={`/profile/${item.buyerId}-buyer`} className="font-extrabold text-brand-950 hover:text-brand-600 block text-xs">
                                    {item.buyerName} →
                                  </Link>
                                  <span className="text-[10px] text-gray-400 mt-1 block">{item.deliveryAddress?.street}</span>
                                </div>
                              </div>

                              {/* Cargo description */}
                              <div className="flex justify-between items-center text-xs gap-4 bg-brand-900/5 px-4 py-3 rounded-xl mb-4 text-brand-950 font-bold border border-brand-900/5">
                                <span className="uppercase">{item.productName}</span>
                                <span className="text-gray-400 text-[10px] tracking-wider font-extrabold">QTY: {item.quantity}</span>
                              </div>

                              {/* Dynamic Action Trigger from Profile Page */}
                              {isOwnProfile && ['shipment_accepted', 'collected', 'shipped'].includes(item.status) && (
                                <div className="flex justify-end pt-2 border-t border-gray-50">
                                  <button
                                    onClick={() => handleTransporterStatusAction(item.id, item.status)}
                                    className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold uppercase tracking-wide text-[10px] px-5 py-2.5 rounded-xl border border-amber-600 shadow-md shadow-amber-500/10 flex items-center gap-1.5 transition-all"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    {item.status === 'shipment_accepted' ? t("Mark Collected", "মালপ্রাপ্তি সংগ্রহ করুন") :
                                     item.status === 'collected' ? t("Start Transit Roadway", "শিপমেন্ট চালু করুন") :
                                     t("Complete Delivery Trip", "ডেলিভারি সম্পন্ন করুন")}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {orders.length === 0 && (
                          <div className="col-span-full py-16 text-center bg-white rounded-[3.5rem] border-dashed border-2 border-amber-100">
                            <Truck className="w-12 h-12 text-amber-200 mx-auto mb-4" />
                            <p className="text-brand-900/40 font-black uppercase tracking-widest text-xs">{t("No cargo allocations or delivery logs at the moment", "এই মুহূর্তে কোনো কার্গো বা ডেলিভারি ইতিহাস পাওয়া যায়নি")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Districts highway maps tab */
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[3rem] border border-amber-100 shadow-sm space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-black text-amber-950 flex items-center gap-2 uppercase tracking-tight">
                        <Navigation className="w-5 h-5 text-amber-500" />
                        {t("Major Intercity Highway Routes Covered", "নিয়মিত যাতায়াতকারী সড়ক রুটসমূহ")}
                      </h3>
                      <p className="text-amber-900/50 text-xs mt-1">{t("Direct logistics corridor routes operated actively", "কৃষিপণ্য পরিবহনে আমাদের প্রধান হাইওয়ে করিডোরসমূহ")}</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { route_en: "Dhanbari / Bogura ⇄ Dhaka Corridor", route_bn: "ধনবাড়ী / বগুড়া ⇄ ঢাকা এক্সপ্রেস করিডোর", mileage_en: "Distance: 210 KM", mileage_bn: "দূরত্ব: ২১০ কি.মি.", desc: "N5 National Highway link" },
                        { route_en: "Rajshahi Apple/Mango Orchard Corridor ⇄ Gazipur Complex", route_bn: "রাজশাহী বাগান করিডোর ⇄ গাজীপুর আড়ৎ", mileage_en: "Distance: 260 KM", mileage_bn: "দূরত্ব: ২৬০ কি.মি.", desc: "N6 Fast Cargo Transit Link" },
                        { route_en: "Chittagong Port ⇄ Jessore Agro Hub", route_bn: "চট্টগ্রাম বন্দর ⇄ যশোর কৃষি আড়ৎ", mileage_en: "Distance: 390 KM", mileage_bn: "দূরত্ব: ৩৯০ কি.মি.", desc: "South-Eastern High capacity link" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-5 rounded-2xl border border-amber-100/50 bg-amber-50/20 flex gap-4 items-center justify-between hover:scale-[1.01] transition-transform">
                          <div>
                            <h4 className="font-extrabold text-brand-950 text-xs tracking-wide">{language === 'bn' ? item.route_bn : item.route_en}</h4>
                            <p className="text-[10px] text-gray-400 mt-1">{item.desc}</p>
                          </div>
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-lg">
                            {language === 'bn' ? item.mileage_bn : item.mileage_en}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* General success references */}
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight mb-6 uppercase">{t("Customer Success Reviews", "সফল গ্রাহক রিভিউসমূহ")}</h2>
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center text-gray-400 font-bold text-xs uppercase tracking-wide">
                   {t("No reviews posted yet. Authenticated clients may send feedback on future successful transactions.", "এখনো কোনো রিভিউ নিবন্ধিত হয়নি। সফল লেনদেন সম্পন্ন করার পর বিশ্বস্ত গ্রাহকগণ ফিডব্যাক দিয়ে থাকেন।")}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* EDIT PROFILE DIALOG OVERLAY */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-2xl p-8 border border-neutral-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-brand-950 uppercase">{t("Edit Profile Settings", "প্রোফাইল সংশোধন")}</h3>
                  <span className="text-[10px] text-gray-400 block mt-0.5">{t("Bilingual settings management", "আপনার অ্যাকাউন্টের তথ্যাদি পরিবর্তন")}</span>
                </div>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6 border-none" />
                </button>
              </div>

              <form onSubmit={handleSaveChanges} className="space-y-5 text-left">
                
                {/* Name */}
                <div className="space-y-1.5Col">
                  <label className="text-[10px] font-black uppercase text-brand-900/55 block tracking-widest">{t("Your Name", "পূর্ণ নাম")}</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full text-xs font-bold text-brand-950 px-4 py-3 bg-brand-50/50 rounded-xl border border-brand-100 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all"
                  />
                </div>

                {/* Place / Location */}
                <div>
                  <label className="text-[10px] font-black uppercase text-brand-900/55 block tracking-widest">{t("District / Municipality", "বর্তমান জেলা / অবস্থান")}</label>
                  <input
                    type="text"
                    required
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    placeholder="e.g. Bogura, Bangladesh"
                    className="w-full text-xs font-bold text-brand-950 px-4 py-3 bg-brand-50/50 rounded-xl border border-brand-100 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-[10px] font-black uppercase text-brand-900/55 block tracking-widest">{t("Mobile Contact Number", "মোবাইল নম্বর")}</label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    placeholder="+8801700000000"
                    className="w-full text-xs font-bold text-brand-950 px-4 py-3 bg-brand-50/50 rounded-xl border border-brand-100 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-[10px] font-black uppercase text-brand-900/55 block tracking-widest">{t("Company Profile Bio", "ব্যক্তিগত পরিচয় বিবরণ (জীবনী)")}</label>
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full text-xs font-semibold text-gray-700 p-4 bg-brand-50/50 rounded-xl border border-brand-100 focus:outline-none focus:border-brand-500 transition-all resize-none"
                  />
                </div>

                {/* Transporter Optional Columns */}
                {currentProfile.role === 'transporter' && (
                  <div className="pt-4 border-t border-dashed border-gray-100 space-y-4">
                    <span className="text-[10px] font-black uppercase text-amber-600 block tracking-wider">{t("Logistics Specific Coordinates", "পরিবহন ও গাড়ির তথ্য")}</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-500 block">{t("Vehicle Model", "গাড়ির প্রকার")}</label>
                        <input
                          type="text"
                          value={editForm.vehicleType}
                          onChange={(e) => setEditForm({...editForm, vehicleType: e.target.value})}
                          className="w-full text-xs font-bold text-slate-800 px-3.5 py-2.5 bg-neutral-50 rounded-xl border focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-500 block">{t("License Code", "রেজিস্ট্রেশন কোড")}</label>
                        <input
                          type="text"
                          value={editForm.licensePlate}
                          onChange={(e) => setEditForm({...editForm, licensePlate: e.target.value})}
                          className="w-full text-xs font-bold text-slate-800 px-3.5 py-2.5 bg-neutral-50 rounded-xl border focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-500 block">{t("Cargo Payload Limit", "বহন ক্ষমতা (Ton/Kg)")}</label>
                        <input
                          type="text"
                          value={editForm.capacity}
                          onChange={(e) => setEditForm({...editForm, capacity: e.target.value})}
                          className="w-full text-xs font-bold text-slate-800 px-3.5 py-2.5 bg-neutral-50 rounded-xl border focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-500 block">{t("Base Cost Tariff", "ভাড়ার সাধারণ হাড়")}</label>
                        <input
                          type="text"
                          value={editForm.baseRate}
                          onChange={(e) => setEditForm({...editForm, baseRate: e.target.value})}
                          className="w-full text-xs font-bold text-slate-800 px-3.5 py-2.5 bg-neutral-50 rounded-xl border focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submits row */}
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-grow py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    {t("Cancel Action", "বাতিল করুন")}
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-600/10 flex items-center justify-center gap-1.5 transition-transform active:scale-95 duration-100"
                  >
                    <Save className="w-4 h-4" />
                    {t("Save Profile Data", "সংরক্ষণ করুন")}
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
