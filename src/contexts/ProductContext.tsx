import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  farmerId: string;
  farmerName: string;
  location: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  stock: number;
  description: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'paid' | 'shipment_accepted' | 'collected' | 'shipped' | 'delivered';
  paymentMethod?: 'cod' | 'bkash' | 'nagad';
  deliveryAddress?: {
    street: string;
    city: string;
    phone: string;
  };
  transporterId?: string;
  transporterName?: string;
  transporterPhone?: string;
  transporterLocation?: {
    lat: number;
    lng: number;
  };
  createdAt: any;
  updatedAt: any;
}

export interface CartItem extends Product {
  quantity: number;
}

interface ProductContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id' | 'farmerId' | 'farmerName'>) => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (address: { street: string; city: string; phone: string }, paymentMethod: 'cod' | 'bkash' | 'nagad') => Promise<string[]>;
  updateOrderStatus: (orderId: string, status: Order['status'], extra?: any) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const lastStatusesRef = useRef<Record<string, string>>({});

  const STATUS_LABELS: Record<string, any> = {
    pending: { bn: 'অপেক্ষিত', en: 'Pending' },
    accepted: { bn: 'গৃহীত', en: 'Accepted' },
    rejected: { bn: 'বাতিল', en: 'Rejected' },
    paid: { bn: 'পরিশোধিত', en: 'Paid' },
    shipment_accepted: { bn: 'পরিবহনকারী গ্রহণ করেছে', en: 'Shipment Accepted' },
    collected: { bn: 'সংগৃহীত', en: 'Collected' },
    shipped: { bn: 'পরিবহনে', en: 'In Transit' },
    delivered: { bn: 'পৌঁছেছে', en: 'Delivered' }
  };

  useEffect(() => {
    if (!orders.length) return;
    
    orders.forEach(order => {
      const lastStatus = lastStatusesRef.current[order.id];
      if (lastStatus && lastStatus !== order.status) {
        const label = STATUS_LABELS[order.status][language] || order.status;
        
        // Notify based on role
        if (user?.role === 'buyer' || user?.role === 'farmer') {
          toast.info(
            language === 'bn' 
              ? `${order.productName}: স্ট্যাটাস পরিবর্তন - ${label}` 
              : `${order.productName}: Status updated to '${label}'`,
            { 
              description: `ID: ${order.id.slice(-6).toUpperCase()}`,
              duration: 5000
            }
          );
        }
      }
      lastStatusesRef.current[order.id] = order.status;
    });
  }, [orders, language, user]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("agro_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("agro_cart", JSON.stringify(cart));
  }, [cart]);

  // Listen to all products for Marketplace
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
    });
    return () => unsubscribe();
  }, []);

  // Listen to orders relevant to the current user
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    const ordersRef = collection(db, "orders");
    let q;
    if (user.role === 'farmer') {
      q = query(ordersRef, where("farmerId", "==", user.uid));
    } else if (user.role === 'buyer') {
      q = query(ordersRef, where("buyerId", "==", user.uid));
    } else {
      q = query(ordersRef);
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ords);
    }, (error) => {
      console.error("Orders Listener Error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const addProduct = async (newProduct: Omit<Product, 'id' | 'farmerId' | 'farmerName'>) => {
    if (!user || user.role !== 'farmer') return;
    
    await addDoc(collection(db, "products"), {
      ...newProduct,
      farmerId: user.uid,
      farmerName: user.name,
      createdAt: serverTimestamp()
    });
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart => 
      prevCart.map(item => item.id === productId ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (address: { street: string; city: string; phone: string }, paymentMethod: 'cod' | 'bkash' | 'nagad'): Promise<string[]> => {
    if (!user || cart.length === 0) return [];

    const orderPromises = cart.map(item => {
      return addDoc(collection(db, "orders"), {
        buyerId: user.uid,
        buyerName: user.name,
        farmerId: item.farmerId,
        farmerName: item.farmerName,
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        totalAmount: item.price * item.quantity,
        status: 'pending',
        paymentMethod,
        deliveryAddress: address,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    const results = await Promise.all(orderPromises);
    clearCart();
    return results.map(docRef => docRef.id);
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], extra?: any) => {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
      ...extra
    });
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      cart, 
      orders,
      addProduct, 
      addToCart, 
      removeFromCart, 
      updateCartQuantity, 
      clearCart,
      placeOrder,
      updateOrderStatus
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
