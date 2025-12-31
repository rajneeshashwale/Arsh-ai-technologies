// ================================
// ✅ Import Modules
// ================================
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

// ================================
// ✅ App Config
// ================================
const app = express();
const PORT = process.env.PORT || 5000;

// ================================
// ✅ Middlewares
// ================================
app.use(cors());
app.use(bodyParser.json());

// ================================
// ✅ MongoDB Connection
// ================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Connection Failed:", err));

// ================================
// ✅ Test Route
// ================================
app.get("/", (req, res) => {
  res.send("Backend and MongoDB Connected Successfully!");
});

// ================================
// ✅ Contact Schema & Model
// ================================
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", contactSchema);

// ================================
// ✅ API Routes
// ================================
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
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// Example route (optional)
app.post("/api/data", (req, res) => {
  const userData = req.body;
  console.log("📦 Data received from frontend:", userData);
  res.json({ message: "Data received successfully!", data: userData });
});

// ================================
// ✅ Start Server
// ================================
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

