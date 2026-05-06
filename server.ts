import express from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import db from "./db.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(session({
    secret: 'agro-secret-key',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: { 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // SSE Notification System
  let clients: { id: number, res: express.Response }[] = [];

  app.get("/api/notifications/subscribe", (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).end();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const client = { id: userId, res };
    clients.push(client);

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    req.on('close', () => {
      clearInterval(heartbeat);
      clients = clients.filter(c => c.res !== res);
      res.end();
    });
  });

  const notifyUser = (userId: number, data: any) => {
    const userClients = clients.filter(c => c.id === userId);
    userClients.forEach(c => {
      c.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  };

  // Mock Notification Services
  const sendEmail = (to: string, subject: string, body: string) => {
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
    console.log(`Body: ${body}`);
  };

  const sendSMS = (to: string, message: string) => {
    console.log(`[SMS SENT] To: ${to} | Message: ${message}`);
  };

  // SSLCommerz Simulation Routes
  app.post("/api/payment/sslcommerz/init", (req, res) => {
    const { amount, orderId } = req.body;
    // In real life, you'd call SSLCommerz API here to get a gateway URL
    // We'll return a simulated success URL
    res.json({
      status: 'SUCCESS',
      gatewayPageURL: `/payment-gateway?orderId=${orderId}&amount=${amount}`
    });
  });

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { username, password, email, role, phone } = req.body;
    console.log("Register attempt:", { username, email, role, phone });
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const stmt = db.prepare("INSERT INTO users (username, password, email, role, phone) VALUES (?, ?, ?, ?, ?)");
      const info = stmt.run(username, hashedPassword, email, role, phone);
      
      const userId = info.lastInsertRowid as number;
      
      console.log("Register success for:", username);
      res.status(201).json({ id: userId, username, role });
    } catch (error: any) {
      console.error("Register error for", username, ":", error.message);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body; // username here might be email
    console.log("Login attempt for:", username);
    try {
      // Check both username and email
      const user: any = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(username, username);
      
      if (!user) {
        console.log("Login failed: User not found for identifier:", username);
        return res.status(401).json({ error: "User not found" });
      }

      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (passwordMatch) {
        console.log("Login success for:", username);
        (req.session as any).userId = user.id;
        (req.session as any).userRole = user.role;
        res.json({ id: user.id, username: user.username, role: user.role });
      } else {
        console.log("Login failed for:", username, "due to password mismatch");
        res.status(401).json({ error: "Invalid password" });
      }
    } catch (error: any) {
      console.error("Login error for", username, ":", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if ((req.session as any).userId) {
      const user: any = db.prepare("SELECT id, username, email, role, phone FROM users WHERE id = ?").get((req.session as any).userId);
      res.json(user);
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Product Routes
  app.get("/api/products", (req, res) => {
    const farmerId = req.query.farmerId;
    let products: any[];
    if (farmerId) {
      products = db.prepare("SELECT p.*, u.username as farmer_name FROM products p JOIN users u ON p.farmer_id = u.id WHERE p.farmer_id = ?").all(Number(farmerId));
    } else {
      products = db.prepare("SELECT p.*, u.username as farmer_name FROM products p JOIN users u ON p.farmer_id = u.id").all();
    }

    // Enrich with farmer stats
    const enriched = products.map(p => {
      const sales = db.prepare(`
        SELECT COUNT(DISTINCT o.id) as count 
        FROM orders o 
        JOIN order_items oi ON o.id = oi.order_id 
        JOIN products prod ON oi.product_id = prod.id 
        WHERE prod.farmer_id = ? AND o.status = 'delivered'
      `).get(p.farmer_id) as any;

      const rating = db.prepare(`
        SELECT AVG(rating) as avg, COUNT(*) as count FROM ratings WHERE to_id = ?
      `).get(p.farmer_id) as any;

      return {
        ...p,
        farmer_stats: {
          successfulSales: sales.count || 0,
          averageRating: rating.avg || 0,
          totalRatings: rating.count || 0
        }
      };
    });

    res.json(enriched);
  });

  app.post("/api/ratings", (req, res) => {
    const from_id = (req.session as any).userId;
    if (!from_id) return res.status(401).json({ error: "Unauthorized" });

    const { toId, orderId, rating, comment } = req.body;
    
    try {
      db.prepare("INSERT INTO ratings (from_id, to_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)")
        .run(from_id, toId, orderId, rating, comment || "");
      res.status(201).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:id/trust-stats", (req, res) => {
    const userId = req.params.id;
    const user = db.prepare("SELECT role FROM users WHERE id = ?").get(userId) as any;
    
    if (!user) return res.status(404).json({ error: "User not found" });

    let stats: any = {};
    
    if (user.role === 'farmer') {
      const sales = db.prepare(`
        SELECT COUNT(DISTINCT o.id) as count 
        FROM orders o 
        JOIN order_items oi ON o.id = oi.order_id 
        JOIN products p ON oi.product_id = p.id 
        WHERE p.farmer_id = ? AND o.status = 'delivered'
      `).get(userId) as any;
      
      const rating = db.prepare(`
        SELECT AVG(rating) as avg, COUNT(*) as count 
        FROM ratings 
        WHERE to_id = ?
      `).get(userId) as any;

      stats = {
        successfulSales: sales.count || 0,
        averageRating: rating.avg || 0,
        totalRatings: rating.count || 0
      };
    } else if (user.role === 'buyer') {
      const orders = db.prepare(`
        SELECT COUNT(*) as total, 
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as successful
        FROM orders 
        WHERE buyer_id = ?
      `).get(userId) as any;

      stats = {
        totalOrders: orders.total || 0,
        successfulOrders: orders.successful || 0,
        successRate: orders.total > 0 ? (orders.successful / orders.total) * 100 : 0
      };
    }

    res.json(stats);
  });

  app.get("/api/users/:id", (req, res) => {
    const userId = req.params.id;
    const user = db.prepare("SELECT id, username, role, phone, created_at FROM users WHERE id = ?").get(userId) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.post("/api/products", (req, res) => {
    console.log("Create product request from user:", (req.session as any).userId, "with role:", (req.session as any).userRole);
    if ((req.session as any).userRole !== 'farmer' && (req.session as any).userRole !== 'admin') {
      console.log("Unauthorized product creation attempt");
      return res.status(403).json({ error: "Unauthorized. Role is " + (req.session as any).userRole });
    }
    try {
      const { name, description, price, quantity, category, image_url } = req.body;
      const farmer_id = (req.session as any).userId;
      
      console.log("Product data received:", { name, price, quantity, category, hasImage: !!image_url });

      if (!name || price === undefined || quantity === undefined || !category) {
        return res.status(400).json({ error: "Missing required fields: name, price, quantity, and category are mandatory." });
      }

      if (isNaN(Number(price)) || isNaN(Number(quantity))) {
        return res.status(400).json({ error: "Price and quantity must be valid numbers" });
      }

      const stmt = db.prepare("INSERT INTO products (farmer_id, name, description, price, quantity, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
      const info = stmt.run(farmer_id, name, description || "", Number(price), Number(quantity), category, image_url || "");
      console.log("Product created successfully with ID:", info.lastInsertRowid);
      res.status(201).json({ id: info.lastInsertRowid, name });
    } catch (error: any) {
      console.error("Error creating product:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", (req, res) => {
    const userId = (req.session as any).userId;
    const role = (req.session as any).userRole;
    if (!userId || (role !== 'farmer' && role !== 'admin')) return res.status(403).json({ error: "Unauthorized" });

    try {
      if (role === 'admin') {
        db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
      } else {
        db.prepare("DELETE FROM products WHERE id = ? AND farmer_id = ?").run(req.params.id, userId);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Order Routes
  app.post("/api/orders", (req, res) => {
    if (!(req.session as any).userId) return res.status(401).json({ error: "Login required" });
    const { items, total_amount, shipping_address, payment_method } = req.body;
    const buyer_id = (req.session as any).userId;

    const transaction = db.transaction(() => {
      const orderStmt = db.prepare("INSERT INTO orders (buyer_id, total_amount, shipping_address, payment_method, status) VALUES (?, ?, ?, ?, ?)");
      const orderInfo = orderStmt.run(buyer_id, total_amount, shipping_address, payment_method, 'pending');
      const orderId = orderInfo.lastInsertRowid;

      const itemStmt = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
      const updateProductStmt = db.prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?");

      const uniqueFarmerIds = new Set<number>();

      for (const item of items) {
        itemStmt.run(orderId, item.product_id, item.quantity, item.price);
        updateProductStmt.run(item.quantity, item.product_id);

        const product = db.prepare("SELECT farmer_id FROM products WHERE id = ?").get(item.product_id) as any;
        if (product) uniqueFarmerIds.add(product.farmer_id);
      }

      // Notify Farmers via Mock SMS (Simulated Mobile Notification)
      uniqueFarmerIds.forEach(farmerId => {
        const farmer = db.prepare("SELECT username, phone FROM users WHERE id = ?").get(farmerId) as any;
        if (farmer) {
          sendSMS(farmer.phone || "01XXXXXXXXX", `AgroConnect: Hello ${farmer.username}, you have a new order (#${orderId}) waiting for acceptance!`);
          
          // Real-time SSE Notification
          notifyUser(farmerId, {
            type: 'NEW_ORDER',
            message: `You received a new order (#${orderId})!`,
            orderId: orderId
          });
        }
      });

      return orderId;
    });

    try {
      const orderId = transaction();
      res.json({ message: "Order placed", orderId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders/update-status", (req, res) => {
    const { orderId, status } = req.body;
    const farmerId = (req.session as any).userId;
    const role = (req.session as any).userRole;

    if (role !== 'farmer' && role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, orderId);

      // If accepted (processing), notify Buyer via Mock Email & SMS
      if (status === 'processing') {
        const orderInfo = db.prepare(`
          SELECT o.*, u.email, u.username, u.phone 
          FROM orders o 
          JOIN users u ON o.buyer_id = u.id 
          WHERE o.id = ?
        `).get(orderId) as any;

        if (orderInfo) {
          sendEmail(
            orderInfo.email,
            "Order Accepted - AgroConnect",
            `Hi ${orderInfo.username}, order #${orderId} is accepted! The farmer is preparing your fresh products.`
          );
          
          if (orderInfo.phone) {
            sendSMS(orderInfo.phone, `AgroConnect: Hi ${orderInfo.username}, your order #${orderId} has been accepted and is being processed!`);
          }
        }

        // Create transport request
        const transportStmt = db.prepare("INSERT INTO transport_requests (order_id, pickup_address, delivery_address) VALUES (?, ?, ?)");
        transportStmt.run(orderId, "Farmer Location", (orderInfo as any).shipping_address);
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders/my", (req, res) => {
    const userId = (req.session as any).userId;
    const role = (req.session as any).userRole;
    if (!userId) return res.status(401).json({ error: "Login required" });

    let orders;
    if (role === 'buyer') {
      orders = db.prepare(`
        SELECT DISTINCT o.*, u.username as buyer_name, u.phone as buyer_phone,
               (SELECT p.farmer_id FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = o.id LIMIT 1) as farmer_id,
               (SELECT fu.username FROM order_items oi JOIN products p ON oi.product_id = p.id JOIN users fu ON p.farmer_id = fu.id WHERE oi.order_id = o.id LIMIT 1) as farmer_name
        FROM orders o 
        JOIN users u ON o.buyer_id = u.id 
        WHERE o.buyer_id = ? 
        ORDER BY o.created_at DESC
      `).all(userId);
    } else if (role === 'farmer') {
      orders = db.prepare(`
        SELECT DISTINCT o.*, u.username as buyer_name, u.phone as buyer_phone 
        FROM orders o 
        JOIN order_items oi ON o.id = oi.order_id 
        JOIN products p ON oi.product_id = p.id 
        JOIN users u ON o.buyer_id = u.id
        WHERE p.farmer_id = ?
        ORDER BY o.created_at DESC
      `).all(userId);
    } else if (role === 'admin') {
      orders = db.prepare("SELECT o.*, u.username as buyer_name, u.phone as buyer_phone FROM orders o JOIN users u ON o.buyer_id = u.id ORDER BY o.created_at DESC").all();
    }
    res.json(orders);
  });

  // Transport Routes
  app.get("/api/transport/requests", (req, res) => {
    const transportId = req.query.myJobs === 'true' ? (req.session as any).userId : null;
    
    let requests;
    if (transportId) {
      requests = db.prepare(`
        SELECT tr.*, o.shipping_address, o.status as order_status
        FROM transport_requests tr 
        JOIN orders o ON tr.order_id = o.id 
        WHERE tr.transport_id = ?
      `).all(transportId);
    } else {
      requests = db.prepare(`
        SELECT tr.*, o.shipping_address 
        FROM transport_requests tr 
        JOIN orders o ON tr.order_id = o.id 
        WHERE tr.status = 'available'
      `).all();
    }
    res.json(requests);
  });

  app.get("/api/admin/stats", (req, res) => {
    if ((req.session as any).userRole !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    const orderCount = db.prepare("SELECT COUNT(*) as count FROM orders").get() as any;
    const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as any;
    const revenue = db.prepare("SELECT SUM(total_amount) as sum FROM orders").get() as any;
    const pendingJobs = db.prepare("SELECT COUNT(*) as count FROM transport_requests WHERE status = 'available'").get() as any;

    res.json({
      users: userCount.count,
      orders: orderCount.count,
      products: productCount.count,
      revenue: revenue.sum || 0,
      pendingJobs: pendingJobs.count
    });
  });

  app.get("/api/admin/users", (req, res) => {
    if ((req.session as any).userRole !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    const users = db.prepare("SELECT id, username, email, role, phone, created_at FROM users ORDER BY created_at DESC").all();
    res.json(users);
  });

  app.post("/api/transport/accept", (req, res) => {
    const transport_id = (req.session as any).userId;
    if ((req.session as any).userRole !== 'transport') return res.status(403).json({ error: "Unauthorized" });
    const { requestId } = req.body;
    db.prepare("UPDATE transport_requests SET transport_id = ?, status = 'accepted' WHERE id = ?").run(transport_id, requestId);
    res.json({ message: "Job accepted" });
  });

  app.post("/api/transport/update", (req, res) => {
    const { requestId, status } = req.body;
    db.prepare("UPDATE transport_requests SET status = ? WHERE id = ?").run(status, requestId);
    if (status === 'delivered') {
      const tr: any = db.prepare("SELECT order_id FROM transport_requests WHERE id = ?").get(requestId);
      db.prepare("UPDATE orders SET status = 'delivered' WHERE id = ?").run(tr.order_id);
    }
    res.json({ message: "Status updated" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
