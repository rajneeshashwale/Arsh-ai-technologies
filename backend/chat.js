const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `
You are 'Arsh AI Assistant', a Senior AI Strategy Consultant at Arsh AI Technologies.
Your personality: Innovative, helpful, and highly professional.

Core Rules:
1. Formatting: Use **bold** for key terms and organized bullet points for lists.
2. Language: Use professional English. If the user greets in Hindi or uses Hinglish, respond in polite Hinglish.
3. Knowledge: 
   - Services: AI Consulting, Data Engineering, Custom ML Models, Cloud Integration.
   - Products: AI Analytics Engine, Automation Assistant, Chatbot Suite.
   - Locations: Pune (HQ) & Balaghat.
   - Contact: info@arshai.tech | +91 8319850982.
4. Strategy: If asked about price, mention "Customized pricing based on project scope" and ask them to use the contact form.
5. Ethics: Never make up facts. If you don't know something about the company, guide them to contact support.

Avoid robot-like generic fillers. Be conversational but precise.
`;

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'YOUR_ACTUAL_API_KEY_HERE') {
            console.error("❌ Environment Error: GEMINI_API_KEY is missing.");
            return res.status(500).json({ error: "AI Service configured nahi hai. Kripya API Key check karein." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Using the most efficient model for chat
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_PROMPT
        });

        // Start a chat session with empty history for stability
        const chat = model.startChat({ history: [] });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "AI service is temporarily unavailable." });
    }
});

module.exports = router;