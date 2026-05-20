import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, Lock, User, ArrowRight, Leaf, AlertCircle, ShoppingBag, Truck, ShieldCheck, Check, Globe, Phone, MapPin } from "lucide-react";
import { useAuth, UserRole } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { cn } from "../lib/utils";

const ROLES: { id: UserRole; nameKey: string; icon: any; descKey: string }[] = [
  { id: "farmer", nameKey: "role.farmer", icon: Leaf, descKey: "role.farmer_desc" },
  { id: "buyer", nameKey: "role.buyer", icon: ShoppingBag, descKey: "role.buyer_desc" },
  { id: "transporter", nameKey: "role.transporter", icon: Truck, descKey: "role.transporter_desc" },
  { id: "admin", nameKey: "role.admin", icon: ShieldCheck, descKey: "role.admin_desc" },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("farmer");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { registerWithEmail, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(language === "en" ? "Passwords do not match" : "পাসওয়ার্ড মিলছে না");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await registerWithEmail(email, password, name, role, phone, location);
      // Immediately logout because user should login manually as per request
      await logout();
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError(language === "bn" ? "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হচ্ছে" : "Email already in use");
      } else if (err.code === 'auth/invalid-email') {
        setError(language === "bn" ? "ইমেইলটি সঠিক নয়" : "Invalid email format");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(
          language === "bn" 
            ? "ইমেইল/পাসওয়ার্ড লগইন এখনো চালু করা হয়নি। অনুগ্রহ করে গুগল লগইন ব্যবহার করুন অথবা আপনার ফায়ারবেস কনসোলে এটি চালু করুন।" 
            : "Email/Password login is not enabled. Please use Google Login or enable it in your Firebase Console (Authentication > Sign-in method)."
        );
      } else if (err.code === 'auth/weak-password') {
        setError(language === "bn" ? "পাসওয়ার্ডটি খুব সহজ। কমপক্ষে ৬ অক্ষর ব্যবহার করুন।" : "Password is too weak. Use at least 6 characters.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-900 flex items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Decorative elements */}
      <div className="absolute top-0 left-0 w-[50%] h-full bg-brand-800 skew-x-[12deg] -translate-x-[20%] z-0"></div>
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-brand-500 rounded-full blur-[120px] opacity-10 z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full glass-dark p-10 rounded-[4rem] shadow-2xl relative z-10 border border-white/10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-block bg-brand-500 p-4 rounded-2xl mb-6 shadow-xl shadow-brand-500/20">
            <Leaf className="w-10 h-10 text-white" />
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tighter">{t("auth.register_title")}</h1>
          <p className="text-brand-100 mt-3 font-medium opacity-90">{t("auth.register_subtitle")}</p>
        </div>

        <div className="flex justify-center gap-4 mb-10">
           <div className="bg-white/10 p-2 rounded-2xl flex gap-2 border border-white/10 backdrop-blur-md">
             <button 
              onClick={() => setLanguage("bn")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-black transition-all",
                language === "bn" ? "bg-white text-brand-900 shadow-xl" : "text-white/70 hover:bg-white/10"
              )}
             >
               বাংলা
             </button>
             <button 
              onClick={() => setLanguage("en")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-black transition-all",
                language === "en" ? "bg-white text-brand-900 shadow-xl" : "text-white/70 hover:bg-white/10"
              )}
             >
               English
             </button>
           </div>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-200 p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm font-bold border border-red-500/20 backdrop-blur-md">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-white/5 backdrop-blur-xl text-white p-12 rounded-[3rem] text-center space-y-8 border border-white/10 shadow-2xl">
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className="w-24 h-24 bg-brand-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white/20"
             >
                <Check className="w-12 h-12" />
             </motion.div>
             <div className="space-y-3">
                <h2 className="text-4xl font-black text-white tracking-tight">
                  {language === "bn" ? "নিবন্ধন সফল হয়েছে!" : "Registration Successful!"}
                </h2>
                <p className="text-brand-100/70 font-medium text-lg">
                  {language === "bn" ? "আপনার অ্যাকাউন্টটি তৈরি করা হয়েছে। এখন লগইন করুন।" : "Your account has been created. Please log in to continue."}
                </p>
             </div>
             <div className="pt-6">
                <Link 
                  to="/login"
                  className="inline-flex items-center gap-3 bg-white text-brand-900 px-12 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                >
                  {language === "bn" ? "এখনই লগইন করুন" : "Login Now"}
                  <ArrowRight className="w-6 h-6" />
                </Link>
             </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-brand-200 uppercase tracking-widest ml-4">{t("auth.full_name")}</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400 group-focus-within:text-white transition-colors" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/10 border-2 border-white/10 focus:border-brand-500 focus:bg-white/20 rounded-2xl pl-14 pr-6 py-4 outline-none transition-all font-bold text-white placeholder-white/20"
                    placeholder="E.g. Jamil Ahmed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-brand-200 uppercase tracking-widest ml-4">{t("auth.email")}</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400 group-focus-within:text-white transition-colors" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 border-2 border-white/10 focus:border-brand-500 focus:bg-white/20 rounded-2xl pl-14 pr-6 py-4 outline-none transition-all font-bold text-white placeholder-white/20"
                    placeholder="jamil@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-brand-200 uppercase tracking-widest ml-4">{language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400 group-focus-within:text-white transition-colors" />
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/10 border-2 border-white/10 focus:border-brand-500 focus:bg-white/20 rounded-2xl pl-14 pr-6 py-4 outline-none transition-all font-bold text-white placeholder-white/20"
                    placeholder="+8801700000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-brand-200 uppercase tracking-widest ml-4">{language === 'bn' ? 'অবস্থান' : 'Location'}</label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400 group-focus-within:text-white transition-colors" />
                  <input 
                    type="text" 
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white/10 border-2 border-white/10 focus:border-brand-500 focus:bg-white/20 rounded-2xl pl-14 pr-6 py-4 outline-none transition-all font-bold text-white placeholder-white/20"
                    placeholder="E.g. Bogra, Bangladesh"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-brand-200 uppercase tracking-widest ml-4">{t("auth.password")}</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400 group-focus-within:text-white transition-colors" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/10 border-2 border-white/10 focus:border-brand-500 focus:bg-white/20 rounded-2xl pl-14 pr-6 py-4 outline-none transition-all font-bold text-white placeholder-white/20"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-brand-200 uppercase tracking-widest ml-4">{t("auth.confirm_password")}</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400 group-focus-within:text-white transition-colors" />
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/10 border-2 border-white/10 focus:border-brand-500 focus:bg-white/20 rounded-2xl pl-14 pr-6 py-4 outline-none transition-all font-bold text-white placeholder-white/20"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-brand-500 hover:bg-brand-400 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-brand-500/30 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 mt-4"
              >
                {isLoading ? "..." : t("auth.register_btn")}
                {!isLoading && <ArrowRight className="w-6 h-6" />}
              </button>
              
              <p className="text-center text-brand-100 font-bold">
                {t("auth.have_account")}{" "}
                <Link to="/login" className="text-brand-400 font-black hover:text-white hover:underline ml-1 transition-colors">{t("auth.log_now")}</Link>
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-brand-200 uppercase tracking-widest ml-4">{t("auth.role")}</label>
              <div className="grid grid-cols-1 gap-4">
                {ROLES.map((r) => (
                  <div 
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={cn(
                      "p-5 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center gap-4 group relative overflow-hidden backdrop-blur-md",
                      role === r.id 
                        ? "border-white bg-white shadow-xl shadow-white/10" 
                        : "border-white/5 hover:border-white/20 bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-2xl transition-colors",
                      role === r.id ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20" : "bg-white/10 text-brand-300"
                    )}>
                      <r.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-grow">
                      <h3 className={cn(
                        "font-black text-lg transition-colors leading-tight",
                        role === r.id ? "text-brand-900" : "text-white"
                      )}>{t(r.nameKey)}</h3>
                      <p className={cn(
                        "text-xs font-bold leading-tight mt-0.5",
                        role === r.id ? "text-brand-600" : "text-brand-200/50"
                      )}>{t(r.descKey)}</p>
                    </div>
                    {role === r.id && (
                      <div className="bg-brand-600 p-2 rounded-full text-white shadow-lg border-2 border-white/20">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
