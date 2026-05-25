const express = require("express");
const { askArshAssistant } = require("./shared/arsh-assistant");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const reply = await askArshAssistant(message);
    res.json({ reply });
  } catch (error) {
    console.error("AI Error:", error);

    if (error.message === "GEMINI_API_KEY is missing.") {
      return res
        .status(500)
        .json({ error: "AI Service configured nahi hai. Kripya API Key check karein." });
    }

    res.status(500).json({ error: "AI service is temporarily unavailable." });
  }
});

module.exports = router;
