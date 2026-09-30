# Lloyds Metals & Energy Limited — Worker Onboarding & Camp Management System

Enterprise digital onboarding, medical evaluation, EHS safety induction, IT biometrics enrollment, and camp living quarters management platform. Built for **Lloyds Metals & Energy Limited (Hedri Plant)** and **Lloyds Infrastructure & Construction**.

---

## 🏗️ Architecture & Workflow

The platform streamlines contractor worker intake across 5 mandatory stages:

```
[Stage 1: HR Intake] ➡️ [Stage 2: Medical Exam] ➡️ [Stage 3: EHS Safety] ➡️ [Stage 4: IT Biometrics] ➡️ [Stage 5: Camp Housing] ➡️ [Gate Pass ID Card]
```

1. **Stage 1 — HR & Contractor Registration**: Personal details, trade qualification, emergency contacts, contractor agency mapping, portrait photograph upload.
2. **Stage 2 — Medical Fitness Examination**: Clinical vitals (BP, SpO2, Pulse, RBS, BMI), vision, hearing, vertigo, alcohol sobriety test, fitness certification by Chief Medical Officer.
3. **Stage 3 — EHS Safety Induction**: Site hazard briefing, mandatory PPE issuance tracking (Helmet, High-Vis Jacket, Steel-toe Shoes, Harness).
4. **Stage 4 — IT Biometrics & CWMS**: Turnstile facial biometric registration, CWMS master enrollment, site access authorization.
5. **Stage 5 — Camp Housing & Gate Pass**: Quarters allocation (Camp, Block, Room, Bed), supervisor signoff, printable dual-sided Gate Pass ID Card with QR code.

---

## 🔐 Authentication & Single Sign-On

- **Google Workspace SSO**: Exclusively restricted to authorized `@lloyds.in` enterprise domain accounts.
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Executive Administration & Command Center
  - `HR`: Human Resources Intake & Candidate Pipeline
  - `MEDICAL`: Medical Officers & Health Screening
  - `SAFETY`: EHS Safety Leads & PPE Operations
  - `IT`: IT Systems Administrators & Biometric Punch Operations
  - `CAMP`: Camp Living Quarters & Accommodation Managers

---

## 🗄️ Database Integration

- **Microsoft Fabric SQL Database**: Real-time cloud synchronization to Fabric SQL DB via Azure Active Directory Service Principal (`@azure/identity`, `mssql`).
- **Resilient Local Persistence**: Zero-delay offline mode with automatic state persistence and background sync.

---

## 🚀 Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in your Fabric and Azure credentials in .env

# 3. Start development environment
npm run dev      # Starts Vite dev server at http://localhost:3000
npm run server   # Starts Express backend at http://localhost:5000
```

---

## 🐧 Production Linux Deployment

For comprehensive step-by-step instructions on deploying to Ubuntu, Debian, RHEL, or Docker, please refer to:
👉 **[DEPLOYMENT.md](DEPLOYMENT.md)**

```bash
# Production Build & Run
npm run build
npm start
```

---

## 📄 License & Intellectual Property
© 2026 Lloyds Metals & Energy Limited. All rights reserved.
Internal Enterprise Production Application.
