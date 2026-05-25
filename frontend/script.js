const REMOTE_API_URL = "https://arsh-ai-technologies.onrender.com";
const API_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:5000"
  : REMOTE_API_URL;

const AUTH_STORAGE_KEY = "arsh_ai_auth_token";

const REGEX = { email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, name: /^[A-Za-z\s]+$/ };

const toggle = document.getElementById("menu-toggle");
const navMenu = document.querySelector("nav ul");
const authModal = document.getElementById("auth-modal");
const authOpenButton = document.getElementById("auth-open");
const authCloseButton = document.getElementById("auth-close");
const authUser = document.getElementById("auth-user");
const authUserName = document.getElementById("auth-user-name");
const logoutButton = document.getElementById("logout-btn");
const authStatus = document.getElementById("auth-status");
const authTabs = document.querySelectorAll("[data-auth-tab]");
const authPanels = document.querySelectorAll("[data-auth-panel]");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const googleSigninSlot = document.getElementById("google-signin-slot");
const googleAuthHint = document.getElementById("google-auth-hint");
const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("form-status");

const setStatusMessage = (element, message, type = "") => {
  element.textContent = message;
  element.className = element.id === "auth-status" ? "auth-status" : "";

  if (element === authStatus && type) {
    element.classList.add(type);
  }

  if (element === contactStatus) {
    const colors = { success: "#00ff99", warning: "orange", error: "red" };
    element.style.color = colors[type] || "";
  }
};

const getToken = () => localStorage.getItem(AUTH_STORAGE_KEY);

const saveToken = token => {
  localStorage.setItem(AUTH_STORAGE_KEY, token);
};

const clearToken = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const setGoogleAuthHint = message => {
  if (!googleAuthHint) {
    return;
  }

  googleAuthHint.hidden = !message;
  googleAuthHint.textContent = message;
};

const setAuthMode = mode => {
  authTabs.forEach(tab => {
    tab.classList.toggle("active", tab.dataset.authTab === mode);
  });

  authPanels.forEach(panel => {
    panel.classList.toggle("active", panel.dataset.authPanel === mode);
  });

  setStatusMessage(authStatus, "");
};

const openAuthModal = (mode = "login") => {
  setAuthMode(mode);
  authModal.classList.add("open");
  authModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

const closeAuthModal = () => {
  authModal.classList.remove("open");
  authModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  setStatusMessage(authStatus, "");
};

const renderAuthState = user => {
  if (!user) {
    authOpenButton.hidden = false;
    authUser.hidden = true;
    authUserName.textContent = "";
    return;
  }

  authOpenButton.hidden = true;
  authUser.hidden = false;
  authUserName.textContent = `Hi, ${user.name}`;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
};

const hydrateAuthState = async () => {
  const token = getToken();

  if (!token) {
    renderAuthState(null);
    return;
  }

  try {
    const data = await request("/api/auth/me", { method: "GET" });
    renderAuthState(data.user);
  } catch (error) {
    clearToken();
    renderAuthState(null);
  }
};

const handleGoogleLogin = async credentialResponse => {
  if (!credentialResponse?.credential) {
    setStatusMessage(authStatus, "Google login failed. Please try again.", "error");
    return;
  }

  setStatusMessage(authStatus, "Signing in with Google...", "success");

  try {
    const data = await request("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential: credentialResponse.credential })
    });

    saveToken(data.token);
    renderAuthState(data.user);
    closeAuthModal();
  } catch (error) {
    setStatusMessage(authStatus, error.message, "error");
  }
};

const initializeGoogleLogin = async () => {
  if (!googleSigninSlot) {
    return;
  }

  let googleClientId = "";
  let authorizedOrigins = [];
  const currentOrigin = window.location.origin || `${window.location.protocol}//${window.location.host}`;

  try {
    const config = await request("/api/auth/google/config", { method: "GET" });
    googleClientId = config.enabled ? config.clientId || "" : "";
    authorizedOrigins = Array.isArray(config.authorizedOrigins) ? config.authorizedOrigins : [];
  } catch (error) {
    googleSigninSlot.textContent = "Google login unavailable right now.";
    setGoogleAuthHint("");
    return;
  }

  if (!googleClientId) {
    googleSigninSlot.textContent = "Google login setup pending.";
    setGoogleAuthHint("Add GOOGLE_CLIENT_ID in backend/.env before using Google login.");
    return;
  }

  if (!authorizedOrigins.includes(currentOrigin)) {
    setGoogleAuthHint(
      `Current origin: ${currentOrigin}. If Google shows "origin_mismatch", add this exact origin in Google Cloud Console and in FRONTEND_ORIGINS.`
    );
  } else {
    setGoogleAuthHint("");
  }

  if (!window.google?.accounts?.id) {
    window.setTimeout(() => {
      initializeGoogleLogin().catch(console.error);
    }, 250);
    return;
  }

  window.google.accounts.id.initialize({
    client_id: googleClientId,
    callback: handleGoogleLogin
  });

  window.google.accounts.id.renderButton(googleSigninSlot, {
    theme: "outline",
    size: "large",
    shape: "pill",
    width: googleSigninSlot.offsetWidth || 320
  });
};

if (toggle && navMenu) {
  toggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px"
    }
  );

  document
    .querySelectorAll(".product-card, .service-card")
    .forEach(card => revealObserver.observe(card));
} else {
  document
    .querySelectorAll(".product-card, .service-card")
    .forEach(card => card.classList.add("show"));
}

authOpenButton.addEventListener("click", () => openAuthModal("login"));
authCloseButton.addEventListener("click", closeAuthModal);
logoutButton.addEventListener("click", async () => {
  try {
    await request("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.error(error);
  } finally {
    clearToken();
    renderAuthState(null);
  }
});

authModal.addEventListener("click", event => {
  if (event.target.hasAttribute("data-close-auth")) {
    closeAuthModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && authModal.classList.contains("open")) {
    closeAuthModal();
  }
});

authTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    setAuthMode(tab.dataset.authTab);
  });
});

registerForm.addEventListener("submit", async event => {
  event.preventDefault();

  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value.trim();

  if (!name || !email || !password) {
    setStatusMessage(authStatus, "All fields are required.", "error");
    return;
  }

  if (!REGEX.name.test(name)) {
    setStatusMessage(authStatus, "Name must contain only letters.", "error");
    return;
  }

  if (!REGEX.email.test(email)) {
    setStatusMessage(authStatus, "Enter a valid email address.", "error");
    return;
  }

  if (password.length < 6) {
    setStatusMessage(authStatus, "Password must be at least 6 characters.", "error");
    return;
  }

  setStatusMessage(authStatus, "Creating your account...", "success");

  try {
    const data = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });

    saveToken(data.token);
    renderAuthState(data.user);
    registerForm.reset();
    closeAuthModal();
  } catch (error) {
    setStatusMessage(authStatus, error.message, "error");
  }
});

loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) {
    setStatusMessage(authStatus, "Email and password are required.", "error");
    return;
  }

  setStatusMessage(authStatus, "Logging you in...", "success");

  try {
    const data = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    saveToken(data.token);
    renderAuthState(data.user);
    loginForm.reset();
    closeAuthModal();
  } catch (error) {
    setStatusMessage(authStatus, error.message, "error");
  }
});

contactForm.addEventListener("submit", async event => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email || !message) {
    setStatusMessage(contactStatus, "Please fill in all fields.", "warning");
    return;
  }

  if (!REGEX.name.test(name)) {
    setStatusMessage(contactStatus, "Name must contain only letters.", "error");
    return;
  }

  if (!REGEX.email.test(email)) {
    setStatusMessage(contactStatus, "Invalid email address.", "error");
    return;
  }

  setStatusMessage(contactStatus, "Sending your message...", "success");

  try {
    await request("/api/contact", {
      method: "POST",
      body: JSON.stringify({ name, email, message })
    });

    setStatusMessage(contactStatus, "Message sent successfully!", "success");
    contactForm.reset();
    window.setTimeout(() => setStatusMessage(contactStatus, ""), 2000);
  } catch (error) {
    console.error(error);
    setStatusMessage(contactStatus, error.message || "Server error. Please try again later.", "error");
  }
});

/**
 * AI Chatbot Logic
 */
const chatbotContainer = document.getElementById("ai-chatbot");
const chatToggleBtn = document.getElementById("chat-toggle-btn");
const chatMinimize = document.getElementById("chat-minimize");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatBody = document.getElementById("chat-body");

const appendMessage = (text, sender) => {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender}`;

  // Premium Styling with Clean Code
  const styles = {
    borderRadius: sender === "user" ? "20px 20px 5px 20px" : "20px 20px 20px 5px",
    padding: "12px 18px",
    marginBottom: "15px",
    maxWidth: "85%",
    width: "fit-content",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.06)",
    lineHeight: "1.5",
    fontSize: "0.95rem",
    background: sender === "user" ? "linear-gradient(135deg, #007AFF, #005BB5)" : "#f0f7ff",
    color: sender === "user" ? "#ffffff" : "#333333",
    border: sender === "bot" ? "1px solid #ddecff" : "none",
    alignSelf: sender === "user" ? "flex-end" : "flex-start"
  };
  Object.assign(msgDiv.style, styles);

  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/^\s*[\*•]\s+(.*)/gm, '• $1')            // Bullet points
    .replace(/\n/g, '<br>');                          // Line breaks

  msgDiv.innerHTML = formattedText;
  chatBody.appendChild(msgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
};

chatToggleBtn?.addEventListener("click", () => {
  chatbotContainer.classList.toggle("active");
});

chatMinimize?.addEventListener("click", () => {
  chatbotContainer.classList.remove("active");
});

chatForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  // User message show karo
  appendMessage(message, "user");
  chatInput.value = "";

  // Bot typing state (optional professional touch)
  const typingId = "bot-typing";
  const typingDiv = document.createElement("div");
  typingDiv.id = typingId;
  typingDiv.className = "message bot";
  typingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  chatBody.appendChild(typingDiv);
  chatBody.scrollTop = chatBody.scrollHeight;

  try {
    const data = await request("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message })
    });
    document.getElementById(typingId)?.remove();
    if (data.reply) appendMessage(data.reply, "bot");
  } catch (error) {
    document.getElementById(typingId)?.remove();

    let friendlyError = "Maaf kijiyega, server se sampark nahi ho paa raha hai.";
    if (error.message.includes("Failed to fetch")) {
      friendlyError = "Server offline hai ya internet slow hai. Kripya thodi der baad koshish karein.";
    } else if (error.message !== "Request failed.") {
      friendlyError = error.message;
    }

    appendMessage(friendlyError, "bot");
    console.error("Critical Chatbot Error:", error);
  }
});

/**
 * Premium UI Redesign: Chat Input Section
 * Applying clean, modern "Pill" design logic via JS for instant implementation.
 */
const applyPremiumInputStyles = () => {
  const wrapper = document.querySelector('.chat-input-wrapper');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const btn = document.getElementById('chat-send-btn');

  if (!wrapper || !form || !input || !btn) return;

  Object.assign(wrapper.style, {
    padding: "12px 16px",
    background: "#f8fbff",
    borderTop: "1px solid #f0f2f5"
  });

  Object.assign(form.style, {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#e8f2fe",
    borderRadius: "24px",
    padding: "4px 8px 4px 16px",
    transition: "all 0.2s ease-in-out"
  });

  Object.assign(input.style, {
    flex: "1",
    border: "none",
    background: "transparent",
    padding: "10px 0",
    fontSize: "0.95rem",
    outline: "none",
    color: "#1c1e21"
  });

  Object.assign(btn.style, {
    background: "linear-gradient(135deg, #007AFF, #005BB5)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "8px",
    boxShadow: "0 2px 4px rgba(0,122,255,0.3)",
    transition: "transform 0.1s ease"
  });

  input.onfocus = () => {
    form.style.backgroundColor = "#f0f7ff";
    form.style.boxShadow = "0 0 0 2px rgba(0,122,255,0.2)";
  };
  input.onblur = () => {
    form.style.backgroundColor = "#e8f2fe";
    form.style.boxShadow = "none";
  };
};

applyPremiumInputStyles();

hydrateAuthState();
initializeGoogleLogin();
