import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { saveMessage, loadChatMessages } from "./chatRepository.js";
import { getUserProfile, createUserProfile } from "./userRepository.js";
import { requireAuth } from "./requireAuth.js";

const app = express();
const port = process.env.PORT || 3001;

// Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

/* ======================
   USER INIT (FIRST LOGIN)
====================== */
app.post("/api/user/init", requireAuth, async (req, res) => {
  const userId = req.user.sub;
  const roleHint = req.body.roleHint; // "THERAPIST" | "CLIENT"

  let user = await getUserProfile(userId);

  if (!user) {
    user = await createUserProfile({
      userId,
      role: roleHint === "THERAPIST" ? "THERAPIST" : "CLIENT",
    });
  }

  res.json(user);
});

/* ======================
   AI CHAT
====================== */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
    });

    res.json({ reply: response.text });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

/* ======================
   LOAD CHAT HISTORY
====================== */
app.get("/api/chat/history", requireAuth,async (req, res) => {
  try {
    const { clientId } = req.query;
    const userId = req.user.sub;

    const messages = await loadChatMessages({
      userId,
      clientId,
      limit: 100,
    });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load chat history" });
  }
});

/* ======================
   SAVE SINGLE MESSAGE
====================== */
app.post("/api/chat/message", requireAuth,async (req, res) => {
  try {
    const { clientId, sender, text } = req.body;
    const userId = req.user.sub;

    await saveMessage({
      userId,
      clientId,
      sender,
      text,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save message" });
  }
});

app.listen(port, () => {
  console.log(`✅ Gemini API server running on port ${port}`);
});
