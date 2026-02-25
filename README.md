# 🧪 Applied AI Systems Lab

**Open-source playground for production-grade AI integration patterns.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-Latest-blue)](https://sdk.vercel.ai/)

Applied AI Systems Lab is a **Next.js 16** starter for building real-world AI features: multi-model orchestration, cost tracking, observability, cache, and safety limits.  
It is designed as a teaching repo and a boilerplate you can fork for your own products.

## ✨ Features

- **Multi-Provider Orchestrator**  
  Single API for **OpenAI, Anthropic, Gemini, Groq** with automatic retry and friendly model IDs.

- **BYOK (Bring Your Own Key)**  
  Users can plug in their own API keys (OpenAI/Anthropic/Groq/Gemini), stored only in `localStorage`.  
  When BYOK is used, **lab budget limits are skipped** and costs are billed directly to the user.

- **Safety: Rate Limit & Budget Guardrails**  
  - Per-request caps (input length, max tokens, max ~$0.20 / call for shared keys).  
  - Daily shared budget (default ~$5/day) to protect the owner’s keys.  
  - IP-based rate limit (default 5 requests/min/IP) on the experiment API.

- **Intelligent Caching**  
  SHA-256 input hashing with TTL-based caching so repeated runs don’t burn tokens unnecessarily.

- **Cost & Token Tracking**  
  Realtime token estimation and cost calculation per request, visible in the UI and returned as metadata.

- **Type Safety**  
  End-to-end **TypeScript + Zod** for all experiment inputs/outputs and AI responses.

- **Modular Experiments System**  
  Each “experiment” is a module (`schema`, `prompt`, `handler`, `metadata`) that can be added without touching core infra.

## 🧪 Built-in Experiments

- **Vietnamese Text Analyzer** – Sentiment, tone, and key phrase extraction for Vietnamese text.
- **SQL Generator** – Natural language → dialect-aware SQL with optional schema awareness.
- **Code Insight Engine** – Complexity and architecture hints for pasted code.
- **Structured Data Extractor** – “Strict output” JSON extraction with Zod validation.
- **Model Arena** – Compare multiple models side-by-side (latency, cost, quality) with selectable model list and provider availability checks.
- **Intent Classifier** – Map free-form commands to structured intents and parameters.
- **Prompt Robustness Tester** – Add noise/adversarial variants and see how robust the model is.
- **Chain-of-Thought Reasoning** – Visualize multi-step reasoning for complex problems.
- **Lottery Probability Lab** – Educational tool that uses exact combinatorics and probability to show:
  - True jackpot odds and expected value (EV) of lottery play.
  - Long-term scenarios (many draws, many tickets).
  - Clear disclaimers: **no “lucky numbers”, no gambling advice, educational use only.**

## 🔐 Safety & Limits (Server-Side)

- **Per-request safety**
  - Max input length: 10,000 characters.
  - Max tokens per request: 4,000.
  - Max estimated cost per request (shared keys): ~$0.20.

- **Daily shared budget**
  - Default **$5/day** cap for all users **sharing the lab owner’s keys**.
  - Uses Redis (Upstash) when configured, otherwise falls back to in-memory counters.

- **Rate limiting**
  - `5 requests / minute / IP` on `/api/experiments/[slug]`.
  - Returns `429` with a retry-after hint; the UI surfaces a “Too many requests” notice with countdown.

- **BYOK behavior**
  - When the request carries user API keys in headers, budget and cost caps apply **only to the user’s provider account**, not the shared lab budget.

## 🚀 Quick Start

1. **Clone the repo**

   ```bash
   git clone https://github.com/your-username/applied-ai-systems-lab.git
   cd applied-ai-systems-lab
   ```

2. **Install dependencies**

   ```bash
   npm install
   # hoặc
   # pnpm install
   ```

3. **Configure Environment Variables**

   Create a `.env.local` file:

   ```env
   # At least one provider should be configured for the shared lab keys
   OPENAI_API_KEY=your_key
   ANTHROPIC_API_KEY=your_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_key
   GROQ_API_KEY=your_key

   # Optional but recommended for production (shared cache, rate-limit, budget)
   REDIS_URL=your_redis_url
   REDIS_TOKEN=your_redis_token   # or equivalent, depending on your Redis provider
   ```

   Users can still use **BYOK** via the Settings modal in the UI; those keys are stored only in the browser.

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000` and try a few experiments.

## ☁️ Deploy to Vercel

1. Create a new project on **Vercel** and point it to this repo.
2. In **Project → Settings → Environment Variables**, add the same env vars as in `.env.local`.
3. Deploy with the default **Next.js** preset (build command `next build`).
4. After deploy:
   - Run a few experiments to verify AI providers and cost metadata.
   - Hit the rate limit intentionally (spam Run) to see the 429 handling.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI Core**: Vercel AI SDK
- **Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod
- **State & Data**: React hooks + SWR-style patterns
- **Internationalization**: next-intl (EN / VI)
- **Storage (optional)**: Redis for cache, rate limit, and budget across instances

## 🤝 Contributing

Contributions are welcome! You can:

- Add new experiment modules (following the existing `schema` / `prompt` / `handler` pattern).
- Improve UI/UX or documentation.
- Enhance safety, caching, or observability patterns.

Feel free to open issues or pull requests.

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
