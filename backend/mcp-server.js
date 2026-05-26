const path = require("path");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const z = require("zod");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const {
  COMPANY_PROFILE,
  COMPANY_STATS,
  PRODUCTS,
  SERVICES
} = require("./shared/company-data");
const { askArshAssistant } = require("./shared/arsh-assistant");
const { connectMongo } = require("./shared/mongo");
const { saveContactLead } = require("./shared/contact-leads");

function asTextBlock(title, items) {
  return [`${title}:`, ...items.map(item => `- ${item}`)].join("\n");
}

function createMcpServer() {
  const server = new McpServer({
    name: "arsh-ai-technologies-mcp",
    version: "1.1.0"
  });

  // ─── Tool 1: Company Profile ─────────────────────────────────────────────
  server.registerTool(
    "company_profile",
    {
      title: "Company Profile",
      description:
        "Returns the official Arsh AI Technologies company profile, contact details, and summary metrics.",
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      }
    },
    async () => ({
      content: [
        {
          type: "text",
          text: [
            `${COMPANY_PROFILE.name}`,
            COMPANY_PROFILE.tagline,
            `HQ: ${COMPANY_PROFILE.headquarters}`,
            `Additional location: ${COMPANY_PROFILE.additionalLocation}`,
            `Contact: ${COMPANY_PROFILE.email} | ${COMPANY_PROFILE.phone}`,
            `Pricing: ${COMPANY_PROFILE.pricingPolicy}`,
            `Stats: ${COMPANY_STATS.successfulProjects} projects, ${COMPANY_STATS.happyClients} clients, ${COMPANY_STATS.aiSolutionsDelivered} AI solutions, ${COMPANY_STATS.uptime} uptime`
          ].join("\n")
        }
      ],
      structuredContent: {
        company: COMPANY_PROFILE,
        stats: COMPANY_STATS
      }
    })
  );

  // ─── Tool 2: List All Services ───────────────────────────────────────────
  server.registerTool(
    "list_services",
    {
      title: "List Services",
      description:
        "Lists all Arsh AI Technologies service offerings including AI consulting, data engineering, custom AI models, cloud integration, website development, and app development.",
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      }
    },
    async () => ({
      content: [
        {
          type: "text",
          text: asTextBlock(
            "Services",
            SERVICES.map(service => `${service.name}: ${service.summary}`)
          )
        }
      ],
      structuredContent: {
        services: SERVICES,
        total: SERVICES.length
      }
    })
  );

  // ─── Tool 3: List All Products ───────────────────────────────────────────
  server.registerTool(
    "list_products",
    {
      title: "List Products",
      description: "Lists all Arsh AI Technologies product offerings.",
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      }
    },
    async () => ({
      content: [
        {
          type: "text",
          text: asTextBlock(
            "Products",
            PRODUCTS.map(product => `${product.name}: ${product.summary}`)
          )
        }
      ],
      structuredContent: {
        products: PRODUCTS,
        total: PRODUCTS.length
      }
    })
  );

  // ─── Tool 4: Web & App Development Info ──────────────────────────────────
  server.registerTool(
    "web_app_development",
    {
      title: "Web & App Development",
      description:
        "Returns detailed information about Arsh AI Technologies' Website Development and App Development services, including technologies used, deliverables, and how to get a quote.",
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      }
    },
    async () => {
      const webService = SERVICES.find(s => s.name === "Website Development");
      const appService = SERVICES.find(s => s.name === "App Development");

      return {
        content: [
          {
            type: "text",
            text: [
              "=== Website Development ===",
              webService ? webService.summary : "Modern, responsive websites with AI integration.",
              "",
              "Deliverables:",
              "- Responsive design (mobile, tablet, desktop)",
              "- Modern UI/UX",
              "- SEO optimized",
              "- Custom backend & database",
              "- AI integration (optional)",
              "- E-commerce support",
              "",
              "Technologies: HTML, CSS, JavaScript, React, Node.js, MongoDB",
              "",
              "=== App Development ===",
              appService ? appService.summary : "Native and cross-platform iOS & Android mobile apps.",
              "",
              "Deliverables:",
              "- Native Android & iOS apps",
              "- Cross-platform (Flutter / React Native)",
              "- AI-powered features",
              "- Backend & API integration",
              "- Play Store & App Store publishing",
              "",
              "Technologies: Flutter, React Native, Firebase, Node.js",
              "",
              `Pricing: ${COMPANY_PROFILE.pricingPolicy}`,
              `Contact: ${COMPANY_PROFILE.email} | ${COMPANY_PROFILE.phone}`
            ].join("\n")
          }
        ],
        structuredContent: {
          websiteDevelopment: {
            service: webService,
            deliverables: [
              "Responsive design",
              "Modern UI/UX",
              "SEO optimized",
              "Custom backend",
              "AI integration",
              "E-commerce support"
            ],
            technologies: ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"]
          },
          appDevelopment: {
            service: appService,
            deliverables: [
              "Native Android & iOS",
              "Cross-platform (Flutter/React Native)",
              "AI-powered features",
              "Backend integration",
              "App Store publishing"
            ],
            technologies: ["Flutter", "React Native", "Firebase", "Node.js"]
          },
          contact: {
            email: COMPANY_PROFILE.email,
            phone: COMPANY_PROFILE.phone
          }
        }
      };
    }
  );

  // ─── Tool 5: Ask Arsh Assistant ──────────────────────────────────────────
  server.registerTool(
    "ask_arsh_assistant",
    {
      title: "Ask Arsh Assistant",
      description:
        "Sends a question to the Arsh AI assistant and returns a grounded response. Uses Gemini AI when configured, otherwise uses intelligent rule-based fallback.",
      inputSchema: {
        question: z.string().min(1).describe("User question for the Arsh AI assistant")
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: true
      }
    },
    async ({ question }) => {
      const reply = await askArshAssistant(question);

      return {
        content: [
          {
            type: "text",
            text: reply
          }
        ],
        structuredContent: {
          reply
        }
      };
    }
  );

  // ─── Tool 6: Create Contact Lead ─────────────────────────────────────────
  server.registerTool(
    "create_contact_lead",
    {
      title: "Create Contact Lead",
      description: "Saves a new contact lead to MongoDB for Arsh AI Technologies.",
      inputSchema: {
        name: z.string().min(1).describe("Lead name"),
        email: z.string().email().describe("Lead email address"),
        message: z.string().min(1).describe("Lead inquiry or project message")
      },
      annotations: {
        readOnlyHint: false,
        openWorldHint: false
      }
    },
    async ({ name, email, message }) => {
      await connectMongo();
      const lead = await saveContactLead({ name, email, message });

      return {
        content: [
          {
            type: "text",
            text: `Lead saved for ${lead.name} (${lead.email}) on ${lead.date.toISOString()}.`
          }
        ],
        structuredContent: {
          id: String(lead._id),
          name: lead.name,
          email: lead.email,
          message: lead.message,
          createdAt: lead.date.toISOString()
        }
      };
    }
  );

  // ─── Tool 7: Server Health ───────────────────────────────────────────────
  server.registerTool(
    "server_health",
    {
      title: "Server Health",
      description:
        "Returns configuration status for the MCP server integrations (Gemini, MongoDB, Google OAuth).",
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      }
    },
    async () => {
      const geminiKey = process.env.GEMINI_API_KEY;
      const geminiConfigured =
        Boolean(geminiKey) &&
        geminiKey !== "YOUR_ACTUAL_API_KEY_HERE" &&
        geminiKey.trim() !== "";

      return {
        content: [
          {
            type: "text",
            text: [
              "MCP server health (v1.1.0):",
              `- Gemini configured: ${geminiConfigured} ${geminiConfigured ? "✓" : "(rule-based fallback active)"}`,
              `- Mongo configured: ${Boolean(process.env.MONGO_URI)}`,
              `- Google OAuth configured: ${Boolean(process.env.GOOGLE_CLIENT_ID)}`,
              `- Total services: ${SERVICES.length}`,
              `- Total products: ${PRODUCTS.length}`
            ].join("\n")
          }
        ],
        structuredContent: {
          version: "1.1.0",
          geminiConfigured,
          geminiMode: geminiConfigured ? "api" : "rule-based-fallback",
          mongoConfigured: Boolean(process.env.MONGO_URI),
          googleOAuthConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
          totalServices: SERVICES.length,
          totalProducts: PRODUCTS.length
        }
      };
    }
  );

  return server;
}

async function start() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("Arsh MCP server v1.1.0 is ready on stdio.\n");
}

if (require.main === module) {
  start().catch(error => {
    process.stderr.write(`Failed to start Arsh MCP server: ${error.stack || error.message}\n`);
    process.exit(1);
  });
}

module.exports = {
  createMcpServer,
  start
};
