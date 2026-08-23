# ST-Solutions Deployment Guide (Render Backend + Vercel Frontend)

This guide provides the exact configuration required to deploy the **Backend API on Render** and the **Frontend Web App on Vercel**.

---

## 1. Root Cause of Previous Failures

### A. Render Failure (`Cannot find module '/opt/render/project/src/dist/server.cjs'`)
- **Root Cause**: Render was executing only `bun install` (the install command) as its build step and skipping `npm run build` / `bun run build`. Because the build script never ran, `dist/server.cjs` was never generated before `bun run start` was invoked.
- **Solution**: 
  1. Updated the Render **Build Command** to `npm install && npm run build` (or `bun install && bun run build`).
  2. Created a native `render.yaml` blueprint with automatic configuration.
  3. Made `server.ts` resilient with automatic fallback if deployed in API-only mode without static frontend assets.

### B. Vercel SPA Routing & Build
- **Root Cause**: Vite Single Page Applications (SPAs) require client-side routing rewrites (`/(.*) -> /index.html`) on Vercel, and must target the `dist` output directory.
- **Solution**: 
  1. Created `vercel.json` with framework configuration, SPA rewrites, and `buildCommand: "vite build"`.
  2. Integrated client-side `VITE_API_URL` environment variable support in `src/api/client.ts`.

---

## 2. Render Backend Deployment Steps

1. In Render Dashboard, click **New +** → **Web Service** (or use Blueprint with `render.yaml`).
2. Connect your GitHub repository `shaftech0777/ST-Solutions-Platform-11`.
3. Configure the following settings:
   - **Name**: `st-solutions-api`
   - **Environment**: `Node` (or `Bun`)
   - **Root Directory**: `.` (leave empty / root)
   - **Build Command**: `npm install && npm run build` (or `bun install && bun run build`)
   - **Start Command**: `node dist/server.cjs` (or `npm start`)
4. Add **Environment Variables** in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will automatically route traffic)
   - `CORS_ORIGIN`: `*` (or your Vercel URL, e.g. `https://st-solutions.vercel.app`)
   - `JWT_SECRET`: (Any secure random 32+ character string)
   - `DATABASE_URL`: (Optional - your PostgreSQL connection string, e.g. Supabase, Neon, or Render PostgreSQL)
5. Click **Create Web Service**. Your backend API will be live at `https://st-solutions-api.onrender.com`.

---

## 3. Vercel Frontend Deployment Steps

1. In Vercel Dashboard, click **Add New...** → **Project**.
2. Import `shaftech0777/ST-Solutions-Platform-11`.
3. Configure project settings:
   - **Framework Preset**: `Vite` (automatically detected via `vercel.json`)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build:web` or `vite build`
   - **Output Directory**: `dist`
4. Add **Environment Variables** in Vercel:
   - `VITE_API_URL`: `https://your-render-service.onrender.com` (e.g. `https://st-solutions-api.onrender.com`)
5. Click **Deploy**.

---

## 4. Verification Endpoints

- **Render Backend Health**: `https://<your-render-url>/health`
- **Render Backend API**: `https://<your-render-url>/api/v1`
- **Vercel Frontend**: `https://<your-vercel-domain>.vercel.app`
