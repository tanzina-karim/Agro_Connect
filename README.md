# 🌾 AgroConnect (এগ্রো-কানেক্ট)

A premium full-stack, smart agriculture marketplace and supply-chain logistics ecosystem. **AgroConnect** preserves equitable trade by directly connecting rural & urban farmers with buyers, eliminating costly middlemen margins, integrating independent transporters for fleet logistics, providing real-time cargo weight-based dispatchers, and embedding an AI-powered diagnostic laboratory for plant disease identification.

[![React](https://img.shields.io/badge/Frontend-React%2019-61dafb?style=flat-glowing&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20v4-38bdf8?style=flat-glowing&logo=tailwindcss)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Backend-Express%20v4-000000?style=flat-glowing&logo=express)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Database-Firebase%20%26%20Auth-ffca28?style=flat-glowing&logo=firebase)](https://firebase.google.com/)
[![Gemini](https://img.shields.io/badge/AI%20Engine-Gemini%20API%20SDK-8e75ff?style=flat-glowing&logo=google-gemini)](https://ai.google.dev/)
[![Bilingual](https://img.shields.io/badge/Language-English%20%7C%20বাংলা-emerald?style=flat-glowing)](#bilingual-support)

---

## 📖 Table of Contents
- [✨ Core Vision & Product Goals](#-core-vision--product-goals)
- [🛡️ Multi-Role Ecosystem & Features](#️-multi-role-ecosystem--features)
- [🧠 AI Leaf Diagnostic Laboratory](#-ai-leaf-diagnostic-laboratory)
- [💳 MFS Interactive Sandbox Gateways (bKash & Nagad)](#-mfs-interactive-sandbox-gateways-bkash--nagad)
- [📦 Logistics & Delivery Automations](#-logistics--delivery-automations)
- [🛠️ Tech Stack & Architecture](#️-tech-stack--architecture)
- [🔌 API Endpoints Contract](#-api-endpoints-contract)
- [🗄️ Database Schema Representation](#️-database-schema-representation)
- [🚀 Quick Start & Local Setup](#-quick-start--local-setup)
- [🌐 Bilingual Support](#-bilingual-support)

---

## ✨ Core Vision & Product Goals

In conventional agricultural frameworks, small-scale farmers often lose substantial profits to multiple third-party middlemen corridors before their crop yields reach town markets. Large delivery fees and unpredictable transport issues increase waste, while structural crop diseases can silently destroy entire harvest blocks.

**AgroConnect** solves this across three main pillars:
1. **Direct Equitable Trade:** Farmers directly showcase crop yields, setting their own baseline prices, and bypass intermediary margins.
2. **Dynamic Logistical Corridors:** Integrated third-party transporters request delivery freights, claim regional routes, and coordinate live transits.
3. **AI Proactive Crop Protection:** Farmers scan leaves instantly using a camera or files to detect pathogens, receiving guided chemical recipes and preventative care.

---

## 🛡️ Multi-Role Ecosystem & Features

AgroConnect handles user roles securely. When registering, clients set their operational profile:

### 🌾 1. Farmers (খামারি পোর্টাল)
*   **Harvest Listings Manager:** Sell crop outputs with custom high-contrast visual uploads, categorizations, weight restrictions, and precise packaging unit options.
*   **Smart Pricing:** Balance margins by choosing Cash on Delivery (COD) or advance mobile financial payments.
*   **Order Control Room:** Accept or reject bulk/fractional incoming purchase requests.
*   **Freight Dispatch Center:** Coordinate shipment handovers, track driver contacts, and update crop statuses after collection.

### 🛒 2. Buyers (গ্রাহক ড্যাশবোর্ড)
*   **Dynamic Agribusiness Browse:** Instant search and multi-filtering across crop categories (grains, fresh vegetables, seeds, organic fertilizers).
*   **Live Cart & Cost Estimators:** Calculate cumulative weights to dynamically determine shipping rates and match vehicle types.
*   **Framer Motion Interactive Checkout:** Pay securely via dynamic Cash on Delivery or fully integrated bKash/Nagad banking flows.
*   **Milestone Tracker:** View order fulfillment via an elegant visual timeline (Accepted ➔ Paid ➔ Collected ➔ Shipped ➔ Delivered).
*   **Consumer Reviews:** Provide feedback ratings directly on individual crop orders to build trust scores.

### 🚚 3. Transporters (পরিবহন চালক ও বহর)
*   **Open Delivery Openings:** Claim available freights filtering by target hubs or vehicle constraints.
*   **Route Claims:** Handle pre-paid or cash-based logistics while tracking caller phones, cargo weights, and delivery instructions.
*   **Transit Milestones:** Update trip progress stages (Collected ➔ Shipped ➔ Delivered) directly to buyers and farmers.

### 👑 4. Administrators (সিস্টেম প্রশাসন)
*   **Global Overview Hub:** Monitor overall platform activity, active users, products list, and order volumes.
*   **Revenue Auditing:** Track platform commission splits, calculated dynamically from completed shipments.
*   **Dispute Center:** Identify logistics requiring immediate intervention (e.g., transit delays, mismatched payments).

---

## 🧠 AI Leaf Diagnostic Laboratory

Farmers can diagnose leaf spots, pests, and bacterial infections instantly through a dedicated diagnostics page.

*   **Google GenAI SDK Integration:** Backed by the official server-side `@google/genai` module, utilizing advanced Gemini model prompts.
*   **Localized Disease Encyclopedia:** Supports robust fallback matches for common regional crop threats (Late Blight, Rice Leaf Blast, Early Blight, Leaf Rust).
*   **Structured Recommendations:** Provides:
    *   **Scientific Diagnostics:** Causes of damage (e.g., fungi, moisture, excessive nitrogen).
    *   **Instant Treatments:** Actionable steps like foliage pruning or targeted copper/metalaxyl fustings.
    *   **Bangladeshi Prescription Matching:** Links to well-known agricultural products (e.g., Ridomil Gold, Autostin, Nativo by Bayer).
    *   **Prevention Guides:** Recommendations for balanced NPK fertilization, optimal spacing, and certified seeds.

---

## 💳 MFS Interactive Sandbox Gateways (bKash & Nagad)

To prevent financial fraud, AgroConnect implements a two-step payment escrow model:
1.  **Authorization Stage:** Buyers select bKash/Nagad at checkout and submit an "Order Request". Orders are placed in a `pending` state with **no initial payment prompt**, allowing farmers to verify crop stock first.
2.  **Post-Acceptance Escrow:** Once the farmer formally reviews and clicks **Accept**, the buyer's dashboard lights up with a **PAY NOW** prompt.
3.  **Simulated Gateway Modal:** Clicking the payment button opens an immersive, brand-themed sandbox payment modal (Pink for bKash, Red for Nagad) simulating a secure terminal:
    *   **Interactive Input:** 11-digit mobile wallet validation.
    *   **Dual-Step Verification:** Real-time generation of random Sandbox Test OTP security codes.
    *   **Secure Authentication:** Safe transaction PIN masking (simulated securely on client-side).
    *   **Cryptographic Tracing:** Generates an official payment receipt ID (`TRX_BKASH_...` or `TRX_NAGAD_...`) on successful verification, updating the order to `paid` to authorize delivery dispatch.

---

## 📦 Logistics & Delivery Automations

The checkout calculator automatically maps crop totals to standard parcel-tier parameters to prevent shipping bottlenecks:

*   **Automatic Weight Prescriptions:**
    *   📦 **0 - 30 KG:** Dispatched via **Bike Courier** for nimble urban deliveries.
    *   🚐 **31 - 200 KG:** Dispatched via **Light Commercial Van** for medium rural-to-urban shipping.
    *   🚛 **Over 200 KG:** Dispatched via heavy **Pickup Truck** for bulk logistics.
*   **Integrated Courier Providers:** Select and schedule standard delivery modes (Inside Dhaka / Outside Dhaka) powered by regional courier services like **Pathao** and **RedX**.

---

## 🛠️ Tech Stack & Architecture

AgroConnect utilizes a performant, modular full-stack architecture built completely in TypeScript:

```
                  ┌───────────────────────────────────────────────┐
                  │                 REACT 19 SPA                  │
                  │  (Vite, Tailwind v4, Framer Motion, Leaflet)  │
                  └─────────┬───────────────────────────▲─────────┘
                            │                           │
                   JSON API Requests             State / Auth Triggers
                            │                           │
  ┌─────────────────────────▼──────────────┐   ┌────────┴─────────────────┐
  │         EXPRESS BACKEND SERVER         │   │   FIREBASE FIRESTORE     │
  │     (TSX Node / esbuild Single CJS)     │   │      DATABASE & AUTH     │
  └─────────┬───────────────▲──────────────┘   └──────────────────────────┘
            │               │
      Gemini Prompts  Diagnostic Results
            │               │
  ┌─────────▼───────────────┴──────────────┐
  │       GOOGLE GEMINI AI API SDK         │
  │         (server-side proxy)            │
  └────────────────────────────────────────┘
```

### Frontend Environment
*   **React 19 & Router Dom v7:** Decoupled layout routing and state-driven hooks.
*   **Tailwind CSS v4:** Modern `@theme`-driven styling using fluid configurations, deep slate tones, emerald greens, and high-contrast typography.
*   **Framer Motion:** Powered by `@motion/react` for elegant sliders, card entries, fade-in loading models, and payment loaders.
*   **Leaflet Maps:** Real-time dynamic logistics maps displaying transit checkpoints.
*   **Recharts:** Scalable analytical charts rendering administrator commissions and platform trends.
*   **Sonner Toasts:** Notifications for transactions, updates, role changes, or alerts.

### Backend Environment
*   **Node.js / Express v4:** Houses server-side API routers, secure AI integrations, and static asset builds.
*   **esbuild Bundler:** Transpiles high-performance TS server into a single consolidated `dist/server.cjs` file, bypassing ES module compatibility layers.
*   **tsx Loader:** Live, lightning-fast TypeScript direct execution model for the local development server.

---

## 🔌 API Endpoints Contract

To ensure security, sensitive API keys are stored entirely server-side. The client accesses AI features through secure, server-side Express proxies:

### 1. Plant Leaf Disease Diagnostic
```http
POST /api/ai/detect-disease
```
*   **Content-Type:** `application/json`
*   **Request Payload:**
    ```json
    {
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQE...", 
      "language": "en" | "bn"
    }
    ```
*   **Response Payload (Structured JSON Schema):**
    ```json
    {
      "diseaseKey": "earlyblight" | "riceblast" | "rust" | "unknown",
      "diseaseName": "Tomato Early Blight",
      "confidence": 94.5,
      "analysis": "Severe dark concentric ring spots found radiating across the leaf structure...",
      "causes": ["Alternaria solani fungus", "Excessive ambient humidity"],
      "treatment": ["Prune damaged lower leaves", "Apply targeted Mancozeb fungicide"],
      "recommendedProducts": ["Mancozeb Fungicide", "Copper Oxychloride"],
      "preventionTips": ["Rotate crops next season", "Maintain spacing for dry air circulation"]
    }
    ```

### 2. Conversational Agri-Advisor Assistant
```http
POST /api/ai/chat
```
*   **Content-Type:** `application/json`
*   **Request Payload:**
    ```json
    {
      "message": "My rice leaves have orange dusty stripes, what is this?",
      "history": [
        { "role": "user", "parts": [{ "text": "Hello AgroConnect advisor" }] },
        { "role": "model", "parts": [{ "text": "Welcome! I am your AI farming assistant. How can I protect your crops today?" }] }
      ]
    }
    ```
*   **Response Payload:**
    ```json
    {
      "reply": "This sounds like Leaf Rust, caused by Puccinia fungus. You should apply Propiconazole (Tilt) and ensure your fields have good water drainage."
    }
    ```

---

## 🗄️ Database Schema Representation

The application relies on a unified, real-time Firebase Firestore database. Below is a structural outline of key collections managed in the system:

### 📂 `users`
```typescript
{
  uid: string;           // Match Firebase Auth ID
  email: string;
  name: string;
  role: "farmer" | "buyer" | "transporter" | "admin";
  phone?: string;
  location?: string;
  photoURL?: string;
  createdAt: timestamp;
}
```

### 📂 `products`
```typescript
{
  id: string;            // Auto-generated ID
  name: string;          // Crop product name
  category: "all" | "crops" | "vegetables" | "seeds" | "others";
  price: number;         // Price in BDT (৳)
  unit: "kg" | "mound" | "ton" | "piece";
  stock: number;
  image: string;         // Asset image URL
  farmerId: string;      // Selling Farmer uid
  farmerName: string;
  location: string;
  description: string;
  createdAt: timestamp;
}
```

### 📂 `orders`
```typescript
{
  id: string;
  buyerId: string;       // Buying User uid
  buyerName: string;
  farmerId: string;      // Farmer uid
  farmerName: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: "cod" | "bkash" | "nagad";
  status: "pending" | "accepted" | "rejected" | "paid" | "shipment_accepted" | "collected" | "shipped" | "delivered";
  deliveryAddress: {
    street: string;
    city: string;
    phone: string;
  };
  deliveryMode: "inside" | "outside";
  courier?: string;      // "pathao" | "redx" etc.
  transporterId?: string; // Driver claiming delivery
  transporterName?: string;
  transporterPhone?: string;
  transactionId?: string; // Simulated payment proof
  createdAt: timestamp;
}
```

---

## 🚀 Quick Start & Local Setup

Deploy and test the application on your local machine using the following instructions:

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Firebase Console Project](https://console.firebase.google.com/) configured with:
    *   **Firestore Database** enabled.
    *   **Firebase Authentication** (Email/Password provider enabled).

### 1. Clone the Project & Install Dependencies
```bash
# Clone this repository
git clone https://github.com/YOUR_GITHUB_USERNAME/agroconnect.git
cd agroconnect

# Install pre-defined dependencies
npm install
```

### 2. Set Up Environment Variables (`.env`)
Create a `.env` file in the root directory based on the provided `.env.example`:
```env
# Google Gemini API credential (Server-side proxy)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Web App client configuration credentials
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run in Development Mode
Launch the server. tsx executes both the Express server backend and mounts Vite's hot-reload middleware automatically under port `3000`:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Build and Run in Production
1.  Compile both the React bundle and server TS code:
    ```bash
    npm run build
    ```
2.  Launch the standalone production server:
    ```bash
    npm run start
    ```

---

## 🌐 Bilingual Support

AgroConnect is built from the ground up for use in local agricultural contexts, offering full bilingual support (English and Bengali):

*   **Dynamic Language Contexts:** Toggle seamlessly between **English** and **বাংলা** (Bengali) translation dictionaries instantly, without page refreshes.
*   **Interactive Controls:** Localized interfaces, buttons, notifications, forms, maps, and error messages ensure the platform remains accessible to rural farmers.

---

*Crafted for sustainable agriculture, secure trade, and transparent logistics. Protect your crops and grow your trades with **AgroConnect**!*
