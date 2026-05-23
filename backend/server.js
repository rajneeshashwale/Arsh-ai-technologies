const crypto = require("crypto");
const https = require("https");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);
const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const namePattern = /^[A-Za-z\s]+$/;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || FRONTEND_ORIGINS.length === 0 || FRONTEND_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Origin not allowed by CORS."));
    }
  })
);
app.use(express.json({ limit: "100kb" }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(error => console.error("MongoDB connection error:", error));

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  message: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, default: null },
    passwordSalt: { type: String, default: null },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String, default: null },
    authToken: { type: String, default: null },
    tokenExpiresAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);
const User = mongoose.model("User", userSchema);

const normalizeEmail = email => email.trim().toLowerCase();

const hashPassword = password => {
  const passwordSalt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.scryptSync(password, passwordSalt, 64).toString("hex");
  return { passwordSalt, passwordHash };
};

const verifyPassword = (password, passwordSalt, passwordHash) => {
  if (!passwordSalt || !passwordHash) {
    return false;
  }

  const derivedHash = crypto.scryptSync(password, passwordSalt, 64).toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(derivedHash, "hex"),
    Buffer.from(passwordHash, "hex")
  );
};

const fetchJson = url =>
  new Promise((resolve, reject) => {
    https
      .get(url, response => {
        let raw = "";

        response.on("data", chunk => {
          raw += chunk;
        });

        response.on("end", () => {
          try {
            const data = JSON.parse(raw || "{}");

            if (response.statusCode && response.statusCode >= 400) {
              return reject(new Error(data.error_description || data.error || "Request failed."));
            }

            resolve(data);
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });

const verifyGoogleCredential = async credential => {
  const tokenInfo = await fetchJson(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );

  if (!tokenInfo.sub || !tokenInfo.email) {
    throw new Error("Incomplete Google profile.");
  }

  if (!["accounts.google.com", "https://accounts.google.com"].includes(tokenInfo.iss)) {
    throw new Error("Invalid Google issuer.");
  }

  if (tokenInfo.aud !== GOOGLE_CLIENT_ID) {
    throw new Error("Google client ID mismatch.");
  }

  if (tokenInfo.email_verified !== "true") {
    throw new Error("Google email is not verified.");
  }

  return tokenInfo;
};

const createSession = () => ({
  authToken: crypto.randomBytes(32).toString("hex"),
  tokenExpiresAt: new Date(Date.now() + TOKEN_TTL_MS)
});

const sanitizeUser = user => ({
  id: user._id,
  name: user.name,
  email: user.email
});

const getTokenFromRequest = request => {
  const authHeader = request.headers.authorization || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
};

const authenticate = async (request, response, next) => {
  try {
    const authToken = getTokenFromRequest(request);

    if (!authToken) {
      return response.status(401).json({ error: "Authentication required." });
    }

    const user = await User.findOne({
      authToken,
      tokenExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return response.status(401).json({ error: "Session expired. Please login again." });
    }

    request.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    response.status(500).json({ error: "Server error. Try again later." });
  }
};

app.get("/", (request, response) => {
  response.send("Backend is running successfully!");
});

app.get("/api/auth/google/config", (request, response) => {
  response.json({
    enabled: Boolean(GOOGLE_CLIENT_ID),
    clientId: GOOGLE_CLIENT_ID || null,
    authorizedOrigins: FRONTEND_ORIGINS
  });
});

app.post("/api/auth/register", async (request, response) => {
  const name = request.body.name?.trim() || "";
  const email = request.body.email?.trim() || "";
  const password = request.body.password?.trim() || "";

  if (!name || !email || !password) {
    return response.status(400).json({ error: "All fields are required." });
  }

  if (!namePattern.test(name)) {
    return response.status(400).json({ error: "Name must contain only letters." });
  }

  if (!emailPattern.test(email)) {
    return response.status(400).json({ error: "Enter a valid email address." });
  }

  if (password.length < 6) {
    return response.status(400).json({ error: "Password must be at least 6 characters." });
  }

  try {
    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return response.status(409).json({ error: "Account already exists with this email." });
    }

    const { passwordSalt, passwordHash } = hashPassword(password);
    const session = createSession();

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordSalt,
      passwordHash,
      authProvider: "local",
      ...session
    });

    response.status(201).json({
      message: "Account created successfully.",
      token: user.authToken,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Register error:", error);
    response.status(500).json({ error: "Server error. Try again later." });
  }
});

app.post("/api/auth/login", async (request, response) => {
  const email = request.body.email?.trim() || "";
  const password = request.body.password?.trim() || "";

  if (!email || !password) {
    return response.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return response.status(401).json({ error: "Invalid email or password." });
    }

    const session = createSession();
    user.authToken = session.authToken;
    user.tokenExpiresAt = session.tokenExpiresAt;
    await user.save();

    response.json({
      message: "Login successful.",
      token: user.authToken,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Login error:", error);
    response.status(500).json({ error: "Server error. Try again later." });
  }
});

app.post("/api/auth/google", async (request, response) => {
  const credential = request.body.credential?.trim() || "";

  if (!GOOGLE_CLIENT_ID) {
    return response.status(503).json({ error: "Google login is not configured on the server." });
  }

  if (!credential) {
    return response.status(400).json({ error: "Google credential is required." });
  }

  try {
    const googleUser = await verifyGoogleCredential(credential);
    const normalizedEmail = normalizeEmail(googleUser.email);
    const session = createSession();
    let user = await User.findOne({
      $or: [{ googleId: googleUser.sub }, { email: normalizedEmail }]
    });

    if (!user) {
      user = await User.create({
        name: googleUser.name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        authProvider: "google",
        googleId: googleUser.sub,
        ...session
      });
    } else {
      user.name = user.name || googleUser.name || normalizedEmail.split("@")[0];
      user.googleId = user.googleId || googleUser.sub;
      user.authProvider = user.passwordHash ? "local" : "google";
      user.authToken = session.authToken;
      user.tokenExpiresAt = session.tokenExpiresAt;
      await user.save();
    }

    if (!user.authToken) {
      user.authToken = session.authToken;
      user.tokenExpiresAt = session.tokenExpiresAt;
      await user.save();
    }

    response.json({
      message: "Google login successful.",
      token: user.authToken,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("Google login error:", error);
    response.status(401).json({ error: "Google login failed. Please try again." });
  }
});

app.get("/api/auth/me", authenticate, (request, response) => {
  response.json({ user: sanitizeUser(request.user) });
});

app.post("/api/auth/logout", authenticate, async (request, response) => {
  try {
    request.user.authToken = null;
    request.user.tokenExpiresAt = null;
    await request.user.save();
    response.json({ message: "Logout successful." });
  } catch (error) {
    console.error("Logout error:", error);
    response.status(500).json({ error: "Server error. Try again later." });
  }
});

app.post("/api/contact", async (request, response) => {
  const name = request.body.name?.trim() || "";
  const email = request.body.email?.trim() || "";
  const message = request.body.message?.trim() || "";

  if (!name || !email || !message) {
    return response.status(400).json({ error: "All fields are required." });
  }

  if (!namePattern.test(name)) {
    return response.status(400).json({ error: "Name must contain only letters." });
  }

  if (!emailPattern.test(email)) {
    return response.status(400).json({ error: "Enter a valid email address." });
  }

  try {
    const newContact = new Contact({
      name,
      email: normalizeEmail(email),
      message
    });

    await newContact.save();
    response.json({ message: "Form submitted successfully." });
  } catch (error) {
    console.error("Contact save error:", error);
    response.status(500).json({ error: "Server error. Try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
