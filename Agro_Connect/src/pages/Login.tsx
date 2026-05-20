import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, Lock, ArrowRight, Leaf, AlertCircle, Globe } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { cn } from "../lib/utils";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithEmail, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/dashboard/${user.role}`);
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(language === "bn" ? "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়" : "Invalid email or password");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(
          language === "bn" 
            ? "ইমেইল/পাসওয়ার্ড লগইন এখনো চালু করা হয়নি। অনুগ্রহ করে গুগল লগইন ব্যবহার করুন অথবা আপনার ফায়ারবেস কনসোলে এটি চালু করুন।" 
            : "Email/Password login is not enabled. Please use Google Login or enable it in your Firebase Console (Authentication > Sign-in method)."
        );
      } else if (err.code === 'auth/too-many-requests') {
        setError(language === "bn" ? "অত্যধিক ভুল চেষ্টার কারণে আপনার অ্যাকাউন্টটি সাময়িকভাবে লক করা হয়েছে। পরে আবার চেষ্টা করুন।" : "Too many failed attempts. Account temporarily locked. Try again later.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-900 flex items-center justify-center pt-24 pb-20 px-6 relative overflow-hidden">
      {/* Background Decorative elements */}
      <div className="absolute top-0 right-0 w-[50%] h-full bg-brand-800 skew-x-[-12deg] translate-x-[20%] z-0"></div>
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-brand-500 rounded-full blur-[120px] opacity-20 z-0"></div>
      <div className="absolute bottom-20 left-[10%] w-64 h-64 bg-brand-400 rounded-full blur-[100px] opacity-10 z-0"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-dark p-10 rounded-[3rem] shadow-2xl relative z-10 border border-white/10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-block bg-brand-500 p-4 rounded-2xl mb-6 shadow-xl shadow-brand-500/20">
            <Leaf className="w-10 h-10 text-white" />
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tighter">{t("auth.login_title")}</h1>
          <p className="text-brand-100 mt-3 font-medium opacity-90">{t("auth.login_subtitle")}</p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder={language === "bn" ? "ইমেইল লিখুন" : "Enter email"}
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

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-500 hover:bg-brand-400 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-brand-500/30 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 mt-4"
          >
            {isLoading ? "..." : t("auth.login_btn")}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="my-10 relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-brand-950 px-4 text-brand-200 font-black tracking-widest">{t("auth.or")}</span></div>
        </div>

        <div className="space-y-6">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white/10 hover:bg-white/20 text-white border-2 border-white/10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/20"
          >
            {isLoading ? "..." : (
              <>
                <Globe className="w-5 h-5 text-brand-400" />
                {language === "bn" ? "গুগল দিয়ে লগইন করুন" : "Sign in with Google"}
              </>
            )}
          </button>
          
          <p className="text-center text-sm text-brand-100 font-bold px-4">
            {language === "bn" 
              ? "নিরাপদভাবে এবং সহজে সাইন ইন করার জন্য আপনি গুগল লগইন ব্যবহার করতে পারেন।" 
              : "Use Google Login for faster and more secure access."}
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-brand-100 font-bold">
            {t("auth.no_account")}{" "}
            <Link to="/register" className="text-brand-400 font-black hover:text-white hover:underline ml-1 transition-colors">
              {t("auth.reg_now")}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
