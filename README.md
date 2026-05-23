# Arsh AI Technologies

Google login is wired into the existing auth system.

## Backend setup

Create `backend/.env` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_oauth_web_client_id
FRONTEND_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,https://your-frontend-domain
```

## Google Console setup

Use a Google OAuth 2.0 **Web application** client and add your frontend origins, for example:

- `http://localhost:5500`
- `http://127.0.0.1:5500`
- `https://your-frontend-domain`

The `GOOGLE_CLIENT_ID` in backend env must be the same client id used for those origins.

## Fixing `Error 400: origin_mismatch`

If Google shows `origin_mismatch`, the frontend URL opening the page is not whitelisted in your Google OAuth client.

Add the exact origin in Google Cloud Console:

1. Go to `Google Cloud Console -> APIs & Services -> Credentials`.
2. Open your OAuth 2.0 **Web application** client.
3. In `Authorized JavaScript origins`, add the exact frontend origin:
   - local: `http://localhost:5500`
   - local: `http://127.0.0.1:5500`
   - production: `https://your-frontend-domain`
4. Save the client.
5. Put the same frontend origins in `FRONTEND_ORIGINS` in `backend/.env`.
6. Restart the backend after changing env values.

Important:

- Add only the origin, not a full path. Use `https://example.com`, not `https://example.com/login`.
- Do not add a trailing slash.
- The backend `GOOGLE_CLIENT_ID` must match the same Google OAuth client you updated.
