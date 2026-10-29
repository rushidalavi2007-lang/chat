# Deploy AETHER to Render

AETHER is a Node.js web service: it serves the built React/Vite frontend and its Express `/api/*` endpoints from the same Render service. **Do not deploy it as a Static Site**; the Node backend is required for AI replies and text-to-speech.

## 1. Put the project in GitHub

Extract the ZIP and open the `aether-main` folder. Upload the *contents* of this folder to the root of your GitHub repository, so that `package.json`, `server.ts`, `render.yaml`, `src/`, and `index.html` are at the repository root. Alternatively, keep the folder nested and set Render's Root Directory to `aether-main`.

## 2. Create the Render service

In Render, choose **New + → Web Service**, connect the GitHub repository, and use these settings:

- **Runtime:** Node
- **Build command:** `npm install --include=dev && npm run build`
- **Start command:** `npm run start`
- **Health check path:** `/api/health`
- **Node version:** `22.16.0` (also recorded in `.node-version`)

If you create the service from the included `render.yaml` Blueprint, the build/start commands and health check are preconfigured.

## 3. Add the Gemini API key

In the Render service, open **Environment** and add:

- Key: `GEMINI_API_KEY`
- Value: your real Google Gemini API key from <https://aistudio.google.com/app/apikey>

Save the environment changes and redeploy. Never commit your real API key, place it in frontend code, or upload it in `.env`.

## 4. Verify deployment

After the deployment is live, open `https://YOUR-SERVICE.onrender.com/api/health`. It should return JSON with `"status":"healthy"` and `"aiConfigured":true`. Then open the main service URL and send a test message.

If the page loads but AI messages fail, check that `GEMINI_API_KEY` is set correctly and that the key has API access/quota. A healthy `/api/health` response alone confirms the server is running; `aiConfigured` specifically reports whether a key is set.
