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
    version: "1.0.0"
  });

  server.registerTool(
    "company_profile",
    {
      title: "Company Profile",
      description: "Returns the official Arsh AI Technologies company profile, contact details, and summary metrics.",
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

  server.registerTool(
    "list_services",
    {
      title: "List Services",
      description: "Lists Arsh AI Technologies service offerings.",
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
        services: SERVICES
      }
    })
  );

  server.registerTool(
    "list_products",
    {
      title: "List Products",
      description: "Lists Arsh AI Technologies product offerings.",
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
        products: PRODUCTS
      }
    })
  );

  server.registerTool(
    "ask_arsh_assistant",
    {
      title: "Ask Arsh Assistant",
      description: "Sends a question to the Arsh AI assistant and returns a grounded response using the company's Gemini-powered assistant.",
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

  server.registerTool(
    "server_health",
    {
      title: "Server Health",
      description: "Returns configuration status for the MCP server integrations.",
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
            "MCP server health:",
            `- Gemini configured: ${Boolean(process.env.GEMINI_API_KEY)}`,
            `- Mongo configured: ${Boolean(process.env.MONGO_URI)}`,
            `- Google OAuth configured: ${Boolean(process.env.GOOGLE_CLIENT_ID)}`
          ].join("\n")
        }
      ],
      structuredContent: {
        geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
        mongoConfigured: Boolean(process.env.MONGO_URI),
        googleOAuthConfigured: Boolean(process.env.GOOGLE_CLIENT_ID)
      }
    })
  );

  return server;
}

async function start() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("Arsh MCP server is ready on stdio.\n");
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
