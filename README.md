# Arsh AI Technologies

Google login is wired into the existing auth system.

## Backend setup

Create `backend/.env` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
GOOGLE_CLIENT_ID=your_google_oauth_web_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
FRONTEND_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,https://arsh-ai-technologies-git-main-rajneesh-ashwales-projects.vercel.app
CALLBACK_URL=http://localhost:5000/auth/google/callback
```

## Google Console setup

Use a Google OAuth 2.0 **Web application** client and add your frontend origins, for example:

- `http://localhost:5500`
- `http://127.0.0.1:5500`
- `https://arsh-ai-technologies-git-main-rajneesh-ashwales-projects.vercel.app`

## MCP server

The project now includes a standalone MCP server in `backend/mcp-server.js`.

Start it with:

```bash
cd backend
npm run mcp:start
```

Available MCP tools:

- `company_profile`
- `list_services`
- `list_products`
- `ask_arsh_assistant`
- `create_contact_lead`
- `server_health`

Example MCP client config:

```json
{
  "mcpServers": {
    "arsh-ai": {
      "command": "node",
      "args": ["c:/Users/Rajneesh Ashwale/Desktop/Arsh ai technologies/backend/mcp-server.js"],
      "env": {
        "MONGO_URI": "your_mongodb_connection_string",
        "GEMINI_API_KEY": "your_google_gemini_api_key",
        "GOOGLE_CLIENT_ID": "your_google_oauth_web_client_id"
      }
    }
  }
}
```
