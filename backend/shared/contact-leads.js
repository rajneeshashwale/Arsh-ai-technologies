const { mongoose } = require("./mongo");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-z\s]+$/;

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateContactLead({ name, email, message }) {
  const trimmedName = String(name || "").trim();
  const trimmedEmail = String(email || "").trim();
  const trimmedMessage = String(message || "").trim();

  if (!trimmedName || !trimmedEmail || !trimmedMessage) {
    return "All fields are required.";
  }

  if (!NAME_REGEX.test(trimmedName)) {
    return "Name must contain only letters.";
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return "Enter a valid email address.";
  }

  return null;
}

async function saveContactLead({ name, email, message }) {
  const validationError = validateContactLead({ name, email, message });

  if (validationError) {
    throw new Error(validationError);
  }

  const lead = await Contact.create({
    name: String(name).trim(),
    email: normalizeEmail(email),
    message: String(message).trim()
  });

  return lead;
}

module.exports = {
  Contact,
  EMAIL_REGEX,
  NAME_REGEX,
  normalizeEmail,
  saveContactLead,
  validateContactLead
};
