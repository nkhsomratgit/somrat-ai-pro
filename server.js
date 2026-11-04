import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors({
  origin: "https://nkhsomratgit.github.io"
}));

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("SOMRAT AI PRO GEMINI SERVER RUNNING");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API key is not configured."
      });
    }

    const messages = Array.isArray(req.body.messages)
      ? req.body.messages
          .filter(m =>
            ["user", "assistant"].includes(m.role) &&
            typeof m.content === "string"
          )
          .slice(-12)
      : [];

    if (!messages.length) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const contents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction:
          "You are SOMRAT AI PRO. Help users clearly and politely. Reply in the user's language."
      }
    });

    res.json({
      reply: result.text || "No response received."
    });

  } catch (error) {
    console.error("Gemini error:", error);

    res.status(500).json({
      error: "Gemini AI could not answer. Please try again."
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SOMRAT AI PRO running on port ${PORT}`);
});
