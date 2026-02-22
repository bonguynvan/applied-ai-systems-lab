import { Link } from '@/i18n/navigation';
import { Metadata, Viewport } from 'next';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const metadata: Metadata = {
  title: 'System Architecture',
  description: 'Architecture documentation for the Applied AI Systems Lab',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function ArchitecturePage() {
  const t = useTranslations('ArchitecturePage');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex justify-between items-start">
            <div>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block"
              >
                {t('backHome')}
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                {t('title')}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                {t('description')}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Request Lifecycle */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t('requestLifecycle.title')}
          </h2>
          <div className="bg-card border border-border rounded-lg p-6 font-mono text-sm">
            <div className="space-y-2 text-muted-foreground">
              <div>
                <span className="text-accent">→</span> {t('requestLifecycle.steps.clientSubmit')}
              </div>
              <div className="ml-4">
                <span className="text-accent">→</span> {t('requestLifecycle.steps.validateInput')}
              </div>
              <div className="ml-8">
                <span className="text-accent">→</span> {t('requestLifecycle.steps.hashInput')}
              </div>
              <div className="ml-12">
                <span className="text-accent">→</span> {t('requestLifecycle.steps.checkCache')}
              </div>
              <div className="ml-16">
                <span className="text-accent">✓</span>{' '}
                <span className="text-accent">{t('requestLifecycle.steps.hit').split(':')[0]}:</span> {t('requestLifecycle.steps.hit').split(':')[1]}
              </div>
              <div className="ml-16">
                <span className="text-accent">✗</span>{' '}
                <span className="text-accent">{t('requestLifecycle.steps.miss').split(':')[0]}:</span> {t('requestLifecycle.steps.miss').split(':')[1]}
              </div>
              <div className="ml-12">
                <span className="text-accent">→</span> {t('requestLifecycle.steps.generatePrompt')}
              </div>
              <div className="ml-16">
                <span className="text-accent">→</span> {t('requestLifecycle.steps.callAi')}
              </div>
              <div className="ml-20">
                <span className="text-accent">→</span> {t('requestLifecycle.steps.estimateTokens')}
              </div>
              <div className="ml-20">
                <span className="text-accent">→</span> {t('requestLifecycle.steps.attemptApi')}
              </div>
              <div className="ml-20">
                <span className="text-accent">→</span> {t('requestLifecycle.steps.parseResponse')}
              </div>
              <div className="ml-16">
                <span className="text-accent">→</span> {t('requestLifecycle.steps.cacheResult')}
              </div>
              <div className="ml-12">
                <span className="text-accent">→</span> {t('requestLifecycle.steps.logEvent')}
              </div>
              <div className="ml-8">
                <span className="text-accent">→</span> {t('requestLifecycle.steps.returnResponse')}
              </div>
              <div className="ml-4">
                <span className="text-accent">→</span> {t('requestLifecycle.steps.displayResult')}
              </div>
            </div>
          </div>
        </section>

        {/* Architecture Layers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t('layers.title')}
          </h2>

          <div className="space-y-4">
            {/* Presentation Layer */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t('layers.presentation.title')}
              </h3>
              <p className="text-muted-foreground mb-3">
                {t('layers.presentation.description')}
              </p>
              <div className="font-mono text-xs space-y-1 text-muted-foreground bg-secondary/50 p-3 rounded">
                <div>
                  <span className="text-accent">components/</span>
                </div>
                <div className="ml-4">
                  <span className="text-foreground">ExperimentForm.tsx</span>{' '}
                  - {t('layers.presentation.form')}
                </div>
                <div className="ml-4">
                  <span className="text-foreground">ResultDisplay.tsx</span> -
                  {t('layers.presentation.display')}
                </div>
                <div className="ml-4">
                  <span className="text-foreground">ExperimentPage.tsx</span> -
                  {t('layers.presentation.page')}
                </div>
              </div>
            </div>

            {/* API Layer */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t('layers.api.title')}
              </h3>
              <p className="text-muted-foreground mb-3">
                {t('layers.api.description')}
              </p>
              <div className="font-mono text-xs space-y-1 text-muted-foreground bg-secondary/50 p-3 rounded">
                <div>
                  <span className="text-accent">app/api/experiments/[slug]/route.ts</span>
                </div>
                <div className="ml-4">
                  <span className="text-foreground">→ {t('layers.api.validate')}</span>
                </div>
                <div className="ml-4">
                  <span className="text-foreground">→ {t('layers.api.checkCache')}</span>
                </div>
                <div className="ml-4">
                  <span className="text-foreground">→ {t('layers.api.callOrchestrator')}</span>
                </div>
                <div className="ml-4">
                  <span className="text-foreground">→ {t('layers.api.logMetrics')}</span>
                </div>
              </div>
            </div>

            {/* Core Services */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t('layers.core.title')}
              </h3>
              <p className="text-muted-foreground mb-3">
                {t('layers.core.description')}
              </p>
              <div className="font-mono text-xs space-y-2 text-muted-foreground bg-secondary/50 p-3 rounded">
                <div>
                  <span className="text-accent">{t('layers.core.orchestrator.title')}</span>
                  <span className="ml-2 text-foreground">
                    (lib/ai/orchestrator.ts)
                  </span>
                </div>
                <div className="ml-4 text-foreground">
                  • {t('layers.core.orchestrator.provider')}
                </div>
                <div className="ml-4 text-foreground">
                  • {t('layers.core.orchestrator.retry')}
                </div>
                <div className="ml-4 text-foreground">
                  • {t('layers.core.orchestrator.cost')}
                </div>

                <div className="mt-2">
                  <span className="text-accent">{t('layers.core.cache.title')}</span>
                  <span className="ml-2 text-foreground">
                    (lib/cache/manager.ts)
                  </span>
                </div>
                <div className="ml-4 text-foreground">
                  • {t('layers.core.cache.hash')}
                </div>
                <div className="ml-4 text-foreground">
                  • {t('layers.core.cache.ttl')}
                </div>

                <div className="mt-2">
                  <span className="text-accent">{t('layers.core.logger.title')}</span>
                  <span className="ml-2 text-foreground">
                    (lib/observability/logger.ts)
                  </span>
                </div>
                <div className="ml-4 text-foreground">
                  • {t('layers.core.logger.structured')}
                </div>
                <div className="ml-4 text-foreground">
                  • {t('layers.core.logger.metrics')}
                </div>
              </div>
            </div>

            {/* Experiment System */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t('layers.experiment.title')}
              </h3>
              <p className="text-muted-foreground mb-3">
                {t('layers.experiment.description')}
              </p>
              <div className="font-mono text-xs space-y-1 text-muted-foreground bg-secondary/50 p-3 rounded">
                <div>
                  <span className="text-accent">server/experiments/</span>
                </div>
                <div className="ml-4">
                  <span className="text-foreground">schema.ts</span> - {t('layers.experiment.schema')}
                </div>
                <div className="ml-4">
                  <span className="text-foreground">prompt.ts</span> - {t('layers.experiment.prompt')}
                </div>
                <div className="ml-4">
                  <span className="text-foreground">handler.ts</span> - {t('layers.experiment.handler')}
                </div>
                <div className="ml-4">
                  <span className="text-foreground">index.ts</span> - {t('layers.experiment.module')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Flow */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t('dataFlow.title')}
          </h2>
          <div className="bg-card border border-border rounded-lg p-8 font-sans">
            <div className="flex flex-col items-center space-y-4 max-w-4xl mx-auto">

              {/* Client Layer */}
              <div className="w-full bg-secondary/50 border border-border p-4 rounded-xl text-center">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-bold">Presentation Layer</div>
                <div className="font-semibold text-foreground">Client (Next.js React)</div>
                <div className="text-xs text-muted-foreground mt-1">ExperimentForm → Submit → ExperimentPage State</div>
              </div>

              <div className="h-8 w-px bg-border flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
              </div>

              {/* API Layer */}
              <div className="w-full bg-secondary border border-border p-4 rounded-xl text-center relative group hover:border-accent/50 transition-colors">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-bold">API Layer</div>
                <div className="font-semibold text-foreground">POST /api/experiments/[slug]</div>
                <div className="text-xs text-muted-foreground mt-1 flex justify-center gap-4">
                  <span>• Zod Validation</span>
                  <span>• Input Hashing</span>
                </div>
              </div>

              {/* Cache Split */}
              <div className="w-full grid grid-cols-2 gap-8 relative items-start">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 w-px bg-border"></div>

                <div className="mt-8 bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center">
                  <div className="text-xs font-bold text-green-500 uppercase mb-1">Cache Hit</div>
                  <div className="text-xs text-muted-foreground">Return Cached Result</div>
                </div>

                <div className="mt-8 bg-sky-500/10 border border-sky-500/20 p-4 rounded-xl text-center">
                  <div className="text-xs font-bold text-sky-500 uppercase mb-1">Cache Miss</div>
                  <div className="text-xs text-muted-foreground">Proceed to AI Call</div>
                </div>
              </div>

              <div className="h-8 w-px bg-border"></div>

              {/* AI Layer */}
              <div className="w-full bg-secondary/80 border border-border p-5 rounded-xl text-center">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-bold">Intelligence Layer</div>
                <div className="font-semibold text-foreground">AI Orchestrator & Experiment Handler</div>
                <div className="text-xs text-muted-foreground mt-2 grid grid-cols-2 gap-2 text-left bg-background/50 p-3 rounded-lg">
                  <div>• Dynamic Prompt Generation</div>
                  <div>• Model Selection & API Call</div>
                  <div>• Schema-bound Output Parsing</div>
                  <div>• Cost & Token Estimation</div>
                </div>
              </div>

              <div className="h-8 w-px bg-border flex items-center">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
              </div>

              {/* Persistence Layer */}
              <div className="w-full bg-accent/10 border border-accent/30 p-5 rounded-xl text-center ring-1 ring-accent/20">
                <div className="text-xs uppercase tracking-widest text-accent mb-1 font-bold">Persistence Layer</div>
                <div className="font-semibold text-foreground flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-ping"></div>
                  Neon PostgreSQL
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex justify-center gap-4">
                  <span>• Analytics</span>
                  <span>• Feedback</span>
                  <span>• Toggles</span>
                  <span>• Iterations</span>
                </div>
              </div>

              <div className="h-8 w-px bg-border"></div>

              {/* Result */}
              <div className="w-full border-2 border-dashed border-border p-4 rounded-xl text-center">
                <div className="font-bold text-foreground">Unified API Response</div>
                <div className="text-xs text-muted-foreground">Result + Full Metadata + Persistence Confirmation</div>
              </div>

            </div>
          </div>
        </section>

        {/* Type System */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t('typeSafety.title')}
          </h2>
          <p className="text-muted-foreground mb-4">
            {t('typeSafety.description')}
          </p>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  {t('typeSafety.input.title')}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('typeSafety.input.description')}
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                  <li>• {t('typeSafety.input.required')}</li>
                  <li>• {t('typeSafety.input.type')}</li>
                  <li>• {t('typeSafety.input.length')}</li>
                  <li>• {t('typeSafety.input.custom')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  {t('typeSafety.output.title')}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('typeSafety.output.description')}
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                  <li>• {t('typeSafety.output.structure')}</li>
                  <li>• {t('typeSafety.output.enum')}</li>
                  <li>• {t('typeSafety.output.shapes')}</li>
                  <li>• {t('typeSafety.output.coercion')}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Extensibility */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t('extensibility.title')}
          </h2>
          <p className="text-muted-foreground mb-4">
            {t('extensibility.description')}
          </p>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="bg-card border border-border rounded-lg p-4 font-mono">
              <div className="text-foreground mb-2">1. {t('extensibility.steps.1')}</div>
              <div className="ml-4 text-xs opacity-80">
                {t('extensibility.steps.1_desc')}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 font-mono">
              <div className="text-foreground mb-2">
                2. {t('extensibility.steps.2')}
              </div>
              <div className="ml-4 text-xs opacity-80">{t('extensibility.steps.2_desc')}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 font-mono">
              <div className="text-foreground mb-2">
                3. {t('extensibility.steps.3')}
              </div>
              <div className="ml-4 text-xs opacity-80">{t('extensibility.steps.3_desc')}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 font-mono">
              <div className="text-foreground mb-2">
                4. {t('extensibility.steps.4')}
              </div>
              <div className="ml-4 text-xs opacity-80">
                {t('extensibility.steps.4_desc')}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 font-mono">
              <div className="text-foreground mb-2">
                5. {t('extensibility.steps.5')}
              </div>
              <div className="ml-4 text-xs opacity-80">{t('extensibility.steps.5_desc')}</div>
            </div>
          </div>
        </section>

        {/* Performance */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t('performance.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">{t('performance.caching.title')}</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• {t('performance.caching.ttl')}</li>
                <li>• {t('performance.caching.keys')}</li>
                <li>• {t('performance.caching.expiration')}</li>
                <li>• {t('performance.caching.memory')}</li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">{t('performance.resilience.title')}</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• {t('performance.resilience.retry')}</li>
                <li>• {t('performance.resilience.timeout')}</li>
                <li>• {t('performance.resilience.handling')}</li>
                <li>• {t('performance.resilience.logging')}</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Applied AI Systems Lab • Production-ready AI orchestration
          </p>
        </div>
      </footer>
    </div>
  );
}
