// ================= Imports =================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// ================= App Config =================
const app = express();
const PORT = process.env.PORT || 5000;

// ================= Middlewares =================
app.use(cors());
app.use(express.json());

// ================= MongoDB Connection =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ================= Test Route =================
app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully!");
});

// ================= Contact Schema =================
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", contactSchema);

// ================= API Route =================
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    console.log("📩 New contact saved:", newContact);
    res.json({ message: "Form submitted successfully!" });
  } catch (err) {
    console.error("❌ Error saving contact:", err);
    res.status(500).json({ error: "Server error. Try again later." });
  }
});

// ================= Start Server =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
