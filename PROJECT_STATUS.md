# StructuralAI - Project Status & Implementation Verification

**Project Name:** StructuralAI — Indian Infrastructure Structural Health & Forensic Audit Portal  
**Compliance Standards:** IS 456:2000 (Plain and Reinforced Concrete), IS 13920:2016 (Ductile Design), IRC 112:2020 (Concrete Road Bridges), CPWD Maintenance Manual  
**Architecture:** Full-Stack (React 19 + TypeScript + Tailwind CSS + Express backend with Vercel serverless compatibility + Roboflow Computer Vision Workflow + Gemini AI Forensic Reporting Engine + Supabase Auth & Cloud Database)

---

## 1. Production Build & Vercel Deployment Status

- **Build Status:** ✅ Production build (`npm run build`) compiles cleanly without TypeScript errors or missing modules.
- **Vercel Serverless Architecture:** All backend API handlers in `/api/*.ts` are designed to execute seamlessly both as Vercel serverless Node.js functions and within the unified Express container environment.
- **Vercel Configuration (`vercel.json`):** Configured with `"buildCommand": "vite build"`, `"outputDirectory": "dist"`, and API route rewrites to `/api/$1` and SPA fallback to `/index.html`.
- **Zero Localhost Hardcoding:** All frontend data fetching and inference workflows utilize relative paths (e.g. `/api/analyze`, `/api/generate-report`, `/api/telemetry`, `/api/roboflow/test`).

---

## 2. API Routes Specification

| Route | Method | Purpose | Vercel Serverless File |
| :--- | :--- | :--- | :--- |
| `/api/analyze` | `POST` | Executes Roboflow Serverless Workflow with server-side `ROBOFLOW_API_KEY`, normalizes CAD coordinates, calculates crack aperture / length / coverage, and computes IS 456 Structural Health Index & risk scores. | `/api/analyze.ts` |
| `/api/generate-report` | `POST` | Generates official 9-section forensic audit certificate using Gemini 2.5 Flash (`GEMINI_API_KEY`) with deterministic engineering fallback. | `/api/generate-report.ts` |
| `/api/telemetry` | `GET`, `POST` | Fetches active structural IoT telemetry streams (accelerometers, optical crack tell-tales, concrete strain gauges, inclinometers). | `/api/telemetry.ts` |
| `/api/roboflow/test` | `POST` | Direct connectivity health check verifying serverless Roboflow workflow latency and HTTP status. | `/api/roboflow/test.ts` |
| `/api/health` | `GET` | Service health status and environment configuration probe. | `/api/health.ts` |

---

## 3. Required Environment Variables

All sensitive API keys remain strictly server-side and are documented in `.env.example`:

| Variable | Scope | Required | Description |
| :--- | :--- | :--- | :--- |
| `ROBOFLOW_API_KEY` | Server-Side Secret | Yes (for live inference) | Roboflow API key for serverless workflow execution. Never exposed to client. |
| `ROBOFLOW_WORKFLOW_URL` | Server-Side / Config | Optional (defaults to workflow) | `https://serverless.roboflow.com/kumar-ritovash/workflows/building-infrastructure-defects-logic` |
| `GEMINI_API_KEY` | Server-Side Secret | Optional | Google Gemini API key for AI forensic report synthesis. Falls back to deterministic IS 456 engine if not provided. |
| `VITE_SUPABASE_URL` | Client & Server (Public) | Yes (for live Supabase) | Project URL for Supabase Auth and PostgreSQL storage. |
| `VITE_SUPABASE_ANON_KEY` | Client & Server (Public) | Yes (for live Supabase) | Supabase anonymous public client key for user authentication. |

---

## 4. Roboflow & StructuralAI Risk Engine Pipeline

```
User Uploads Real Structural Image
       │
       ▼
[Express / Vercel Serverless: POST /api/analyze]
       │
       ├─► [1] Roboflow Serverless Workflow API
       │       ├── Endpoint: https://serverless.roboflow.com/kumar-ritovash/workflows/building-infrastructure-defects-logic
       │       ├── Uses server-side process.env.ROBOFLOW_API_KEY
       │       └── Returns: predictions (x, y, width, height, confidence, class, points/masks)
       │
       ├─► [2] StructuralAI Physics & Risk Engine
       │       ├── Normalizes bounding coordinates to standard CAD space
       │       ├── Quantifies crack length (mm), aperture width (mm), surface area coverage (%)
       │       ├── IS 456:2000 limit state classification (Critical >2.0mm, High 0.5-2.0mm, Moderate <0.5mm, Low)
       │       ├── Calculates Composite Structural Health Index (SHI: 0-100) & Risk Matrix Score
       │       └── Formulates IS 456 / IRC 112 remediation protocols & CPWD safety directives
       │
       ▼
[Supabase Cloud Database & Storage]
       ├── `inspections` (Inspection header, overall risk, composite SHI, diagnosis summary)
       ├── `defects` (Individual defect rows with bounding boxes, physical metrics, remediation protocols)
       ├── `reports` (Certified CPWD structural compliance audit certificate)
       └── `buildings` (Auto-updated SHI, risk status, inspection count, critical defect count)
       │
       ▼
[Interactive Frontend UI]
       ├── Dashboard KPIs & Real-time Trends
       ├── Asset B-203 Deep Dive (Real defects & crack growth history)
       ├── Zonal Risk Monitor & Hotlist
       └── Official CPWD Compliance Certificates & Downloadable Reports
```

---

## 5. Forensic Report Structure (9 Required Sections)

1. **Building Information:** Asset Name, Code, Category, Structural System, Locality, Year Built, Floors/Spans, Owner
2. **Inspection Summary:** Certificate ID, Inspected Structural Element, Location/Grid, Lead Auditor, Badge ID, Date, SHI Score, Risk Level
3. **Detected Defects:** Itemized Roboflow defect detections, physical crack aperture (mm), path length (mm), coverage (%), IS 456 compliance
4. **AI Assessment:** Engineering diagnosis, load transfer mechanics, and material distress causes
5. **Structural Risk:** IS 456 & ISO 31000 risk matrix evaluation, potential failure modes
6. **Sensor Observations:** Dynamic sensor baseline telemetry, vibration (g), displacement (mm), strain (με)
7. **Recommended Actions:** Step-by-step IS 456 / IRC 112 repair methodology (CFRP wrap, high-pressure epoxy grouting, rebar passivation)
8. **Priority & Timeframe:** Mandatory remediation urgency (e.g. Immediate 48 Hours, Scheduled 14 Days)
9. **Structural Engineer Disclaimer:** Non-destructive testing notice and legal certification boundary

---

## 6. Known Limitations & Operating Boundaries

1. **Roboflow Cold-Start Latency:** Serverless Roboflow workflow execution may take 1.5–3.5s depending on image resolution and cold-start state.
2. **Non-Destructive Preliminary Boundary:** In accordance with IS 456:2000 and CPWD regulations, AI-assisted computer vision crack detection provides non-destructive preliminary forensic assessment and must be accompanied by on-site core sampling (IS 516) and rebound hammer testing (IS 13311 Part 2) prior to structural load modifications.
3. **Vercel Serverless Function Payload:** Images uploaded as base64 strings should remain under 4.5MB to stay within Vercel's standard serverless function payload limit.
