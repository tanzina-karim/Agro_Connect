import { Truck, MapPin, Navigation, Package, Clock, ShieldCheck, CheckCircle2, ChevronRight, XCircle, CheckCircle, Bike, Activity, Phone, User } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { useProducts } from "../contexts/ProductContext";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import LogisticsMap from "../components/LogisticsMap";

function FarmerPickupDetails({ farmerId, farmerName, language }: { farmerId: string, farmerName: string, language: string }) {
  const [profile, setProfile] = useState<{ phone?: string; location?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchFarmer() {
      try {
        const userDoc = await getDoc(doc(db, "users", farmerId));
        if (userDoc.exists() && active) {
          setProfile(userDoc.data());
        }
      } catch (err) {
        console.error("Error fetching farmer profile", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchFarmer();
    return () => {
      active = false;
    };
  }, [farmerId]);

  const t = (en: string, bn: string) => language === "bn" ? bn : en;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5">
        <Link to={`/profile/${farmerId}-farmer`} className="font-bold text-gray-900 hover:text-brand-600 block transition-colors">
          {farmerName} →
        </Link>
      </div>
      {loading ? (
        <span className="text-[10px] text-gray-400 font-mono italic mt-1">{t("Loading contact details...", "যোগাযোগের বিবরণ লোড হচ্ছে...")}</span>
      ) : (
        <div className="mt-2 space-y-1.5 bg-brand-50/40 p-3 rounded-xl border border-brand-100/50">
          <div className="text-[11px] text-gray-700 font-medium flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
            <span>
              <strong>{t("Pickup Address:", "পণ্য সংগ্রহের ঠিকানা:")}</strong>{" "}
              <span className="text-brand-950 font-bold">
                {profile?.location || t("Not Provided", "প্রদান করা হয়নি")}
              </span>
            </span>
          </div>
          {profile?.phone && (
            <div className="text-[11px] text-gray-700 font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                <strong>{t("Phone:", "ফোন:")}</strong>{" "}
                <a href={`tel:${profile.phone}`} className="text-emerald-600 hover:underline font-bold font-mono">
                  {profile.phone}
                </a>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TransporterDashboard() {
  const { orders, updateOrderStatus } = useProducts();
  const { user, isLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');
  const [transporterVehicle, setTransporterVehicle] = useState<'bike' | 'van' | 'pickup'>('van');
  const [dismissedOrderIds, setDismissedOrderIds] = useState<string[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`transporter_dismissed_${user.uid}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!isLoading && !user) navigate("/");
  }, [user, isLoading, navigate]);

  if (isLoading || !user) return null;

  const handleDismiss = (orderId: string) => {
    const updated = [...dismissedOrderIds, orderId];
    setDismissedOrderIds(updated);
    localStorage.setItem(`transporter_dismissed_${user.uid}`, JSON.stringify(updated));
    toast.success(language === 'bn' ? "কাজটি তালিকা থেকে সরানো হয়েছে" : "Job removed from list");
  };

  const handleStatusUpdate = async (orderId: string, status: any, label: string, extra: any = {}) => {
    try {
      await updateOrderStatus(orderId, status, extra);
      toast.success(language === 'bn' ? `স্ট্যাটাস আপডেট সফল: ${label}` : `Status updated: ${label}`);
    } catch (err) {
      toast.error(language === 'bn' ? "আপডেট করতে সমস্যা হয়েছে" : "Failed to update status");
    }
  };

  const availableJobs = orders.filter(o => 
    (o.status === 'accepted' || o.status === 'paid') && 
    o.deliveryMode === 'inside' &&
    (!o.transporterId || o.transporterId === '') &&
    !dismissedOrderIds.includes(o.id)
  );

  const activeJobs = orders.filter(o => 
    o.transporterId === user.uid && 
    o.status !== 'delivered'
  );

  const completedJobs = orders.filter(o => 
    o.transporterId === user.uid && 
    o.status === 'delivered'
  );

  const displayedJobs = activeTab === 'available' ? availableJobs 
                     : activeTab === 'active' ? activeJobs 
                     : completedJobs;

  const t = (en: string, bn: string) => language === "bn" ? bn : en;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 via-white to-emerald-50/20 pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-emerald-950 tracking-tighter">Logistics <span className="text-emerald-600">Center</span></h1>
            <p className="text-emerald-900/60 font-black uppercase tracking-widest text-[10px] mt-2">Driver: {user?.name || "Alex Thompson"} • Profile status: Active Fleet Member</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm">
             <div className="text-right hidden md:block">
                <div className="text-[9px] font-black text-emerald-900/40 uppercase tracking-widest">{language === 'bn' ? 'সক্রিয় বাহন মোড:' : 'Active Transporter Mode:'}</div>
                <div className="text-xs font-semibold text-emerald-600 mt-0.5 flex items-center gap-1 justify-end">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   {language === 'bn' ? 'ম্যাচিং রানিং' : 'Live Matching'}
                </div>
             </div>
             <div className="flex bg-emerald-50/60 p-1.5 rounded-2xl border border-emerald-100">
                {[
                  { id: 'bike', label: language === 'bn' ? '🏍️ বাইক' : '🏍️ Bike', cap: language === 'bn' ? '৩০কেজি' : '30kg' },
                  { id: 'van', label: language === 'bn' ? '🛺 ভ্যান' : '🛺 Van', cap: language === 'bn' ? '২৫০কেজি' : '250kg' },
                  { id: 'pickup', label: language === 'bn' ? '🛻 পিকআপ' : '🛻 Pickup', cap: language === 'bn' ? '১.৫ টন' : '1.5T' }
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setTransporterVehicle(v.id as any)}
                    className={cn(
                       "px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center",
                       transporterVehicle === v.id
                         ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                         : "text-emerald-950 hover:bg-emerald-100/60"
                     )}
                  >
                    <span>{v.label}</span>
                    <span className="text-[7.5px] opacity-75 font-semibold mt-0.5">{v.cap}</span>
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <LogisticsMap activeJobs={activeJobs} language={language} />

            {/* Tabs System for Transporters */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-md shadow-emerald-100/10 flex flex-wrap gap-4 items-center justify-between mb-8">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveTab('available')}
                  className={cn(
                    "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer",
                    activeTab === 'available'
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-emerald-50 text-emerald-900/60 hover:bg-emerald-100/50"
                  )}
                >
                  {t("Available Jobs", "নতুন ডেলিভারি")} ({availableJobs.length})
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={cn(
                    "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer",
                    activeTab === 'active'
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-emerald-50 text-emerald-900/60 hover:bg-emerald-100/50"
                  )}
                >
                  {t("My Active Deliveries", "চলমান ডেলিভারি")} ({activeJobs.length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={cn(
                    "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer",
                    activeTab === 'completed'
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-emerald-50 text-emerald-900/60 hover:bg-emerald-100/50"
                  )}
                >
                  {t("Completed", "সম্পন্ন")} ({completedJobs.length})
                </button>
              </div>
              <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100/80">
                {t("Total Managed:", "মোট পরিচালিত:")} {activeJobs.length + completedJobs.length}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {displayedJobs.length === 0 ? (
                 <div className="bg-white p-12 rounded-[3.5rem] border-2 border-dashed border-brand-100 text-center col-span-full">
                    <Package className="w-12 h-12 text-brand-200 mx-auto mb-4" />
                    <p className="text-brand-900/40 font-black uppercase tracking-widest text-[10px] leading-relaxed max-w-sm mx-auto">
                      {activeTab === 'available' ? t("No new delivery openings available. Check back when farmers accept new orders.", "এই মুহূর্তে কোনো নতুন বুকিং উপলব্ধ নেই। খামারি নতুন অর্ডার গ্রহণ করলে এখানে দৃশ্যমান হবে।") :
                       activeTab === 'active' ? t("You don't have any active deliveries in progress.", "আপনার কোনো চলমান ডেলিভারি নেই। বুকিং গ্রহণ করলে এখানে আসবে।") :
                       t("You haven't completed any deliveries yet.", "আপনি এখনো কোনো ডেলিভারি সম্পন্ন করেননি।")}
                    </p>
                 </div>
               ) : (
                 displayedJobs.map(item => {
                   const requiredVehicle = item.vehicleType || 'van';
                   const weightKg = item.weightKg || Math.round(item.quantity * 2.5) || 10;
                   const distanceKm = item.distanceKm || 12;
                   const cost = item.deliveryCost || 120;

                   // Intelligent validation based on active vehicle
                   const isTooHeavy = 
                     (transporterVehicle === 'bike' && weightKg > 30) ||
                     (transporterVehicle === 'van' && weightKg > 250);

                   const isPerfectMatch = transporterVehicle === requiredVehicle;

                   return (
                     <div key={item.id} className={cn(
                       "bg-white p-8 rounded-[3rem] border transition-all shadow-sm flex flex-col justify-between hover:shadow-md",
                       isTooHeavy ? "border-red-100 opacity-90" : "border-brand-100 group hover:border-brand-300"
                     )}>
                       <div>
                         <div className="flex items-center justify-between mb-6">
                            <span className="font-mono text-xs font-black text-brand-900/40 tracking-widest">{item.id.slice(-6).toUpperCase()}</span>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                              item.status === "shipped" ? "bg-brand-50 text-brand-600" : 
                              item.status === "collected" ? "bg-amber-50 text-amber-600" :
                              item.status === "shipment_accepted" ? "bg-blue-50 text-blue-600" :
                              "bg-gray-100 text-gray-500"
                            )}>{item.status === 'accepted' ? t("ACCEPTED", "অনুমোদিত") :
                                item.status === 'paid' ? t("PAID", "পরিশোধিত") :
                                item.status === 'shipment_accepted' ? t("SHIPMENT ACCEPTED", "গৃহীত") :
                                item.status === 'collected' ? t("COLLECTED", "সংগৃহীত") :
                                item.status === 'shipped' ? t("IN TRANSIT", "চলমান") :
                                t(item.status.toUpperCase(), item.status)}</span>
                         </div>

                         {/* Cargo details */}
                         <div className="bg-brand-50 p-4 rounded-2xl mb-6">
                           <div className="flex justify-between items-center">
                             <div>
                               <h4 className="font-black text-brand-950 text-sm">{item.productName}</h4>
                               <p className="text-[10px] font-bold text-brand-900/60 mt-0.5">
                                 {t("Quantity: ", "পরিমাণ: ")}{item.quantity} • {weightKg} কেজি
                               </p>
                             </div>
                             <div className="text-right">
                               <div className="text-[10px] font-black text-brand-900/40 uppercase tracking-widest">{t("Your Payout", "আপনার আয়")}</div>
                               <div className="text-xl font-black text-brand-600 font-mono">৳{cost}</div>
                             </div>
                           </div>
                           <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-brand-100/60 font-mono text-[9px] font-bold text-brand-900/60 font-medium">
                             <div>📍 {distanceKm} কি.মি. গন্তব্য</div>
                             <div>⚖️ {weightKg} কেজি মোট ওজন</div>
                           </div>
                         </div>

                         {/* Matching indicator */}
                         {activeTab === 'available' && (
                           <div className="mb-6">
                             {isTooHeavy ? (
                               <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-[10px] text-red-700 font-medium flex items-start gap-1.5 leading-relaxed">
                                 <span>⚠️</span>
                                 <span>
                                   {language === 'bn' 
                                     ? `ওজন সীমা অতিক্রম! ${transporterVehicle === 'bike' ? 'বাইকের সর্বোচ্চ ক্ষমতা ৩০কেজি' : 'ভ্যানের সর্বোচ্চ ক্ষমতা ২৫০কেজি'}। অনুগ্রহ করে উপরে সক্রিয় বাহন পরিবর্তন করুন।`
                                     : `Weight limit exceeded! ${transporterVehicle === 'bike' ? 'Bike supports max 30kg' : 'Van supports max 250kg'}. Please switch your transporter vehicle above.`}
                                 </span>
                               </div>
                             ) : isPerfectMatch ? (
                               <div className="px-3.5 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-[9px] text-emerald-800 font-black tracking-wider uppercase flex items-center gap-1.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                 <span>🎯 {t("100% PERFECT VEHICLE MATCH", "১০০% পারফেক্ট বাহন ম্যাচ")}</span>
                               </div>
                             ) : (
                               <div className="px-3.5 py-2 bg-blue-50 rounded-xl border border-blue-100 text-[9px] text-blue-800 font-black tracking-wider uppercase flex items-center gap-1.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                 <span>✓ {t("CAPACITY COMPATIBLE", "বাহন ধারণক্ষমতা উপযুক্ত")}</span>
                               </div>
                             )}
                           </div>
                         )}

                         <div className="space-y-4 mb-8">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-brand-900/40 uppercase tracking-widest mb-1">{t("Pickup Origin", "পণ্য সংগ্রহের স্থান (কৃষক)")}</span>
                               <FarmerPickupDetails farmerId={item.farmerId} farmerName={item.farmerName} language={language} />
                            </div>
                            <div className="w-full h-[1px] bg-gray-100 relative">
                               <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 bg-brand-500 rounded-full" />
                               <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-200" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("Delivery Destination", "ডেলিভারি গন্তব্য (ক্রেতা)")}</span>
                              <Link to={`/profile/${item.buyerId}-buyer`} className="font-bold text-gray-900 hover:text-brand-600 block transition-colors">
                                {item.buyerName} →
                              </Link>
                              {item.deliveryAddress && (
                                <div className="text-[10px] text-gray-500 font-medium mt-1">
                                  {item.deliveryAddress.street}, {item.deliveryAddress.city}
                                  <br />
                                  Tel: {item.deliveryAddress.phone}
                                </div>
                              )}
                            </div>
                         </div>
                       </div>

                       <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                             {transporterVehicle === 'bike' ? <Bike className="w-4 h-4 text-brand-600" /> : <Truck className="w-4 h-4 text-brand-600" />}
                             <span className="font-black text-[10px]">
                               {requiredVehicle.toUpperCase()} REQ
                             </span>
                          </div>
                          <div className="flex gap-2 shrink-0">
                              {activeTab === 'available' && (
                                <>
                                  <button 
                                   onClick={() => handleDismiss(item.id)}
                                   className="text-xs font-black text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2.5 rounded-xl border border-red-100/50 flex items-center justify-center gap-1.5 transition-all active:scale-95 duration-150 cursor-pointer"
                                   title={t("Dismiss", "খারিজ করুন")}
                                  >
                                    <XCircle className="w-4 h-4" /> {t("Reject", "খারিজ")}
                                  </button>
                                  <button 
                                   disabled={isTooHeavy}
                                   onClick={() => handleStatusUpdate(item.id, 'shipment_accepted', 'Accepted', {
                                     transporterId: user.uid,
                                     transporterName: user.name,
                                     transporterPhone: user.phone || "+8801700000000",
                                     vehicleType: transporterVehicle
                                   })}
                                   className={cn(
                                     "text-xs font-black px-4 py-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95 duration-150",
                                     isTooHeavy 
                                       ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                                       : "bg-brand-600 hover:bg-brand-500 text-white border-brand-700 shadow-md shadow-brand-600/10 cursor-pointer"
                                   )}
                                  >
                                    <CheckCircle className="w-4 h-4" /> {t("Accept", "অনুমোদন")}
                                  </button>
                                </>
                              )}
                              {activeTab === 'active' && item.status === 'shipment_accepted' && (
                                <button 
                                 onClick={() => handleStatusUpdate(item.id, 'collected', 'Collected')}
                                 className="text-xs font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <Package className="w-4 h-4" /> {language === 'bn' ? 'সংগ্রহ করুন' : 'Mark Collected'}
                                </button>
                              )}
                              {activeTab === 'active' && item.status === 'collected' && (
                                <button 
                                 onClick={() => handleStatusUpdate(item.id, 'shipped', 'Shipped')}
                                 className="text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <Truck className="w-4 h-4" /> {language === 'bn' ? 'শিপমেন্ট শুরু' : 'Start Transit'}
                                </button>
                              )}
                              {activeTab === 'active' && item.status === 'shipped' && (
                                <button 
                                 onClick={() => handleStatusUpdate(item.id, 'delivered', 'Delivered')}
                                 className="text-xs font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> {language === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Complete Delivery'}
                                </button>
                              )}
                              {activeTab === 'completed' && (
                                <div className="flex items-center gap-1 text-emerald-600 text-xs font-black uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                  <CheckCircle2 className="w-4 h-4" /> {t("Delivered", "ডেলিভারড")}
                                </div>
                              )}
                            </div>
                       </div>
                     </div>
                   );
                 })
               )}
            </div>
          </div>

          <div className="space-y-10">
             <div className="bg-white p-8 rounded-[3.5rem] border border-brand-100 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-brand-50 rounded-full blur-3xl -ml-16 -mt-16 opacity-50"></div>
                <div className="w-20 h-20 bg-brand-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-600/20 relative z-10">
                   <Truck className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-brand-950 mb-6 relative z-10 tracking-tight">Truck Health</h3>
                <div className="flex justify-center gap-3 mb-10 relative z-10">
                   <div className="w-2.5 h-10 bg-brand-500 rounded-full shadow-lg shadow-brand-500/20" />
                   <div className="w-2.5 h-14 bg-brand-500 rounded-full shadow-lg shadow-brand-500/20" />
                   <div className="w-2.5 h-12 bg-brand-500 rounded-full shadow-lg shadow-brand-500/20" />
                   <div className="w-2.5 h-8 bg-brand-200 rounded-full" />
                </div>
                <div className="space-y-3 text-left relative z-10">
                   {[
                     { label: "Fuel Level", val: "78%", ok: true },
                     { label: "Engine Temp", val: "Normal", ok: true },
                     { label: "Tire Pressure", val: "Optimal", ok: true },
                     { label: "Odometer", val: "12,500 km", ok: true },
                   ].map(stat => (
                     <div key={stat.label} className="flex justify-between items-center py-4 border-b border-brand-50 last:border-0">
                        <span className="text-[10px] font-black text-brand-900/40 uppercase tracking-widest">{stat.label}</span>
                        <span className="text-sm font-black text-brand-950">{stat.val}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-brand-950 p-10 rounded-[4rem] text-white relative overflow-hidden border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl opacity-50"></div>
                <ShieldCheck className="w-16 h-16 text-brand-500 mb-8" />
                <h3 className="text-3xl font-black mb-4 tracking-tight">Insured Driver</h3>
                <p className="text-sm text-brand-100/70 font-bold leading-relaxed mb-10">Your vehicle and the goods are protected under AgroConnect Elite Logistics Insurance up to $500k.</p>
                <button className="w-full py-5 bg-white/10 hover:bg-white/20 transition-all rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-white/5 shadow-xl">View Certificate</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
