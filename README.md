# Hiive Dealflow Copilot

![AI Copilot](https://img.shields.io/badge/AI%20Copilot-gray)
![Rules + LLM](https://img.shields.io/badge/Rules%20%2B%20LLM-brightgreen)
![LLM](https://img.shields.io/badge/LLM-blue)
![GPT-4o-mini](https://img.shields.io/badge/GPT--4o--mini-blue)
![Backend](https://img.shields.io/badge/Backend-orange)
![FastAPI](https://img.shields.io/badge/FastAPI-orange)
![Frontend](https://img.shields.io/badge/Frontend-purple)
![Next.js + React](https://img.shields.io/badge/Next.js%20%2B%20React-purple)
![Status](https://img.shields.io/badge/Status-brightgreen)
![Hiive AI Builder](https://img.shields.io/badge/Hiive%20AI%20Builder-brightgreen)

> An AI copilot for transaction operations that surfaces hidden risks, missing steps, and next-best actions across the deal pipeline.

---

## 📊 Demo

👉 **[Watch Demo Video](https://youtu.be/Yi-BocTgGMI)**  
*(The system is not deployed publicly; this video demonstrates the full workflow.)*

---

## 🧠 Problem

Deal execution at Hiive is fragmented across:

- documents  
- communications  
- workflow systems  

As a result, teams often move deals forward without full visibility into:

- missing documents  
- unresolved compliance issues  
- cross-document inconsistencies  

This leads to delays, rework, and potential regulatory risk—especially in a high-volume, regulated environment.

---

## 🚀 What This Builds

A **Deal Pipeline Monitoring Copilot** for Transaction Services teams.

The system helps teams:

- Monitor pipeline progress and operational health  
- Detect hidden risks across documents, communications, and workflows  
- Prioritize deals through an action queue  
- Generate clear next actions and follow-ups  

---

## 🏗 Architecture

![Architecture](./docs/architecture.svg)

The system combines structured rule-based validation with LLM reasoning, unified through a deal-centric context layer.

---

## ⚙️ How It Works

The system follows a multi-stage pipeline aligned with real-world deal operations:

1. **Data Layer**  
   Aggregates deals, counterparties, documents, communications, notes, and workflow templates into a unified **DealContext**

2. **Analysis Layer**  
   - Rule engine → deterministic validation (documents, KYC, SLA, consistency)  
   - LLM → semantic reasoning over unstructured signals (blockers, summaries, next actions)

3. **Scoring Layer**  
   - **Risk Score** → measures unresolved issues and compliance exposure  
   - **Readiness Score** → measures progress toward closing  

4. **Action Layer**  
   - Escalation routing  
   - Recommended next actions  
   - Email generation  

---

## ⭐ Key Features

- Detects **false readiness** (deals that are advanced but still risky)  
- Surfaces **cross-document inconsistencies** with clear evidence  
- Prioritizes work via an **action queue**  
- Provides **explainable audit trails**  
- Generates **follow-up emails grounded in detected issues**  

---

## 📈 Product Views

### Overview

![Dashboard](./docs/dashboard.png)

Shows overall pipeline health, including:
- Overview
- pipeline health signals (stage distribution, bottlenecks, SLA breaches)
- action queue with risk, stage, and priority filters

---

### Deal Analysis - Overview

![Pipeline & Queue](./docs/analysis1.png)

Provides a high-level view of a single deal:
- progress vs. risk (readiness vs. unresolved issues)  
- key blockers and recommended next actions  
- stage-level context and escalation signals  

---

### Deal Analysis

![Deal Analysis](./docs/analysis2.png)

Drills deeper into the same deal:
- missing documents and field mismatches  
- cross-document inconsistencies (majority vs. outliers)  
- timeline, audit trail, and generated follow-up email  
---

## 🧩 Design Principles

- **Rules + LLM (not LLM-only)** → ensures reliability and control  
- **Explainability first** → every decision is backed by evidence  
- **Progress ≠ Risk** → separates deal progression from unresolved issues  

---

## 🛠 Tech Stack

- **Backend**: FastAPI (Python 3.10), Pydantic, Uvicorn  
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui  
- **LLM**: OpenAI GPT-4o-mini (analysis and email generation, with fallback)  
- **Data**: JSON flat files loaded in-memory  

---

## ▶️ Run Locally

### 1. Backend (Python)

```bash
conda env create -f backend/environment.yml
conda activate hiive-copilot

cd backend
uvicorn app.main:app --reload
```

### 2. Frontend (Node.js)

```bash
cd frontend
npm install
npm run dev
```

> The frontend uses a separate Node.js environment. All required packages are defined in `package.json`.

---

### 🔑 Environment Variables

This project uses OpenAI for LLM-based analysis (risk reasoning, summaries, and email generation).

Set your API key before running:

```bash
export OPENAI_API_KEY=your_api_key_here
```

Alternatively, create a `.env` file in the `backend/` directory:

```env
OPENAI_API_KEY=your_api_key_here
```

---

### ⚠️ Notes

- The system includes a **rule-based fallback**, so core functionality still works without an API key
- LLM features (summarization, blockers, email generation) require a valid key

---

### 3. Access

- App: http://localhost:3000  
- API docs: http://localhost:8000/docs
---

## 📌 Notes

- This project is designed as a functional prototype for a Transaction Services workflow  
- The demo video showcases the full user flow, including dashboard navigation and deal-level analysis  
- All outputs are explainable and traceable, supporting use in regulated operational environments  