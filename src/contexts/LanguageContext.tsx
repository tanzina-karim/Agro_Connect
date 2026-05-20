import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "bn";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.marketplace": "Marketplace",
    "nav.ai_detector": "AI Detector",
    "nav.dashboards": "Explore Dashboards",
    "nav.signin": "Sign In",
    "nav.signout": "Sign Out",
    "home.hero_sub": "Direct From Farm to Table",
    "home.sell_btn": "Sell Product",
    "home.buy_btn": "Buy Fresh",
    "home.featured_title": "Featured Categories",
    "home.featured_sub": "Explore top quality products directly from local producers",
    "home.stats_farmers": "Farmers Connected",
    "home.stats_sold": "Products Sold",
    "home.stats_delivery": "Direct Deliveries",
    "home.stats_scans": "AI Scans",
    "home.hero_desc": "Connecting local farmers directly with consumers for a sustainable future.",
    "home.categories_label": "Categories",
    "home.view_all": "View All",
    "home.smart_agri": "Smart Agriculture",
    "home.ai_title": "AI Powered Disease Detection for Crops",
    "home.ai_desc": "Instantly identify plant diseases and get professional treatment recommendations using our cutting-edge AI models.",
    "home.ai_accuracy": "High Accuracy Analysis",
    "home.ai_accuracy_desc": "Over 98% accuracy in detecting major crop diseases.",
    "home.ai_instant": "Instant Recommendations",
    "home.ai_instant_desc": "Get 10+ treatment options within seconds of scanning.",
    "home.try_ai": "Try AI Detection Now",
    "home.process_label": "Process",
    "home.how_it_works": "How AgroConnect Works",
    "home.how_it_works_desc": "The easiest way to sell and buy agricultural products directly.",
    "home.step1_title": "Farmers Post Crops",
    "home.step1_desc": "Farmers upload their products with price and location.",
    "home.step2_title": "Buyers Place Order",
    "home.step2_desc": "Buyers browse quality products and order directly.",
    "home.step3_title": "Smart Logistics",
    "home.step3_desc": "Autonomous matching with transporters for fast delivery.",
    "market.title": "Direct",
    "market.subtitle": "Marketplace",
    "market.desc": "Supporting small-scale farmers and providing fresh organic products directly to your doorstep.",
    "market.search_placeholder": "Search products or farmers...",
    "market.categories": "Categories",
    "market.price_range": "Price Range",
    "market.best_farmer": "Farmer of the Month",
    "market.best_farmer_desc": "Rahim Miya increased his sustainable yield by 40% using AI detector.",
    "market.read_story": "Read Story",
    "market.add_to_cart": "Add to cart",
    "auth.select_language": "Select Your Language",
    "auth.login_title": "Welcome Back",
    "auth.login_subtitle": "Log in to AgroConnect",
    "auth.register_title": "Create Your Account",
    "auth.register_subtitle": "Join the sustainable agricultural revolution",
    "auth.full_name": "Full Name",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.confirm_password": "Confirm Password",
    "auth.role": "Select Your Role",
    "auth.register_btn": "Complete Registration",
    "auth.login_btn": "Sign In",
    "auth.no_account": "Don't have an account?",
    "auth.have_account": "Already have an account?",
    "auth.reg_now": "Register Now",
    "auth.log_now": "Log In",
    "role.farmer": "Farmer",
    "role.farmer_desc": "Sell crops directly to buyers and use AI assistance.",
    "role.buyer": "Buyer",
    "role.buyer_desc": "Purchase fresh organic products from local farms.",
    "role.transporter": "Transporter",
    "role.transporter_desc": "Help deliver fresh goods and optimize routes.",
    "role.admin": "Admin",
    "role.admin_desc": "Manage platform operations and monitor network.",
    "ai.scanning": "Analyzing Specimen...",
    "ai.awaiting": "Awaiting Specimen",
    "ai.awaiting_desc": "Upload a photo on the left to begin the intelligent analysis process.",
    "ai.failed": "Analysis Failed",
    "ai.try_again": "Try Again",
    "ai.causes": "Potential Causes",
    "ai.treatment": "Suggested Treatment",
    "ai.confidence": "Confidence",
    "ai.tips": "Prevention Tips",
    "ai.products": "Recommended Products",
  },
  bn: {
    "nav.marketplace": "মার্কেটপ্লেস",
    "nav.ai_detector": "এআই ডিটেক্টর",
    "nav.dashboards": "ড্যাশবোর্ড দেখুন",
    "nav.signin": "লগইন করুন",
    "nav.signout": "লগ আউট",
    "home.hero_sub": "সরাসরি খামার থেকে টেবিলে",
    "home.sell_btn": "পণ্য বিক্রি করুন",
    "home.buy_btn": "তাজা পণ্য কিনুন",
    "home.featured_title": "সেরা ক্যাটাগরি",
    "home.featured_sub": "স্থানীয় উৎপাদকদের কাছ থেকে সরাসরি সেরা মানের পণ্যগুলো দেখুন",
    "home.stats_farmers": "যুক্ত কৃষক",
    "home.stats_sold": "বিক্রিত পণ্য",
    "home.stats_delivery": "সরাসরি ডেলিভারি",
    "home.stats_scans": "এআই স্ক্যান",
    "home.hero_desc": "মাঠ থেকে সরাসরি আপনার দোরগোড়ায় তাজা পণ্য পৌঁছে দিচ্ছে এগ্রোকানেক্ট।",
    "home.categories_label": "ক্যাটাগরি",
    "home.view_all": "সব দেখুন",
    "home.smart_agri": "স্মার্ট কৃষি",
    "home.ai_title": "ফসলের রোগ শনাক্তকরণে এআই",
    "home.ai_desc": "আমাদের উন্নত এআই মডেল ব্যবহার করে তাৎক্ষণিকভাবে ফসলের রোগ শনাক্ত করুন এবং উন্নত চিকিৎসার পরামর্শ নিন।",
    "home.ai_accuracy": "উচ্চ নির্ভুলতা বিশ্লেষণ",
    "home.ai_accuracy_desc": "৯৮%-এর বেশি নির্ভুলতার সাথে প্রধান প্রধান রোগ শনাক্তকরণ।",
    "home.ai_instant": "তাৎক্ষণিক পরামর্শ",
    "home.ai_instant_desc": "স্ক্যান করার কয়েক সেকেন্ডের মধ্যে ১০টিরও বেশি চিকিৎসার পরামর্শ পান।",
    "home.try_ai": "এখনই এআই ডিটেকশন ট্রাই করুন",
    "home.process_label": "প্রক্রিয়া",
    "home.how_it_works": "এগ্রোকানেক্ট যেভাবে কাজ করে",
    "home.how_it_works_desc": "সরাসরি কৃষি পণ্য কেনা এবং বিক্রির সবচেয়ে সহজ উপায়।",
    "home.step1_title": "কৃষকরা ফসল তালিকাভুক্ত করেন",
    "home.step1_desc": "কৃষকরা তাদের পণ্যের দাম এবং লোকেশন সহ আপলোড করেন।",
    "home.step2_title": "ক্রেতারা অর্ডার করেন",
    "home.step2_desc": "ক্রেতারা মানসম্পন্ন পণ্য বেছে নেন এবং সরাসরি অর্ডার করেন।",
    "home.step3_title": "স্মার্ট লজিস্টিকস",
    "home.step3_desc": "দ্রুত ডেলিভারির জন্য স্বয়ংক্রিয়ভাবে পরিবহনকারীদের সাথে যোগাযোগ।",
    "market.title": "সরাসরি",
    "market.subtitle": "বাজার",
    "market.desc": "সরাসরি কৃষকের কাছ থেকে তাজা অর্গানিক পণ্য কিনুন এবং ক্ষুদ্র কৃষকদের সহায়তা করুন।",
    "market.search_placeholder": "পণ্য বা কৃষক খুঁজুন...",
    "market.categories": "ক্যাটাগরি",
    "market.price_range": "মূল্য নির্ধারণ",
    "market.best_farmer": "সেরা কৃষক",
    "market.best_farmer_desc": "রহিম মিয়া এআই ডিটেক্টর ব্যবহার করে তাঁর ফসলের উৎপাদন ৪০% বাড়িয়েছেন।",
    "market.read_story": "গল্পটি পড়ুন",
    "market.add_to_cart": "কার্টে যোগ করুন",
    "auth.select_language": "আপনার ভাষা নির্বাচন করুন",
    "auth.login_title": "স্বাগতম",
    "auth.login_subtitle": "এগ্রোকানেক্টে লগইন করুন",
    "auth.register_title": "অ্যাকাউন্ট তৈরি করুন",
    "auth.register_subtitle": "টেকসই কৃষি বিপ্লবে যোগ দিন",
    "auth.full_name": "পুরো নাম",
    "auth.email": "ইমেইল ঠিকানা",
    "auth.password": "পাসওয়ার্ড",
    "auth.confirm_password": "পাসওয়ার্ড নিশ্চিত করুন",
    "auth.role": "আপনার ভূমিকা নির্বাচন করুন",
    "auth.register_btn": "রেজিস্ট্রেশন সম্পন্ন করুন",
    "auth.login_btn": "লগইন করুন",
    "auth.no_account": "অ্যাকাউন্ট নেই?",
    "auth.have_account": "ইতিমধ্যে অ্যাকাউন্ট আছে?",
    "auth.reg_now": "এখনই রেজিস্ট্রেশন করুন",
    "auth.log_now": "লগইন করুন",
    "role.farmer": "কৃষক",
    "role.farmer_desc": "আপনার ফসল সরাসরি বিক্রি করুন এবং এআই সহায়তা নিন।",
    "role.buyer": "ক্রেতা",
    "role.buyer_desc": "স্থানীয় খামার থেকে তাজা অর্গানিক পণ্য কিনুন।",
    "role.transporter": "পরিবহনকারী",
    "role.transporter_desc": "পণ্য পরিবহনে সহায়তা করুন এবং উন্নত রুট ব্যবহার করুন।",
    "role.admin": "অ্যাডমিন",
    "role.admin_desc": "প্ল্যাটফর্ম পরিচালনা এবং নেটওয়ার্ক পর্যবেক্ষণ করুন।",
    "ai.scanning": "নমুনা বিশ্লেষণ করা হচ্ছে...",
    "ai.awaiting": "নমুনার অপেক্ষায়",
    "ai.awaiting_desc": "বুদ্ধিমান বিশ্লেষণ প্রক্রিয়া শুরু করতে বাম দিকে একটি ছবি আপলোড করুন।",
    "ai.failed": "বিশ্লেষণ ব্যর্থ হয়েছে",
    "ai.try_again": "আবার চেষ্টা করুন",
    "ai.causes": "সম্ভাব্য কারণসমূহ",
    "ai.treatment": "প্রস্তাবিত চিকিৎসা",
    "ai.confidence": "নির্ভরযোগ্যতা",
    "ai.tips": "প্রতিরোধ টিপস",
    "ai.products": "প্রস্তাবিত পণ্য",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("bn"); // Default to Bangla for BD style

  useEffect(() => {
    const savedLang = localStorage.getItem("agro_lang") as Language;
    if (savedLang) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("agro_lang", lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
