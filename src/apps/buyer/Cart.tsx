import { motion } from 'motion/react';
import { ShoppingBag, Trash2, CreditCard, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Product, User } from '../../types';
import React, { useState } from 'react';

export default function Cart({ 
  cart, 
  setCart, 
  user 
}: { 
  cart: {product: Product, quantity: number}[], 
  setCart: React.Dispatch<React.SetStateAction<{product: Product, quantity: number}[]>>,
  user: User | null
}) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Standard' | 'Cash'>('Standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const navigate = useNavigate();

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const removeItem = (id: number) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          })),
          total_amount: total,
          shipping_address: shippingAddress,
          payment_method: paymentMethod === 'Standard' ? 'Online Payment' : 'Cash on Delivery'
        })
      });

      const orderData = await res.json();

      if (res.ok) {
        if (paymentMethod === 'Standard') {
          setIsProcessing(true);
          const payRes = await fetch('/api/payment/sslcommerz/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: total, orderId: orderData.orderId })
          });
          const payData = await payRes.json();
          setCart([]);
          window.location.href = payData.gatewayPageURL;
        } else {
          setCart([]);
          setOrderComplete(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="w-24 h-24 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-8"></div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Processing Payment</h2>
        <p className="text-slate-500 font-medium">Please do not refresh the page...</p>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600 shadow-sm"
        >
          <CreditCard size={48} />
        </motion.div>
        <h2 className="text-4xl font-black mb-4 tracking-tight text-slate-900">ORDER PLACED!</h2>
        <p className="text-slate-600 mb-10 text-lg">Your transaction is being processed and a transporter will be assigned shortly.</p>
        <Link 
          to="/dashboard" 
          className="inline-block bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200 active:scale-95"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-3xl border border-emerald-100 shadow-sm px-6">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShoppingBag size={48} className="text-slate-300" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-slate-900">Your cart is empty</h2>
        <p className="text-slate-500 mb-10 text-lg">Looks like you haven't added any fresh produce yet.</p>
        <Link 
          to="/" 
          className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold inline-flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200 active:scale-95"
        >
          <ArrowLeft size={20} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 px-4">
      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">SHOPPING CART</h1>
          <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-bold">
            {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        
        <div className="space-y-4">
          {cart.map(item => (
            <motion.div 
              key={item.product.id}
              layout
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-5 rounded-3xl border border-emerald-50 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-50">
                 {item.product.image_url ? (
                   <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-300">
                     <ShoppingBag size={32} />
                   </div>
                 )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-black text-amber-600 tracking-widest mb-1">{item.product.category}</p>
                <h3 className="font-bold text-xl text-slate-900 truncate">{item.product.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                    ৳{item.product.price.toFixed(2)}
                  </span>
                  <span className="text-slate-400 text-sm">× {item.quantity}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-2xl text-slate-900 mb-3">৳{(item.product.price * item.quantity).toFixed(2)}</p>
                <button 
                  onClick={() => removeItem(item.product.id)} 
                  className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                  title="Remove from cart"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="lg:sticky lg:top-24 h-fit">
        <div className="bg-white p-8 rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-900/5">
          <h2 className="text-2xl font-bold mb-8 text-slate-900">Order Summary</h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold text-slate-900">৳{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">Shipping</span>
              <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded">FREE</span>
            </div>
            <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-3xl font-black text-emerald-600">৳{total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {!isCheckingOut ? (
            <button 
              onClick={() => setIsCheckingOut(true)}
              className="w-full bg-emerald-600 text-white py-5 rounded-[1.25rem] font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]"
            >
              Checkout <ChevronRight size={20} />
            </button>
          ) : (
            <div className="space-y-5">
               <div>
                 <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Shipping Address</label>
                 <textarea 
                   className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-800 text-sm h-28 resize-none transition-all"
                   placeholder="Enter your full street address, city, and zip code"
                   value={shippingAddress}
                   onChange={e => setShippingAddress(e.target.value)}
                 />
               </div>
               <div>
                 <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Payment Method</label>
                 <div className="grid grid-cols-2 gap-3">
                   {[
                     { id: 'Standard', label: 'Online Payment' },
                     { id: 'Cash', label: 'Cash on Delivery' }
                   ].map(m => (
                     <button
                       key={m.id}
                       onClick={() => setPaymentMethod(m.id as any)}
                       className={`p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest leading-tight transition-all border-2 h-20 flex items-center justify-center text-center ${
                         paymentMethod === m.id 
                           ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
                           : 'bg-slate-50 text-slate-400 border-transparent hover:border-emerald-100 hover:bg-white'
                       }`}
                     >
                       {m.label}
                     </button>
                   ))}
                 </div>
               </div>
               <button 
                 onClick={handleCheckout}
                 disabled={!shippingAddress}
                 className="w-full bg-emerald-600 text-white py-5 rounded-[1.25rem] font-bold shadow-lg shadow-emerald-200 disabled:opacity-40 disabled:shadow-none hover:bg-emerald-700 transition-all active:scale-[0.98] mt-2"
               >
                 Place Order
               </button>
               <button 
                 onClick={() => setIsCheckingOut(false)} 
                 className="w-full text-xs font-black uppercase tracking-widest text-slate-400 py-2 hover:text-slate-600 transition-colors"
               >
                 Back to cart
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
