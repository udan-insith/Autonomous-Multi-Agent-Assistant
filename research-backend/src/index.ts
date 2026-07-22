import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

app.get('/api/test-completion', async (_req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Reply with exactly: "Gemini connection working."',
    });
    res.json({ reply: response.text ?? '(empty)' });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

const port = process.env.PORT || 4300;
app.listen(port, () => {
  console.log(`Research backend running on http://localhost:${port}`);
});
