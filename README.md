# Arsh AI Technologies

Google login is wired into the existing auth system.

## Backend setup

Create `backend/.env` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_oauth_web_client_id
```

## Google Console setup

Use a Google OAuth 2.0 **Web application** client and add your frontend origins, for example:

- `http://localhost:5500`
- `http://127.0.0.1:5500`
- your production frontend domain

The `GOOGLE_CLIENT_ID` in backend env must be the same client id used for those origins.
