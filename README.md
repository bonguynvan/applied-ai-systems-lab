# 🧪 Applied AI Systems Lab

**The Developer's Sandbox for Practical AI Integration Patterns.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-Latest-blue)](https://sdk.vercel.ai/)

Applied AI Systems Lab is a robust, production-ready framework designed for developers who want to integrate AI into their applications correctly. It focuses on the "missing middle" of AI development: **Cost Tracking, Observability, Smart Caching, and Type-Safe Orchestration.**

## ✨ Features

- **Multi-Provider Orchestrator**: Single API for OpenAI, Anthropic, Gemini, and Groq with automatic retry logic.
- **BYOK (Bring Your Own Key)**: Users can use their own primary API keys stored securely in `localStorage`.
- **Intelligent Caching**: SHA-256 based input hashing with configurable TTL to minimize costs and latency.
- **Cost & Token Tracking**: Real-time token estimation and cost calculation for every request.
- **Type Safety**: End-to-end TypeScript and Zod validation for all inputs and outputs.
- **Modular Experiments**: Easily add new AI patterns (Intent Classification, CoT Reasoning, Robustness Testing) as self-contained modules.

## 🚀 Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/applied-ai-systems-lab.git
   cd applied-ai-systems-lab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file:
   ```env
   OPENAI_API_KEY=your_key
   ANTHROPIC_API_KEY=your_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_key
   GROQ_API_KEY=your_key
   DATABASE_URL=your_postgres_url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI Core**: Vercel AI SDK
- **Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod
- **Database**: PostgreSQL (Prisma/Neon ready)
- **Internationalization**: next-intl (EN/VI support)

## 📈 How to Make This Viral?

1. **Deploy a Live Demo**: Use Vercel + Neon (free tiers) and enable **BYOK** so people can test with their own keys.
2. **Featured Modules**: High-impact demos like "Model Arena" or "Multi-step CoT" solve real pain points for AI engineers.
3. **Showcase Patterns**: Don't just show "What it does", show **"How it handles production issues"** (e.g., retries, errors).
4. **Visuals**: Add clean screenshots and Mermaid diagrams to the README.

## 🤝 Contributing

Contributions are welcome! Whether it's a new experiment module, a bug fix, or documentation improvement.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
