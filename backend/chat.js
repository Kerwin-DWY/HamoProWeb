import express from "express";
import { saveMessage, loadChatMessages } from "../repositories/chatRepository.js";

const router = express.Router();

/**
 * Load chat history
 */
router.get("/history", async (req, res) => {
    try {
        const { clientId } = req.query;
        const userId = req.user.sub; // from Cognito JWT middleware

        const messages = await loadChatMessages({
            userId,
            clientId,
            avatarId,
            limit: 100,
        });

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load chat history" });
    }
});

/**
 * Save a single message
 */
router.post("/message", async (req, res) => {
    try {
        const { clientId, avatarId, avatarName, clientName, sender, text } = req.body;
        const userId = req.user.sub;

        await saveMessage({
            userId,
            clientId,
            clientName,
            avatarId,
            avatarName,
            sender,
            text,
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save message" });
    }
});

export default router;
