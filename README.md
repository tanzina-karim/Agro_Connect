



# Agro Connect (Agri-Bangla) 🌾
**A Modern Bilingual Full-Stack Agriculture Marketplace & Logistics Platform**

Agro Connect is an innovative AgriTech platform designed to transform the traditional agricultural supply chain in Bangladesh. By eliminating middle-men, the platform creates a secure, automated network connecting four key stakeholders: **Farmers, Buyers, Couriers/Transporters, and Administrators**. 

Built with a role-based architecture, the platform features a real-time marketplace, an escrow-style payment workflow, a dynamic logistics pricing engine, and cutting-edge AI-powered crop disease diagnostics.

---

## 👥 Core Stakeholder Hubs & Features

### 1. Buyer Portal & Marketplace
* **Dynamic Search & Localized Filters:** Browse fresh produce by categories (Vegetables, Fruits, Grains, Dairy, Honey) with instant full-text search.
* **Weight-Based Dynamic Cart:** Interactive volume slider to adjust quantities; price and real-time logistics fees update dynamically based on weight and distance.
* **Real-Time Order Tracking:** A visual 5-stage lifecycle pipeline (*Order Placed → Approved → Paid → In Transit → Delivered*).
* **Simulated MFS Gateway:** In-dashboard bKash and Nagad payment simulator featuring OTP emulation and 2-step PIN verification.

### 2. Farmer Dashboard & Portal
* **Product Listing Engine:** Upload produce with descriptions, localized pricing per unit, weight availability, images, and live stock tracking.
* **Order Lifecycle Control:** Accept or reject buyer requests before any monetary transaction takes place to avoid stock discrepancies.
* **Fulfillment Dispatch:** Release orders to the internal transport pool or input tracking metrics for external couriers.

### 3. Courier & Transporter Portal
* **Logistics Job Board:** Available transport jobs appear instantly based on vehicle capacity matching (Bike, Van, Pickup).
* **Lifecycle Tracking:** Transporters progress orders through clear stages (*Collect Crops → Start Transit → Deliver Crops*) to automatically settle Cash on Delivery (COD) payouts.

### 4. 🧠 AI Crop Disease Detection Center
* Powered by the **Google Gemini 2.0 Flash** vision API.
* Allows farmers and buyers to snap or upload a photo of an infected plant leaf.
* Generates an instantaneous bilingual report detailing **Disease Name, Symptoms, Severity, and a localized Treatment Plan** tailored to the Bangladeshi climate.

### 5. Administrator Control Hub
* **Platform Analytics:** Real-time metrics for total users, active listings, gross revenue metrics, and order completion rates.
* **Revenue Control:** Dynamically adjust platform commission rates across the ecosystem instantly.

---

## 🛠️ Project Structure

Based on the development environment, the source code is modularized as follows:

```text
src/
├── components/       # Reusable UI Components (Navbar, Sidebar, Footer, Cards)
├── context/          # State Management & Global Providers (AuthContext.tsx, LanguageContext)
├── data/             # Mock Data, Categories, and Localized Content Strings
├── db/               # Firebase Database Configuration (db.ts)
├── hooks/            # Custom React Hooks for data fetching and authentication
├── pages/            # View Layouts (Marketplace, FarmerDashboard, CourierPortal, AdminHub, AIDetection)
├── types/            # TypeScript Interface & Type Definitions
├── App.tsx           # Application Core Router & Layout Wrapper
└── main.tsx          # Application Mounting Point



