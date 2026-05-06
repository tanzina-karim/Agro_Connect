import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, CreditCard, Smartphone, CheckCircle } from 'lucide-react';

export default function PaymentGateway() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const [method, setMethod] = useState<'ssl' | 'bkash' | 'nagad' | null>(null);
  const [step, setStep] = useState(1);

  const handlePay = () => {
    setStep(2);
    setTimeout(() => {
      setStep(3);
    }, 2000);
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-xl border border-emerald-100 text-center max-w-lg w-full"
        >
          <div className="w-24 h-24 bg-emerald-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-emerald-600">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Payment Complete</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">Your payment of ৳{Number(amount).toLocaleString()} for order #{orderId} has been successfully processed.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black hover:bg-emerald-700 transition-all uppercase tracking-widest shadow-xl shadow-emerald-100"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[3rem] shadow-xl border border-slate-100 max-w-md w-full overflow-hidden"
      >
        <div className="bg-emerald-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck size={24} />
            <span className="font-black tracking-widest text-xs uppercase opacity-80">Secure Checkout</span>
          </div>
          <p className="text-sm font-medium opacity-80 mb-1">Total Payable</p>
          <h2 className="text-4xl font-black">৳{Number(amount).toLocaleString()}</h2>
          <p className="text-xs font-bold mt-4 opacity-60 uppercase tracking-widest">Order ID: #{orderId}</p>
        </div>

        <div className="p-8 space-y-6">
          {step === 1 ? (
            <>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Choose Payment Method</h3>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setMethod('ssl')}
                  className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${method === 'ssl' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-50 hover:bg-slate-50'}`}
                >
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-blue-600">
                        <CreditCard size={20} />
                     </div>
                     <span className="font-bold text-slate-700">SSLCommerz (Cards)</span>
                   </div>
                   {method === 'ssl' && <div className="w-3 h-3 bg-emerald-600 rounded-full" />}
                </button>

                <button 
                  onClick={() => setMethod('bkash')}
                  className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${method === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-slate-50 hover:bg-slate-50'}`}
                >
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-pink-600 font-black italic">
                        bk
                     </div>
                     <span className="font-bold text-slate-700">bKash Mobile</span>
                   </div>
                   {method === 'bkash' && <div className="w-3 h-3 bg-pink-500 rounded-full" />}
                </button>

                <button 
                  onClick={() => setMethod('nagad')}
                  className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${method === 'nagad' ? 'border-orange-500 bg-orange-50' : 'border-slate-50 hover:bg-slate-50'}`}
                >
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-orange-600">
                        <Smartphone size={20} />
                     </div>
                     <span className="font-bold text-slate-700">Nagad Mobile</span>
                   </div>
                   {method === 'nagad' && <div className="w-3 h-3 bg-orange-500 rounded-full" />}
                </button>
              </div>

              <button 
                disabled={!method}
                onClick={handlePay}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-black transition-all uppercase tracking-widest disabled:opacity-20 mt-4 h-16 flex items-center justify-center"
              >
                {method ? `Pay ৳${Number(amount).toLocaleString()}` : 'Select Method'}
              </button>
            </>
          ) : (
            <div className="py-12 text-center text-slate-600">
               <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6"></div>
               <p className="font-black uppercase tracking-widest text-[10px]">Processing Transaction...</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
