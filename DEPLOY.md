# Deploy Guide - AI Systems Lab

## Quick Deploy to Vercel (Recommended)

### 1. Prerequisites
- GitHub account
- Vercel account (free tier works)
- API keys: OpenAI, Anthropic, Groq (at least one)

### 2. Prepare for Deploy

```bash
# Build locally to verify
npm run build

# Should complete without errors
```

### 3. Deploy Steps

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

**Option B: GitHub + Vercel Integration (Recommended)**
1. Push code to GitHub repo
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repo
5. Add Environment Variables:
   ```
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   GROQ_API_KEY=gsk_...
   ```
6. Click Deploy

### 4. Environment Variables Required

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | Postgres connection string (e.g. Neon). Run `npx tsx scripts/migrate.ts` after first deploy. |
| `OPENAI_API_KEY` | At least one | OpenAI API access |
| `ANTHROPIC_API_KEY` | At least one | Claude API access |
| `GROQ_API_KEY` | At least one | Groq API access |
| `GOOGLE_GENERATIVE_AI_API_KEY` | At least one | Gemini API access |

**Note:** At least one AI provider key must be configured. Copy `.env.example` to `.env.local` for reference.

## Docker Deploy (Self-hosted)

```bash
# Build image
docker build -t ai-lab .

# Run container (set DATABASE_URL and at least one AI key)
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e OPENAI_API_KEY=sk-... \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  ai-lab
```

## Post-Deploy Checklist

- [ ] AI Status Indicator shows "Connected"
- [ ] Test each experiment (Vietnamese, Code, SQL)
- [ ] Verify cost tracking works
- [ ] Test share links
- [ ] Check QR code generation

## Cost Warning ⚠️

- Each AI request costs $0.002-$0.01
- Rate limiting: 5 requests/minute per IP
- Daily budget: $5.00 (configurable in `lib/ai/orchestrator.ts`)
- Consider adding authentication for production

## Custom Domain (Optional)

1. In Vercel dashboard → Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Node.js version (needs 18+) |
| AI not connected | Verify API keys in env vars |
| 429 errors | Rate limit hit, wait 1 minute |
| DB/analytics errors | Set `DATABASE_URL` and run `npx tsx scripts/migrate.ts` |

## Optional: Redis (Upstash) for scale

For multiple instances or serverless workers, set:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Then rate limit, cache, and daily budget use Redis instead of in-memory. Free tier at [upstash.com](https://upstash.com) is enough for solo use.

## Security Notes

- API keys are server-side only (in Server Actions)
- Rate limiting protects against abuse
- Input validation prevents injection
- Share links encode data in URL (no server storage)
