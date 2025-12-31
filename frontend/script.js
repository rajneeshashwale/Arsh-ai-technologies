const toggle = document.getElementById("menu-toggle");
const navMenu = document.querySelector("nav ul");

toggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// Simple scroll animation for product cards
const cards = document.querySelectorAll(".product-card");

const revealOnScroll = () => {
  const triggerBottom = window.innerHeight * 0.85;
  cards.forEach(card => {
    const cardTop = card.getBoundingClientRect().top;
    if (cardTop < triggerBottom) {
      card.classList.add("show");
    } else {
      card.classList.remove("show");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

// Scroll animation for services
const serviceCards = document.querySelectorAll(".service-card");

const showOnScroll = () => {
  const triggerBottom = window.innerHeight * 0.85;

  serviceCards.forEach(card => {
    const cardTop = card.getBoundingClientRect().top;
    if (cardTop < triggerBottom) {
      card.classList.add("show");
    } else {
      card.classList.remove("show");
    }
  });
};

window.addEventListener("scroll", showOnScroll);
showOnScroll();

/* ===== Contact Form + Backend Connection + Validation ===== */
document.getElementById("contactForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const status = document.getElementById("form-status");

  // Validation regex patterns
  const namePattern = /^[A-Za-z\s]+$/; // only letters and spaces
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/; // basic email pattern

  // === VALIDATION CHECKS ===
  if (name === "" || email === "" || message === "") {
    status.textContent = "⚠️ Please fill in all fields!";
    status.style.color = "orange";
    return;
  }

  if (!namePattern.test(name)) {
    status.textContent = "❌ Name must contain only letters (no numbers or symbols).";
    status.style.color = "red";
    return;
  }

  if (!emailPattern.test(email)) {
    status.textContent = "❌ Please enter a valid email address.";
    status.style.color = "red";
    return;
  }

  // Form data object
  const formData = { name, email, message };

  try {
    const response = await fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      status.textContent = "✅ Message sent successfully!";
      status.style.color = "#00ff99";
      document.getElementById("contactForm").reset();

      // Hide success message after 5 seconds
      setTimeout(() => {
        status.textContent = "";
      }, 2000);
    } else {
      status.textContent = "❌ Failed to send message. Try again!";
      status.style.color = "red";
    }

    console.log("Backend Response:", result);
  } catch (error) {
    console.error("Error connecting to backend:", error);
    status.textContent = "⚠️ Server error. Please try again later.";
    status.style.color = "red";
  }
});
