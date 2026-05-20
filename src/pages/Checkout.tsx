import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, ShoppingBag, CreditCard, Truck, 
  CheckCircle2, Plus, Minus, Trash2, ArrowRight,
  Smartphone, Wallet, MapPin
} from "lucide-react";
import { cn } from "../lib/utils";
import { useProducts } from "../contexts/ProductContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

type PaymentMethod = "bkash" | "nagad" | "cod";

export default function Checkout() {
  const { cart, removeFromCart, updateCartQuantity, clearCart, placeOrder } = useProducts();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    phone: ""
  });
  const [isOrdered, setIsOrdered] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = cart.length > 0 ? 50 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !user) return;
    if (!address.street || !address.city || !address.phone) {
      alert(language === "bn" ? "অনুগ্রহ করে ঠিকানা এবং ফোন নম্বর পূরণ করুন" : "Please fill in address and phone number");
      return;
    }

    setIsPlacing(true);
    try {
      await placeOrder(address, paymentMethod);
      
      setIsOrdered(true);
      setTimeout(() => {
        clearCart();
      }, 2000);
    } catch (err: any) {
      alert(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[3.5rem] shadow-2xl text-center max-w-md w-full"
        >
          <div className="w-24 h-24 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-brand-950 mb-4 tracking-tight">
            {language === "bn" ? "অর্ডার সফল হয়েছে!" : "Order Placed Successfully!"}
          </h2>
          <p className="text-brand-900 font-bold mb-10 leading-relaxed uppercase text-[10px] tracking-[0.2em]">
            {language === "bn" ? "আপনার অর্ডারের জন্য ধন্যবাদ। শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।" : "Thank you for your order. We will contact you shortly."}
          </p>
          <button 
            onClick={() => navigate("/")}
            className="w-full bg-brand-600 text-white py-5 rounded-2xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-500/20"
          >
            {language === "bn" ? "হোমপেজে ফিরে যান" : "Back to Home"} <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-brand-600 transition-colors mb-4 group">
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            {language === "bn" ? "বাজারে ফিরে যান" : "Back to Marketplace"}
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-brand-950 tracking-tighter">
            {language === "bn" ? "চেকআউট" : "Checkout"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-brand-100">
              <h3 className="text-2xl font-black text-brand-950 mb-8 flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-brand-600" />
                {language === "bn" ? "আপনার পণ্যসমূহ" : "Your Items"}
              </h3>

              {cart.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-bold">{language === "bn" ? "আপনার কার্ট খালি" : "Your cart is empty"}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-6 p-4 bg-gray-50 rounded-3xl group">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-black text-brand-950 mb-1 uppercase text-sm tracking-tight">{item.name}</h4>
                        <Link 
                          to={`/profile/${item.farmerId}-farmer`}
                          className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-4 hover:text-brand-700 transition-colors block"
                        >
                          {item.farmerName}
                        </Link>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-black text-brand-600">৳{item.price}</div>
                          <div className="flex items-center gap-4 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                             <button 
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                             >
                               <Minus className="w-4 h-4 text-gray-600" />
                             </button>
                             <span className="font-black text-gray-900 text-sm px-2">{item.quantity}</span>
                             <button 
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                             >
                               <Plus className="w-4 h-4 text-gray-600" />
                             </button>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Address */}
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-brand-600" />
                  {language === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery Address"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">{language === "bn" ? "রাস্তা ও বাড়ি নং" : "Street Address"}</label>
                      <input 
                        type="text" 
                        value={address.street}
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                        placeholder={language === "bn" ? "বাড়ি নং, রাস্তা নং..." : "House no, Street name..."}
                        className="w-full bg-gray-50 border-2 border-gray-50 p-4 rounded-2xl focus:border-brand-500 focus:bg-white transition-all outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{language === "bn" ? "শহর" : "City"}</label>
                      <input 
                        type="text" 
                        value={address.city}
                        onChange={(e) => setAddress({...address, city: e.target.value})}
                        placeholder={language === "bn" ? "ঢাকা" : "Dhaka"}
                        className="w-full bg-gray-50 border-2 border-gray-50 p-4 rounded-2xl focus:border-brand-500 focus:bg-white transition-all outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{language === "bn" ? "ফোন নম্বর" : "Phone Number"}</label>
                      <input 
                        type="tel" 
                        value={address.phone}
                        onChange={(e) => setAddress({...address, phone: e.target.value})}
                        placeholder="017XXXXXXXX"
                        className="w-full bg-gray-50 border-2 border-gray-50 p-4 rounded-2xl focus:border-brand-500 focus:bg-white transition-all outline-none"
                      />
                   </div>
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-brand-600" />
                  {language === "bn" ? "পেমেন্ট পদ্ধতি" : "Payment Method"}
                </h3>
                
                <div className="mb-6 bg-brand-50/50 p-4 rounded-2xl border border-brand-100 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-brand-600" />
                      <div>
                         <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{language === "bn" ? "পরিবহনকারী" : "Transporter"}</div>
                         <Link to="/profile/jasim_transport-transporter" className="text-sm font-bold text-gray-900 hover:text-brand-600">{language === "bn" ? "জসিম ট্রান্সপোর্ট" : "Jasim Transport"}</Link>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{language === "bn" ? "ট্রাস্ট স্কোর" : "Trust"}</div>
                      <div className="text-sm font-black text-brand-600">{language === "bn" ? "৯৬%" : "96%"}</div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'bkash', label: 'bKash', icon: <Smartphone />, color: 'bg-pink-50 text-pink-600 border-pink-100' },
                    { id: 'nagad', label: 'Nagad', icon: <Wallet />, color: 'bg-orange-50 text-orange-600 border-orange-100' },
                    { id: 'cod', label: language === "bn" ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery', icon: <Truck />, color: 'bg-brand-50 text-brand-600 border-brand-100' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                      className={cn(
                        "p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all",
                        paymentMethod === method.id 
                          ? "border-brand-500 bg-white" 
                          : "border-gray-50 bg-gray-50 grayscale hover:grayscale-0 hover:border-brand-200"
                      )}
                    >
                      <div className={cn("p-4 rounded-2xl", method.color)}>
                        {method.icon}
                      </div>
                      <span className="font-bold text-sm text-gray-900">{method.label}</span>
                    </button>
                  ))}
                </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[3.5rem] shadow-xl border border-gray-100 sticky top-32">
               <h3 className="text-2xl font-black text-gray-900 mb-8">
                 {language === "bn" ? "অর্ডার সারাংশ" : "Order Summary"}
               </h3>
               
               <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>{language === "bn" ? "উপ-মোট" : "Subtotal"}</span>
                    <span>৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium font-sans">
                    <span>{language === "bn" ? "ডেলিভারি ফি" : "Delivery Fee"}</span>
                    <span>৳{deliveryFee}</span>
                  </div>
                  <div className="h-[1px] bg-gray-100 my-4" />
                  <div className="flex justify-between text-2xl font-black text-gray-900">
                    <span>{language === "bn" ? "মোট" : "Total"}</span>
                    <span>৳{total}</span>
                  </div>
               </div>

               <button 
                onClick={handlePlaceOrder}
                disabled={cart.length === 0}
                className={cn(
                  "w-full py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-2",
                  cart.length === 0 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-brand-600 text-white hover:bg-brand-700 shadow-xl shadow-brand-500/30 transform hover:-translate-y-1 active:translate-y-0"
                )}
               >
                 {language === "bn" ? "অর্ডার সম্পন্ন করুন" : "Complete Order"} <ArrowRight className="w-5 h-5" />
               </button>

               <div className="mt-8 flex items-center gap-4 justify-center text-gray-400">
                  <CheckCircle2 className="w-5 h-5 text-brand-500" />
                  <span className="text-xs font-black uppercase tracking-widest leading-none mt-1">{language === "bn" ? "স্বচ্ছ ও নিরাপদ ১০০% পেমেন্ট" : "Transparent & Secure 100% Payment"}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
