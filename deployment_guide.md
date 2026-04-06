# ClassPulse Full Deployment Guide

This document outlines the architecture and deployment strategy for moving the ClassPulse application from a local environment onto the web. 

Currently, the application consists of:
1. **Frontend**: React + Vite SPA (Single Page Application)
2. **Backend**: FastAPI (Python) web service
3. **Database**: SQLite (`classpulse.db`)
4. **Dependencies**: Heavy media manipulation relies on `ffmpeg` internally via `pydub`.

---

## 1. Environment Preparation (Required Code Edits)

Currently, your frontend codebase hardcodes `http://localhost:8000` requests directly inside `UploadView.jsx`, `AuthView.jsx`, and `App.jsx`.

Before deploying, you must dynamically read the backend URL base using environment variables. 
For Vite, you should change `fetch("http://localhost:8000/api/upload")` to use an environment variable like `import.meta.env.VITE_API_URL` so that when hosted on Vercel, the React app correctly routes the HTTPS traffic to your new backend server.

---

## 2. Deploying the Backend (FastAPI + SQLite)

Because your application relies on a local file database (`classpulse.db`) and large Media/Audio file processing in `/uploads`, your server requires **Persistent Storage** so data does not wipe every time the server restarts. 

**Recommended Platform: [Render.com](https://render.com/) or [Railway.app](https://railway.app/)**

### Render Steps:
1. Create a Render account and connect your GitHub repository (`akhilkaushik024/ClassPulse`).
2. Create a **New Web Service**.
3. Set the Root Directory to `backend/`.
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn main:app --host 0.0.0.0 --port 10000`
6. **Critical**: You must add a "Disk" in the persistent storage section mounted to `/backend` (or a specific data directory) to prevent the `classpulse.db` and uploaded `.mp4/.wav` clips from getting erased automatically every 24 hours.

---

## 3. Deploying the Frontend (React Vite)

Once your backend is successfully hosted (e.g. `https://classpulse-api.onrender.com`), you can deploy your frontend.

**Recommended Platform: [Vercel](https://vercel.com/)**

1. Create a Vercel project and import the `akhilkaushik024/ClassPulse` repository.
2. In the "Root Directory" dropdown, select `frontend`.
3. Vercel will automatically detect Vite.
4. Go to **Environment Variables** and add:
   - Key: `VITE_API_BASE_URL`
   - Value: `<Your Render Backend API URL from Step 2>`
5. Click **Deploy**.

> [!NOTE]  
> Make sure both APIs allow CORS! The FastAPI backend handles CORS internally in `main.py` where `allow_origins=["*"]` is currently defined, so cross-origin interaction from a Vercel domain will be seamless.
