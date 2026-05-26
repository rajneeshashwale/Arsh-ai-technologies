const COMPANY_PROFILE = Object.freeze({
  name: "Arsh AI Technologies",
  tagline: "AI products, consulting, and automation solutions for modern businesses.",
  headquarters: "Pune, Maharashtra, India",
  additionalLocation: "Balaghat, Madhya Pradesh, India",
  email: "info@arshai.tech",
  phone: "+91 8319850982",
  pricingPolicy: "Customized pricing based on project scope.",
  consultationCta: "Use the contact form or reach out by email or phone for project scoping."
});

const COMPANY_STATS = Object.freeze({
  successfulProjects: "50+",
  happyClients: "25+",
  aiSolutionsDelivered: "10+",
  uptime: "99.9%"
});

const PRODUCTS = Object.freeze([
  {
    name: "AI Analytics Engine",
    summary: "Predictive analytics platform powered by neural networks for deep data insights."
  },
  {
    name: "Automation Assistant",
    summary: "Intelligent automation tooling for repetitive business workflows."
  },
  {
    name: "AI Chatbot Suite",
    summary: "Conversational AI chatbots for customer engagement and support."
  },
  {
    name: "Cloud AI Platform",
    summary: "Cloud deployment platform for scalable AI models with privacy controls."
  }
]);

const SERVICES = Object.freeze([
  {
    name: "Website Development",
    summary: "Modern, responsive, SEO-optimized websites with cutting-edge UI/UX and AI integration."
  },
  {
    name: "App Development",
    summary: "Native and cross-platform iOS & Android mobile applications with AI-powered features."
  },
  {
    name: "IoT Solutions",
    summary: "Smart, connected device ecosystems with real-time monitoring and data analytics."
  },
  {
    name: "AI Strategy & Consulting",
    summary: "Roadmapping, transformation planning, and AI adoption guidance."
  },
  {
    name: "Data Engineering",
    summary: "Scalable pipelines, real-time analytics, and intelligent data platforms."
  },
  {
    name: "Custom AI Model Development",
    summary: "Design, training, and deployment of ML models tailored to business needs."
  },
  {
    name: "Cloud AI Integration",
    summary: "Integrating AI capabilities into existing cloud ecosystems and workflows."
  }
]);

function buildCompanyKnowledgeText() {
  const lines = [
    `Company: ${COMPANY_PROFILE.name}`,
    `Tagline: ${COMPANY_PROFILE.tagline}`,
    `Headquarters: ${COMPANY_PROFILE.headquarters}`,
    `Additional location: ${COMPANY_PROFILE.additionalLocation}`,
    `Contact email: ${COMPANY_PROFILE.email}`,
    `Contact phone: ${COMPANY_PROFILE.phone}`,
    `Pricing guidance: ${COMPANY_PROFILE.pricingPolicy}`,
    `Consultation CTA: ${COMPANY_PROFILE.consultationCta}`,
    `Stats: ${COMPANY_STATS.successfulProjects} projects, ${COMPANY_STATS.happyClients} clients, ${COMPANY_STATS.aiSolutionsDelivered} AI solutions delivered, ${COMPANY_STATS.uptime} uptime`,
    "Products:"
  ];

  for (const product of PRODUCTS) {
    lines.push(`- ${product.name}: ${product.summary}`);
  }

  lines.push("Services:");

  for (const service of SERVICES) {
    lines.push(`- ${service.name}: ${service.summary}`);
  }

  return lines.join("\n");
}

module.exports = {
  COMPANY_PROFILE,
  COMPANY_STATS,
  PRODUCTS,
  SERVICES,
  buildCompanyKnowledgeText
};
