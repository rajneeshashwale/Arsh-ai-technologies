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

/**
 * Rule-based intelligent fallback when Gemini API is unavailable.
 * Covers all major topics a visitor might ask about.
 */
function getRuleBasedFallback(message) {
  const msg = message.toLowerCase().trim();

  // ── Greetings ─────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|namaste|hii|helo|good morning|good evening|good afternoon|namaskar|hy|helo|hola|howdy)\b/.test(msg)) {
    return `**Namaste! 🙏**\n\nMain **Arsh AI Assistant** hoon - Arsh AI Technologies ka official assistant!\n\nMain aapki help kar sakta hoon:\n• 🛠️ **Services** - Website, App, AI Development\n• 📦 **Products** - AI Analytics, Chatbot, Automation\n• 💰 **Pricing** - Project quotes\n• 📞 **Contact** - Team se baat karein\n• 🏢 **About Us** - Company info\n\nBas poochh lijiye! 😊`;
  }

  // ── Services (general) ────────────────────────────────────────────────────
  if (
    msg.includes("service") ||
    msg.includes("kya karte") ||
    msg.includes("what do you offer") ||
    msg.includes("what you do") ||
    msg.includes("kya offer") ||
    msg.includes("offerings")
  ) {
    return `**Arsh AI Technologies ki Services** 🚀\n\n• 🎯 **AI Strategy & Consulting** — Business AI roadmap aur transformation guidance\n• 🔧 **Data Engineering** — Scalable data pipelines aur real-time analytics\n• 🤖 **Custom AI Model Development** — Aapke business ke liye tailored ML models\n• ☁️ **Cloud AI Integration** — Cloud ecosystem mein seamless AI integration\n• 🌐 **Website Development** — Modern, fast, responsive websites\n• 📱 **App Development** — iOS & Android mobile applications\n\nKisi bhi service ke baare mein detail chahiye? **info@arshai.tech** pe likhein ya **+91 8319850982** pe call karein! 📞`;
  }

  // ── Products ──────────────────────────────────────────────────────────────
  if (
    msg.includes("product") ||
    msg.includes("kya banate") ||
    msg.includes("what products") ||
    msg.includes("kya hai tumhara")
  ) {
    return `**Arsh AI Technologies ke Products** 📦\n\n• 🧠 **AI Analytics Engine** — Neural network-powered predictive analytics platform\n• ⚙️ **Automation Assistant** — Intelligent business process automation\n• 💬 **AI Chatbot Suite** — Conversational AI for 24/7 customer engagement\n• ☁️ **Cloud AI Platform** — Scalable AI model deployment with 99.9% uptime\n\nKisi product ka **demo** ya **pricing** chahiye? Contact karein:\n📧 **info@arshai.tech** | 📞 **+91 8319850982**`;
  }

  // ── Website Development ───────────────────────────────────────────────────
  if (
    msg.includes("website") ||
    msg.includes("web dev") ||
    msg.includes("web site") ||
    msg.includes("web design") ||
    msg.includes("landing page") ||
    msg.includes("ecommerce") ||
    msg.includes("e-commerce") ||
    msg.includes("portfolio site")
  ) {
    return `**Website Development Service** 🌐\n\nHaan! Hum professional websites banate hain!\n\n**Kya milega:**\n• ✅ Responsive Design (Mobile + Desktop + Tablet)\n• ✅ Modern UI/UX Design\n• ✅ SEO Optimized\n• ✅ Fast Loading Speed\n• ✅ AI Integration (optional)\n• ✅ Custom Backend & Database\n• ✅ E-commerce Support\n\n**Technologies:** HTML, CSS, JS, React, Node.js, MongoDB\n\n**Pricing:** Project scope ke according customized hoti hai.\n\n📧 **info@arshai.tech** | 📞 **+91 8319850982**\nAaj hi project discuss karein! 🚀`;
  }

  // ── App Development ───────────────────────────────────────────────────────
  if (
    msg.includes("app dev") ||
    msg.includes("mobile app") ||
    msg.includes("android app") ||
    msg.includes("ios app") ||
    msg.includes("flutter") ||
    msg.includes("react native") ||
    msg.includes("app banana") ||
    msg.includes("apna app") ||
    (msg.includes("app") && (msg.includes("bana") || msg.includes("develop") || msg.includes("create") || msg.includes("chahiye")))
  ) {
    return `**App Development Service** 📱\n\nHaan! Hum iOS aur Android apps develop karte hain!\n\n**Kya milega:**\n• ✅ Native Android & iOS Apps\n• ✅ Cross-platform (Flutter / React Native)\n• ✅ AI-powered Features\n• ✅ Clean Modern UI/UX\n• ✅ Backend & API Integration\n• ✅ Play Store & App Store Publishing\n• ✅ Push Notifications & Analytics\n\n**Technologies:** Flutter, React Native, Firebase, Node.js\n\n**Pricing:** Customized based on project scope & features.\n\n📧 **info@arshai.tech** | 📞 **+91 8319850982**\nApni app idea share karein! 💡`;
  }

  // ── IoT Solutions ─────────────────────────────────────────────────────────
  if (
    msg.includes("iot") ||
    msg.includes("internet of things") ||
    msg.includes("smart device") ||
    msg.includes("connected device") ||
    msg.includes("hardware integration") ||
    msg.includes("sensor")
  ) {
    return `**IoT Solutions Service** 🌐🔌\n\nHaan! Hum smart devices aur IoT ecosystems develop karte hain!\n\n**Kya milega:**\n• ✅ Smart Connected Devices\n• ✅ Real-time Monitoring & Data Analytics\n• ✅ Secure Cloud Infrastructure Integration\n• ✅ Custom Sensor Networks\n• ✅ Automation & Remote Control\n\n**Technologies:** Arduino, Raspberry Pi, MQTT, AWS IoT, Node.js\n\n**Pricing:** Customized based on hardware and software requirements.\n\n📧 **info@arshai.tech** | 📞 **+91 8319850982**\nApne IoT project ke bare mein baat karein! 💡`;
  }

  // ── AI / Machine Learning ────────────────────────────────────────────────
  if (
    msg.includes("artificial intelligence") ||
    msg.includes("machine learning") ||
    msg.includes("deep learning") ||
    msg.includes("neural network") ||
    msg.includes("nlp") ||
    msg.includes("chatbot banao") ||
    msg.includes("ai model") ||
    msg.includes("ml model") ||
    (msg.includes("ai") && (msg.includes("develop") || msg.includes("build") || msg.includes("create") || msg.includes("train")))
  ) {
    return `**AI & Machine Learning Solutions** 🤖\n\nArsh AI Technologies mein hum end-to-end AI solutions provide karte hain:\n\n• 🧠 **Custom AI Models** — Aapke business ke liye specifically trained\n• 💬 **AI Chatbots** — 24/7 intelligent customer support\n• 📊 **Predictive Analytics** — Data-driven business decisions\n• ⚙️ **Process Automation** — Repetitive tasks automate karein\n• 🗣️ **NLP Solutions** — Text, speech aur language processing\n• 👁️ **Computer Vision** — Image & video analysis\n\n**Technologies:** Python, TensorFlow, PyTorch, Gemini AI, LangChain\n\n📧 **info@arshai.tech** | 📞 **+91 8319850982**`;
  }

  // ── Pricing / Cost ────────────────────────────────────────────────────────
  if (
    msg.includes("price") ||
    msg.includes("cost") ||
    msg.includes("kitna") ||
    msg.includes("rate") ||
    msg.includes("charge") ||
    msg.includes("fees") ||
    msg.includes("budget") ||
    msg.includes("pricing") ||
    msg.includes("kitne paise") ||
    msg.includes("paisa") ||
    msg.includes("rupee") ||
    msg.includes("rupees")
  ) {
    return `**Pricing Policy** 💰\n\nHamari pricing **customized** hoti hai — project scope, complexity, aur timeline ke according.\n\nHum fixed packages mein kaam nahi karte kyunki har client ki requirements unique hoti hain.\n\n**Free Consultation uplabdh hai!**\n\n📧 **Email:** info@arshai.tech\n📞 **Phone:** +91 8319850982\n📍 **Location:** Balaghat, Madhya Pradesh\n\nAaj hi contact karein aur apna project discuss karein! 🚀`;
  }

  // ── Contact ───────────────────────────────────────────────────────────────
  if (
    msg.includes("contact") ||
    msg.includes("reach") ||
    msg.includes("phone") ||
    msg.includes("email") ||
    msg.includes("address") ||
    msg.includes("location") ||
    msg.includes("kahan") ||
    msg.includes("number") ||
    msg.includes("baat karna") ||
    msg.includes("milna") ||
    msg.includes("office")
  ) {
    return `**Contact Arsh AI Technologies** 📞\n\n📧 **Email:** info@arshai.tech\n📞 **Phone:** +91 8319850982\n📍 **Location:** Balaghat, Madhya Pradesh, India\n\n⏰ **Business Hours:** Monday – Saturday, 9 AM – 6 PM IST\n\nYa seedha hamare website ke **Contact Form** se message bhejein!\nHamari team 24 ghante ke andar reply karti hai. 😊`;
  }

  // ── About Company ─────────────────────────────────────────────────────────
  if (
    msg.includes("about") ||
    msg.includes("kaun ho") ||
    msg.includes("who are you") ||
    msg.includes("company") ||
    msg.includes("arsh ai") ||
    msg.includes("team") ||
    msg.includes("experience") ||
    msg.includes("kitne saal")
  ) {
    return `**Arsh AI Technologies ke baare mein** 🏢\n\n**50+** successful projects, **25+** happy clients, aur **10+** AI solutions deliver kar chuke hain — with **99.9% uptime!**\n\n**Humari Specialty:**\n• 🤖 AI Products & Custom Models\n• 🎯 Business Process Automation\n• 🌐 Website & App Development\n• ☁️ Cloud AI Integration\n• 📊 Data Engineering & Analytics\n\n**Mission:** Businesses ko intelligent technology se empower karna.\n\n📍 **HQ:** Balaghat, Madhya Pradesh, India\n📧 **info@arshai.tech** | 📞 **+91 8319850982**`;
  }

  // ── Data Engineering ──────────────────────────────────────────────────────
  if (
    msg.includes("data engineer") ||
    msg.includes("data pipeline") ||
    msg.includes("analytics") ||
    msg.includes("data science") ||
    msg.includes("big data") ||
    msg.includes("database")
  ) {
    return `**Data Engineering Service** 📊\n\nHum aapke data ko powerful insights mein convert karte hain!\n\n**Kya milega:**\n• ✅ Scalable Data Pipelines\n• ✅ Real-time Analytics Dashboards\n• ✅ Data Warehousing\n• ✅ ETL/ELT Automation\n• ✅ Business Intelligence Reports\n• ✅ Cloud Data Integration (AWS/GCP/Azure)\n\n📧 **info@arshai.tech** | 📞 **+91 8319850982**`;
  }

  // ── Consulting ────────────────────────────────────────────────────────────
  if (
    msg.includes("consult") ||
    msg.includes("strategy") ||
    msg.includes("roadmap") ||
    msg.includes("digital transform") ||
    msg.includes("guidance") ||
    msg.includes("advice")
  ) {
    return `**AI Strategy & Consulting** 🎯\n\nHum aapke business ke liye AI adoption strategy banate hain!\n\n**Kya milega:**\n• ✅ AI Readiness Assessment\n• ✅ Digital Transformation Roadmap\n• ✅ Technology Stack Recommendation\n• ✅ ROI Analysis for AI Projects\n• ✅ Implementation Planning\n• ✅ Team Training & Upskilling\n\n**Free initial consultation available!**\n📧 **info@arshai.tech** | 📞 **+91 8319850982**`;
  }

  // ── Thank you ─────────────────────────────────────────────────────────────
  if (
    msg.includes("thank") ||
    msg.includes("shukriya") ||
    msg.includes("dhanyavad") ||
    msg.includes("thanks") ||
    msg.includes("great") ||
    msg.includes("awesome") ||
    msg.includes("bahut acha") ||
    msg.includes("perfect")
  ) {
    return `Bahut shukriya! 🙏 Aapka swagat hai!\n\nKoi aur sawaal ho to bejhijhak poochhein. Arsh AI Technologies ki team hamesha aapki seva mein taiyaar hai! 😊\n\n📧 **info@arshai.tech** | 📞 **+91 8319850982**`;
  }

  // ── Default / Catch-all ───────────────────────────────────────────────────
  return `Main **Arsh AI Assistant** hoon! Main aapki help karna chahta hoon. 😊\n\nAap pooch sakte hain:\n• 🛠️ **Services** — Website, App, AI Development\n• 📦 **Products** — AI Analytics, Chatbot, Automation\n• 💰 **Pricing** — Project quote lein\n• 📞 **Contact** — Team se directly baat karein\n• 🏢 **About Us** — Company ke baare mein jaanein\n\nYa seedha email karein: **info@arshai.tech** 📧`;
}

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "YOUR_ACTUAL_API_KEY_HERE" || apiKey.trim() === "") {
    return null; // Return null instead of throwing — we'll use fallback
  }

  return apiKey;
}

async function askArshAssistant(message) {
  const trimmedMessage = String(message || "").trim();

  if (!trimmedMessage) {
    throw new Error("Message is required.");
  }

  const apiKey = getGeminiApiKey();

  // If no valid API key configured, use rule-based fallback immediately
  if (!apiKey) {
    return getRuleBasedFallback(trimmedMessage);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT
    });

    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(trimmedMessage);
    const response = await result.response;

    return response.text().trim();
  } catch (error) {
    // If Gemini fails for any reason (quota, network, invalid key), use fallback
    console.warn("Gemini API unavailable, using rule-based fallback:", error.message);
    return getRuleBasedFallback(trimmedMessage);
  }
}

module.exports = {
  SYSTEM_PROMPT,
  askArshAssistant
};
