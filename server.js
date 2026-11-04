
import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "https://nkhsomratgit.github.io"
}));

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("SOMRAT AI PRO SERVER IS RUNNING");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "AI API key is not configured."
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

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-6-astra",
          instructions:
            "You are SOMRAT AI PRO, a helpful AI assistant. Reply clearly in the user's language.",
          input: messages
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res.status(502).json({
        error: "AI service could not answer. Please try again."
      });
    }

    res.json({
      reply: data.output_text || "No response received."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Server error. Please try again."
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SOMRAT AI PRO running on port ${PORT}`);
});
             
