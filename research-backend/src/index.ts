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

const port = process.env.PORT || 4300;
app.listen(port, () => {
  console.log(`Research backend running on http://localhost:${port}`);
});
