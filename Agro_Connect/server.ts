import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Initialize Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "dummy-key", // Avoid crashing if key is missing during initialization
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const checkApiKey = (res: any) => {
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "dummy-key") {
      res.status(403).json({ 
        error: "Gemini API Key is missing. Please set GEMINI_API_KEY in your .env file locally, or check the Secrets panel in AI Studio.",
        isMissingKey: true 
      });
      return false;
    }
    return true;
  };

  // API Routes
  app.post("/api/ai/detect-disease", async (req, res) => {
    if (!checkApiKey(res)) return;
    try {
      const { image, prompt } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image is required" });
      }

      // Detect MIME type and convert base64 image data
      const mimeTypeMatch = image.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      const schema = {
        type: Type.OBJECT,
        properties: {
          diseaseName: {
            type: Type.STRING,
            description: "The name of the disease or 'Healthy' if no disease is detected.",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence score between 0 and 1.",
          },
          causes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of potential causes.",
          },
          treatment: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Step-by-step treatment plan.",
          },
          recommendedProducts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Names of agricultural products to treat or prevent the issue.",
          },
          preventionTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Tips to prevent this issue in the future.",
          },
        },
        required: ["diseaseName", "confidence", "causes", "treatment", "recommendedProducts", "preventionTips"],
      };

      const finalPrompt = (prompt || "Analyze this plant leaf for diseases. Be specific and technical yet helpful.") + " Produce the output in JSON format.";

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: {
          parts: [
            { text: finalPrompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        }
      });

      const responseText = response.text || "{}";
      try {
        const parsed = JSON.parse(responseText);
        res.json(parsed);
      } catch (parseError) {
        console.error("JSON Parse Error:", responseText);
        res.status(500).json({ error: "Failed to parse AI response. Please try again." });
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      let message = "Failed to analyze image. Please ensure the image is clear and try again.";
      
      if (error?.message?.includes("API_KEY_INVALID")) {
        message = "Invalid API Key. Please check your GEMINI_API_KEY.";
      } else if (error?.message?.includes("block")) {
        message = "AI could not process this image due to safety filters. Please try a different photo.";
      } else if (error?.status === 429) {
        message = "Too many requests. Please wait a moment and try again.";
      } else if (error?.status === 503 || error?.message?.includes("503") || error?.message?.includes("UNAVAILABLE")) {
        message = "AI service is currently experiencing high demand. Please try again in 1-2 minutes.";
      } else if (error?.message) {
        try {
          // Attempt to parse if message is JSON string
          const errObj = JSON.parse(error.message);
          message = errObj?.error?.message || error.message;
        } catch {
          message = error.message;
        }
      }
      
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    if (!checkApiKey(res)) return;
    try {
      const { message, history } = req.body;
      
      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const chat = ai.chats.create({
        model: "gemini-flash-latest",
        config: {
          systemInstruction: "You are an AI Farming Assistant for AgroConnect. You help Bangladeshi farmers with crop management, pest control, weather advisory, and market trends. Always be helpful, polite, and technical yet accessible. If asked, provide specific advice for common Bangladeshi crops like Rice, Jute, Mango, Tea, etc. Reply in the same language as the user (Bengali or English).",
        },
        history: formattedHistory,
      });

      const result = await chat.sendMessage({ message });
      res.json({ text: result.text });
    } catch (error) {
       console.error("AI Chat Error:", error);
       res.status(500).json({ error: "আমি এই মুহূর্তে উত্তর দিতে পারছি না। অনুগ্রহ করে আবার চেষ্টা করুন।" });
    }
  });

  // Mock User Database (Replace with real DB in production)
  const users: any[] = [];

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      const userExists = users.find(u => u.email === email);
      if (userExists) {
        return res.status(400).json({ error: "User already exists" });
      }

      const newUser = { id: Date.now().toString(), name, email, password, role };
      users.push(newUser);
      
      // Don't send password back
      const { password: _, ...userWithoutPassword } = newUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
