import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Marketplace from "./pages/Marketplace";
import AIDetector from "./pages/AIDetector";
import FarmerDashboard from "./pages/FarmerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import TransporterDashboard from "./pages/TransporterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { motion, AnimatePresence } from "motion/react";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ProductProvider } from "./contexts/ProductContext";
import Checkout from "./pages/Checkout";
import { Toaster } from "sonner";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ProductProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Toaster position="top-right" richColors />
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/ai-detector" element={<AIDetector />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
                  <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
                  <Route path="/dashboard/transporter" element={<TransporterDashboard />} />
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </ProductProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
