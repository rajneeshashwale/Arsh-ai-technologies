// ================= API URL =================
const API_URL = "https://arsh-ai-technologies.onrender.com";

// ================= Mobile Menu =================
const toggle = document.getElementById("menu-toggle");
const navMenu = document.querySelector("nav ul");

toggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// ================= Scroll Animation (Products) =================
const cards = document.querySelectorAll(".product-card");

const revealOnScroll = () => {
  const triggerBottom = window.innerHeight * 0.85;
  cards.forEach(card => {
    const cardTop = card.getBoundingClientRect().top;
    card.classList.toggle("show", cardTop < triggerBottom);
  });
};

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

// ================= Scroll Animation (Services) =================
const serviceCards = document.querySelectorAll(".service-card");

const showOnScroll = () => {
  const triggerBottom = window.innerHeight * 0.85;
  serviceCards.forEach(card => {
    const cardTop = card.getBoundingClientRect().top;
    card.classList.toggle("show", cardTop < triggerBottom);
  });
};

window.addEventListener("scroll", showOnScroll);
showOnScroll();

// ================= Contact Form + Backend =================
document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const status = document.getElementById("form-status");

  const namePattern = /^[A-Za-z\s]+$/;
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  // Validation
  if (!name || !email || !message) {
    status.textContent = "⚠️ Please fill in all fields!";
    status.style.color = "orange";
    return;
  }

  if (!namePattern.test(name)) {
    status.textContent = "❌ Name must contain only letters.";
    status.style.color = "red";
    return;
  }

  if (!emailPattern.test(email)) {
    status.textContent = "❌ Invalid email address.";
    status.style.color = "red";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
    });

    const result = await response.json();

    if (response.ok) {
      status.textContent = "✅ Message sent successfully!";
      status.style.color = "#00ff99";
      document.getElementById("contactForm").reset();

      setTimeout(() => (status.textContent = ""), 2000);
    } else {
      status.textContent = result.error || "❌ Failed to send message.";
      status.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    status.textContent = "⚠️ Server error. Please try again later.";
    status.style.color = "red";
  }
});
