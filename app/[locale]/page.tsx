import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { getExperimentMetadata } from '@/config/experiments';
import { Metadata, Viewport } from 'next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { AIStatusIndicator } from '@/components/AIStatusIndicator';
import { UserGuide } from '@/components/UserGuide';
import { CustomExperimentBuilder } from '@/components/CustomExperimentBuilder';
import { SettingsModal } from '@/components/SettingsModal';

export const metadata: Metadata = {
  title: 'Applied AI Systems Lab',
  description:
    'Open-source AI playground for production-grade, cost-aware multi-model experiments.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function Home() {
  const t = useTranslations('HomePage');
  const tNav = useTranslations('Navigation');
  const tExperiments = useTranslations('Experiments');
  const experiments = getExperimentMetadata();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {t('title')}
            </h1>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <SettingsModal />
              <AIStatusIndicator />
            </div>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground">
            {t('description')}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        {/* Navigation Links */}
        <div className="mb-12 flex flex-wrap gap-3">
          <Link
            href="/architecture"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors text-foreground text-sm font-medium"
          >
            {tNav('architecture') + ' →'}
          </Link>
          {/* <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border hover:border-accent/40 hover:bg-secondary/80 transition-colors text-foreground text-sm font-medium"
          >
            👤 {tNav('portfolio')}
          </Link> */}
          <CustomExperimentBuilder />
        </div>

        {/* Experiments Grid */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {t('availableDemos')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experiments.map(exp => (
              <Link key={exp.slug} href={`/experiments/${exp.slug}`}>
                <div className="group relative h-full bg-card rounded-lg border border-border p-6 hover:border-accent/40 hover:bg-card/60 hover:shadow-lg transition-all cursor-pointer overflow-hidden">
                  {/* Gradient accent on hover */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                          {tExperiments(`${exp.slug}.name`)}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tExperiments(`${exp.slug}.description`)}
                        </p>
                      </div>
                      <div className="ml-4 text-muted-foreground group-hover:text-accent text-xl transition-colors flex-shrink-0">
                        →
                      </div>
                    </div>

                    {/* Metadata badges */}
                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border">
                      <span className="text-xs px-3 py-1.5 bg-secondary rounded-full text-muted-foreground font-mono text-center">
                        {exp.promptVersion}
                      </span>
                      <span className="text-xs px-3 py-1.5 bg-secondary rounded-full text-muted-foreground font-mono">
                        {exp.costWeight}x cost
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <section className="mt-16 pt-16 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {tNav('features')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'AI Integration',
                description:
                  'Single orchestrator for OpenAI, Anthropic, Gemini, Groq with automatic retry and BYOK support.',
              },
              {
                title: 'Smart Caching',
                description: 'SHA-256 hashed inputs with TTL-based caching to save costs and reduce latency.',
              },
              {
                title: 'Cost & Budget Control',
                description:
                  'Real-time token estimation, per-request cost caps, and daily budget limits for shared API keys.',
              },
              {
                title: 'Observability',
                description: 'Structured logging and metrics for every AI interaction.',
              },
              {
                title: 'Type Safety',
                description: 'End-to-end TypeScript + Zod validation for inputs and outputs.',
              },
              {
                title: 'Extensibility',
                description:
                  'Modular experiment system (Model Arena, Lottery Lab, CoT, Robustness, etc.) without touching core logic.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-secondary rounded-lg border border-border p-4"
              >
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mt-16 pt-16 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {tNav('techStack')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Frontend & Framework
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Next.js 16 (App Router)</li>
                <li>• React with TypeScript</li>
                <li>• Tailwind CSS 3</li>
                <li>• shadcn/ui Components</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Backend & AI
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Vercel AI SDK</li>
                <li>• Zod for validation</li>
                <li>• OpenAI, Anthropic, Groq, Gemini</li>
                <li>• In-memory caching, Redis-ready rate limit & budget control</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* User Guide Button */}
      <UserGuide variant="home" />

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Applied AI Systems Lab • Built with Next.js and Vercel AI SDK</p>
          <p className="mt-1">
            <a
              href="https://github.com/bonguynvan/applied-ai-systems-lab"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              GitHub
            </a>
            <span className="mx-2">•</span>
            <a
              href="mailto:hello@bodev.vn"
              className="underline underline-offset-4 hover:text-foreground"
            >
              hello@bodev.vn
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

