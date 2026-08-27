# ST-Solutions Deployment Guide (Render Backend + Vercel Frontend)

This guide provides the exact configuration required to deploy the **Backend API on Render** and the **Frontend Web App on Vercel**.

---

## 1. Root Cause of Previous Failures

### A. Render Backend Setup
- **Root Directory**: `apps/api`
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `node dist/server.js` (or `npm start`)
- **Native Blueprint**: Configured via `render.yaml` at the project root for automated 1-click deployments.

### B. Vercel SPA Routing & Build
- **Framework Preset**: `Vite` (configured via `vercel.json`)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Client-Side API Config**: Handled via `VITE_API_URL` with robust URL normalization in `src/api/client.ts`.

---

## 2. Render Backend Deployment Steps

1. In Render Dashboard, click **New +** → **Web Service** (or deploy using Blueprint with `render.yaml`).
2. Connect your GitHub repository `shaftech0777/ST-Solutions-Platform-11`.
3. Configure the following settings:
   - **Name**: `st-solutions-api`
   - **Environment**: `Node`
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `node dist/server.js`
4. Add **Environment Variables** in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will automatically route traffic)
   - `CORS_ORIGIN`: `*` (or your Vercel URL, e.g. `https://st-solutions.vercel.app`)
   - `JWT_SECRET`: (Any secure random 32+ character string)
   - `DATABASE_URL`: (Your PostgreSQL connection string)
   - `ADMIN_EMAIL`: `admin@st-solutions.com`
   - `ADMIN_PASSWORD`: `[Your Strong Admin Password]`
   - `SUB_ADMIN_EMAIL`: `subadmin@st-solutions.com`
   - `SUB_ADMIN_PASSWORD`: `[Your Strong SubAdmin Password]`
5. Click **Create Web Service**. Your backend API will be live at `https://st-solutions-api.onrender.com`.

---

## 3. Vercel Frontend Deployment Steps

1. In Vercel Dashboard, click **Add New...** → **Project**.
2. Import `shaftech0777/ST-Solutions-Platform-11`.
3. Configure project settings:
   - **Framework Preset**: `Vite` (automatically detected via `vercel.json`)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables** in Vercel:
   - `VITE_API_URL`: `https://your-render-service.onrender.com` (e.g. `https://st-solutions-api.onrender.com`)
5. Click **Deploy**.

---

## 4. Verification Endpoints

- **Render Backend Health**: `https://<your-render-url>/health`
- **Render Backend API**: `https://<your-render-url>/api/v1`
- **Vercel Frontend**: `https://<your-vercel-domain>.vercel.app`
