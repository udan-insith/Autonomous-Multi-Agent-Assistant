import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Groq exposes an OpenAI-compatible API, so we reuse the same SDK —
// just point baseURL at Groq and use a Groq-hosted model.
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: Date.now() });
});

app.get("/api/test-completion", async (_req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: 'Reply with exactly: "Groq connection working."',
        },
      ],
      max_tokens: 20,
    });
    res.json({ reply: completion.choices[0]?.message?.content ?? "(empty)" });
  } catch (err) {
    console.error("Groq error:", err);
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

const port = process.env.PORT || 4300;
app.listen(port, () => {
  console.log(`Research backend running on http://localhost:${port}`);
});
