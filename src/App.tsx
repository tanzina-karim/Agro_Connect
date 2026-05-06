import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  ShoppingBasket, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Package, 
  Truck, 
  ShoppingCart, 
  Plus, 
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  Settings,
  Menu,
  X,
  CreditCard,
  MapPin,
  Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Product, Role } from './types';

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import BuyerDashboard from './apps/buyer/BuyerDashboard';
import FarmerDashboard from './apps/farmer/FarmerDashboard';
import TransportDashboard from './apps/transporter/TransportDashboard';
import AdminDashboard from './apps/admin/AdminDashboard';
import ProductList from './apps/buyer/ProductList';
import Cart from './apps/buyer/Cart';
import PaymentGateway from './apps/buyer/PaymentGateway';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-emerald-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>;

  return (
    <Router>
      <div className="min-h-screen bg-emerald-50/40 text-slate-800 font-sans flex flex-col">
        <Navbar user={user} logout={logout} cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} />
        
        <main className="container mx-auto px-4 py-8 flex-1">
          <Routes>
            <Route path="/" element={<ProductList addToCart={addToCart} />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/cart" element={<Cart cart={cart} setCart={setCart} user={user} />} />
            <Route path="/payment-gateway" element={<PaymentGateway />} />
            
            <Route path="/dashboard" element={
              user ? (
                user.role === 'admin' ? <AdminDashboard /> :
                user.role === 'farmer' ? <FarmerDashboard user={user} /> :
                user.role === 'transport' ? <TransportDashboard user={user} /> :
                <BuyerDashboard user={user} />
              ) : <Navigate to="/login" />
            } />
          </Routes>
        </main>

        <footer className="bg-white border-t border-emerald-100 py-12 mt-auto">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center opacity-70">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                <Leaf size={16} />
              </div>
              <span className="font-bold tracking-tight text-emerald-900">AgroConnect</span>
            </div>
            <p className="text-sm text-slate-500">© 2024 AgroConnect Marketplace. Empowering Local Harvests.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function Navbar({ user, logout, cartCount }: { user: User | null, logout: () => void, cartCount: number }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-emerald-50 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Leaf size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-emerald-900">AgroConnect</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Marketplace</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors px-4 py-2 hover:bg-emerald-50 rounded-2xl">
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <div className="flex items-center gap-4 border-l border-emerald-50 pl-6">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">{user.role}</span>
                  <span className="text-sm font-bold text-slate-900">{user.username}</span>
                </div>
                <button onClick={logout} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-emerald-600">Login</Link>
              <Link to="/register" className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">Get Started</Link>
            </div>
          )}
          <Link to="/cart" className="relative p-2.5 text-slate-400 hover:text-emerald-600 bg-slate-50 rounded-xl transition-all">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <Link to="/cart" className="relative p-2 text-slate-400">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-emerald-50 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-2">Marketplace</Link>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-2">Dashboard</Link>
                  <div className="flex items-center justify-between py-2 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">{user.role}</span>
                      <span className="font-bold text-slate-900">{user.username}</span>
                    </div>
                    <button 
                      onClick={() => { logout(); setIsMenuOpen(false); }} 
                      className="text-red-500 font-black uppercase tracking-widest text-xs"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4 py-4">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="text-center py-4 font-bold text-slate-600 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="text-center py-4 font-bold bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
