import React, { useState, useRef } from "react";
import { Camera, Upload, Zap, AlertTriangle, CheckCircle2, ChevronRight, Info, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useLanguage } from "../contexts/LanguageContext";

interface DetectionResult {
  diseaseName: string;
  confidence: number;
  causes: string[];
  treatment: string[];
  recommendedProducts: string[];
  preventionTips: string[];
}

export default function AIDetector() {
  const { t, language } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!image) return;

    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/detect-disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image,
          prompt: language === "bn" ? "Please provide the descriptions and list items in Bengali where possible." : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze image");
      }
      const data = await response.json();
      
      // Basic validation of data shape
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid response format from AI");
      }

      setResult({
        diseaseName: data.diseaseName || (language === "bn" ? "অজানা" : "Unknown"),
        confidence: typeof data.confidence === 'number' ? data.confidence : 0,
        causes: Array.isArray(data.causes) ? data.causes : [],
        treatment: Array.isArray(data.treatment) ? data.treatment : [],
        recommendedProducts: Array.isArray(data.recommendedProducts) ? data.recommendedProducts : [],
        preventionTips: Array.isArray(data.preventionTips) ? data.preventionTips : []
      });
    } catch (err: any) {
      setError(language === "bn" ? "ফসল স্ক্যান করার সময় কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" : (err.message || "Something went wrong while scanning the crop. Please try again."));
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-brand-100 text-brand-600 px-4 py-2 rounded-full font-bold mb-6 text-sm uppercase tracking-wider"
          >
            <Zap className="w-4 h-4" /> {language === "bn" ? "এআই ফসল স্বাস্থ্য নির্ণয়" : "AI Crop Health Diagnostic"}
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-brand-950 mb-6 tracking-tighter">
            {language === "bn" ? "স্মার্ট রোগ" : "Smart Disease"} <span className="text-brand-500">{language === "bn" ? "শনাক্তকরণ" : "Detection"}</span>
          </h1>
          <p className="text-lg text-brand-900 font-bold max-w-2xl mx-auto leading-relaxed">
            {language === "bn" 
              ? "আপনার গাছের পাতার একটি পরিষ্কার ছবি আপলোড করুন যাতে তাৎক্ষণিকভাবে অভিজাত স্তরের নির্ভুলতার সাথে রোগ, কীটপতঙ্গ এবং পুষ্টির অভাব শনাক্ত করা যায়।" 
              : "Upload a clear photo of your plant's leaf to instantly identify diseases, pests, and nutrient deficiencies with elite-level precision."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Upload Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div 
              className={cn(
                "relative aspect-square rounded-[3rem] border-4 border-dashed transition-all duration-500 overflow-hidden group flex flex-col items-center justify-center bg-white",
                image ? "border-brand-500" : "border-gray-200 hover:border-brand-300"
              )}
            >
              {image ? (
                <>
                  <img src={image} alt="Crop to analyze" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={() => setImage(null)}
                      className="p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-colors"
                    >
                      <RefreshCcw className="w-6 h-6" />
                    </button>
                  </div>
                </>
              ) : (
                <div 
                  className="p-12 text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-24 h-24 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-600 mx-auto mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <Upload className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-brand-950 mb-2">{language === "bn" ? "এখানে ছবি ড্রপ করুন" : "Drop image here"}</h3>
                  <p className="text-brand-900/40 font-black uppercase tracking-widest text-[10px]">JPG, PNG up to 10MB</p>
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={handleFileUpload}
                accept="image/*"
              />

              {isScanning && (
                <div className="absolute inset-0 bg-brand-600/20 backdrop-blur-[2px] flex items-center justify-center flex-col overflow-hidden">
                  <motion.div
                    animate={{ y: [-200, 200] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 h-1 bg-brand-500 shadow-[0_0_20px_rgba(34,197,94,1)] z-20"
                  />
                  <div className="bg-white/95 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 relative z-30 border border-brand-100">
                    <RefreshCcw className="w-10 h-10 text-brand-600 animate-spin" />
                    <span className="font-black text-brand-950 tracking-tight uppercase text-xs">{t("ai.scanning")}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={handleScan}
                disabled={!image || isScanning}
                className={cn(
                  "w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                  image && !isScanning 
                    ? "bg-brand-600 text-white hover:bg-brand-700 shadow-xl shadow-brand-500/20" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                <Zap className="w-6 h-6" />
                {isScanning ? (language === "bn" ? "প্রসেসিং..." : "Processing...") : (language === "bn" ? "এআই স্ক্যানিং শুরু করুন" : "Start AI Scanning")}
              </button>
              
              <div className="flex items-center gap-4 py-4 px-6 glass rounded-2xl">
                <div className="p-2 bg-brand-50 rounded-lg">
                  <Info className="w-5 h-5 text-brand-600" />
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {language === "bn" 
                    ? "ভালো ফলাফলের জন্য, পাতাটি ভালোভাবে আলোকিত এবং ফ্রেমের বেশিরভাগ অংশ জুড়ে আছে কিনা তা নিশ্চিত করুন।" 
                    : "For better results, ensure the leaf is well-lit and covers most of the frame."}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  <div className="glass p-8 rounded-[3rem] border-brand-300 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-5">
                        <div className="p-4 bg-brand-600 text-white rounded-3xl shadow-xl shadow-brand-600/30">
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-brand-950 tracking-tight uppercase">{result.diseaseName}</h3>
                          <div className="flex items-center gap-3 mt-2">
                             <div className="w-40 h-2 bg-brand-50 rounded-full overflow-hidden border border-brand-100">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${result.confidence * 100}%` }}
                                  className="h-full bg-brand-500"
                                 />
                             </div>
                             <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">{Math.round(result.confidence * 100)}% {t("ai.confidence")}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="p-6 bg-brand-50/50 rounded-3xl">
                        <h4 className="font-bold flex items-center gap-2 text-brand-800 mb-3 text-sm uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4" /> {t("ai.causes")}
                        </h4>
                        <ul className="space-y-3">
                          {(result.causes || []).map((cause, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-brand-950 font-bold">
                              <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0 shadow-sm" />
                              {cause}
                            </li>
                          ))}
                        </ul>
                      </div>
 
                      <div className="p-6 bg-emerald-50/50 rounded-3xl">
                        <h4 className="font-bold flex items-center gap-2 text-emerald-800 mb-3 text-sm uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4" /> {t("ai.treatment")}
                        </h4>
                        <ul className="space-y-2">
                          {(result.treatment || []).map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                              <span className="font-bold text-emerald-600 shrink-0">{i + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
 
                  <div className="grid grid-cols-2 gap-6">
                    <div className="glass p-6 rounded-3xl">
                       <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t("ai.products")}</h4>
                       <div className="space-y-3">
                         {(result.recommendedProducts || []).map((p, i) => (
                           <div key={i} className="flex items-center justify-between text-sm group cursor-pointer p-2 hover:bg-brand-50 rounded-xl transition-colors">
                             <span className="font-medium text-gray-700">{p}</span>
                             <ChevronRight className="w-4 h-4 text-brand-400 group-hover:text-brand-600 translate-x-0 group-hover:translate-x-1 transition-all" />
                           </div>
                         ))}
                       </div>
                    </div>
                    <div className="glass p-6 rounded-3xl">
                       <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{t("ai.tips")}</h4>
                       <div className="space-y-3">
                         {(result.preventionTips || []).map((tip, i) => (
                           <div key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                             <div className="w-1 h-1 rounded-full bg-brand-500 mt-1 shrink-0" />
                             {tip}
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass p-12 rounded-[3.5rem] border-red-100 flex flex-col items-center text-center gap-6"
                >
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">{t("ai.failed")}</h3>
                  <p className="text-gray-500">
                    {error}
                  </p>
                  <button 
                    onClick={() => { setError(null); setImage(null); }}
                    className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold"
                  >
                    {t("ai.try_again")}
                  </button>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center glass p-12 rounded-[3.5rem] border-gray-100 bg-white/30 backdrop-blur-sm border-dashed">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-8">
                    <Zap className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-300 tracking-tight">{t("ai.awaiting")}</h3>
                  <p className="text-gray-400 text-sm mt-4 max-w-[200px] text-center">
                    {t("ai.awaiting_desc")}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
