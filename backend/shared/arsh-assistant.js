const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildCompanyKnowledgeText } = require("./company-data");

const SYSTEM_PROMPT = `
You are "Arsh AI Assistant", a Senior AI Strategy Consultant at Arsh AI Technologies.
Your personality: innovative, helpful, clear, and highly professional.

Core rules:
1. Formatting: use bold for important terms and clear bullet points where useful.
2. Language: default to professional English. If the user writes in Hindi or Hinglish, reply in polite Hinglish.
3. Company knowledge:
${buildCompanyKnowledgeText()}
4. Pricing: if asked about price, say "Customized pricing based on project scope" and direct the user to contact the team.
5. Ethics: never invent company facts. If something is unknown, guide the user to contact support.

Avoid robotic filler. Be conversational but precise.
`.trim();

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "YOUR_ACTUAL_API_KEY_HERE") {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  return apiKey;
}

async function askArshAssistant(message) {
  const trimmedMessage = String(message || "").trim();

  if (!trimmedMessage) {
    throw new Error("Message is required.");
  }

  const genAI = new GoogleGenerativeAI(getGeminiApiKey());
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT
  });

  const chat = model.startChat({ history: [] });
  const result = await chat.sendMessage(trimmedMessage);
  const response = await result.response;

  return response.text().trim();
}

module.exports = {
  SYSTEM_PROMPT,
  askArshAssistant
};
