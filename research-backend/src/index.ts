import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: Date.now() });
});

// One-shot test route: proves the API key + SDK wiring works
// before we build the full agent pipeline on top of it.
app.get("/api/test-completion", async (_req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: 'Reply with exactly: "OpenAI connection working."',
        },
      ],
      max_tokens: 20,
    });
    res.json({ reply: completion.choices[0]?.message?.content ?? "(empty)" });
  } catch (err) {
    console.error("OpenAI error:", err);
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

const port = process.env.PORT || 4300;
app.listen(port, () => {
  console.log(`Research backend running on http://localhost:${port}`);
});
