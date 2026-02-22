import { Link } from '@/i18n/navigation';
import { Metadata, Viewport } from 'next';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const metadata: Metadata = {
  title: 'Nguyen Van Bo | Frontend / Full-stack Engineer',
  description:
    'Frontend / Full-stack Engineer with 6+ years experience in Fintech, SaaS, and Enterprise. Systems thinker, technical leader.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const projectKeys = ['vnlocals', 'vnmarketinsights', 'mystar', 'theorientoracle'] as const;
const experimentKeys = ['vietnamese-text', 'code-insight', 'sql-generator'] as const;
const guideKeys = ['clarity', 'culture', 'tradeoffs', 'ai'] as const;
const workKeys = ['product', 'ambiguity', 'complex', 'stakeholders', 'ownership', 'ai'] as const;

// Icons mapping for experiments since we can't store JSX in JSON
const experimentIcons: Record<string, string> = {
  'vietnamese-text': '🧠',
  'code-insight': '💻',
  'sql-generator': '🗄️',
};

// URLs for projects
const projectUrls: Record<string, string> = {
  vnlocals: 'https://vnlocals.com',
  vnmarketinsights: 'https://vnmarketinsights.com',
  mystar: 'https://mystar.vn',
  theorientoracle: 'https://theorientoracle.com',
};

export default function PortfolioPage() {
  const t = useTranslations('PortfolioPage');

  // Helper to ensure array access
  const getList = (key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (t.raw(key) as any) as string[];
  };

  const techStack = {
    frontend: ['React (Hooks, Context)', 'Vue 3 Composition API', 'TypeScript', 'Tailwind CSS', 'Storybook'],
    apis: ['REST APIs', 'GraphQL', 'WebSocket', 'Server-Sent Events', 'Apollo Client'],
    data: ['Google Analytics 4', 'Mixpanel', 'Amplitude', 'Sentry', 'Custom Event Logging'],
    cloud: ['AWS (Lambda, S3, CloudFront)', 'Docker', 'GitHub Actions', 'Terraform'],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-sm font-medium text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-2"
          >
            {t('nav.back')}
          </Link>
          <LanguageSwitcher />
        </div>
      </nav>

      {/* Hero Section */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-accent mb-4 uppercase tracking-wide">
              {t('hero.role')}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed whitespace-pre-line">
              {t('hero.description')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="#work">
                <Button size="lg" className="gap-2">
                  {t('hero.viewWork')}
                </Button>
              </Link>
              <Link href="#philosophy">
                <Button variant="outline" size="lg" className="gap-2">
                  {t('hero.howIThink')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Philosophy Section */}
        <section id="philosophy" className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-secondary">
              <span className="text-lg">💭</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t('philosophy.title')}</h2>
          </div>

          <div className="bg-card rounded-lg border border-border p-8 mb-8">
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t('philosophy.intro1')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('philosophy.intro2')}
            </p>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-4">{t('philosophy.guidesTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guideKeys.map((key) => (
              <div key={key} className="p-4 rounded-lg border border-border bg-secondary/50">
                <h4 className="font-semibold text-foreground mb-2">{t(`philosophy.guides.${key}.title`)}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`philosophy.guides.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Selected Work Section */}
        <section id="work" className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-secondary">
              <span className="text-lg">💼</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t('work.title')}</h2>
          </div>

          <div className="space-y-8">
            {projectKeys.map((key) => (
              <article
                key={key}
                className="group bg-card rounded-lg border border-border p-8 hover:border-accent/40 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <a
                        href={projectUrls[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-bold text-foreground group-hover:text-accent transition-colors hover:underline"
                      >
                        {t(`work.projects.${key}.title`)}
                      </a>
                      <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                        {t(`work.projects.${key}.role`)}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      {t(`work.projects.${key}.context`)}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                          {t('work.labels.problem')}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{t(`work.projects.${key}.problem`)}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                          {t('work.labels.constraints')}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{t(`work.projects.${key}.constraints`)}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                          {t('work.labels.decisions')}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{t(`work.projects.${key}.decisions`)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                        {t('work.labels.impact')}
                      </h4>
                      <ul className="space-y-1">
                        {getList(`work.projects.${key}.impact`).map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="text-accent">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {getList(`work.projects.${key}.tags`).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="text-muted-foreground">•</span>
                      <a
                        href={projectUrls[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent hover:underline"
                      >
                        {t('work.labels.visit')}
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* AI Lab Section */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-secondary">
              <span className="text-lg">🤖</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t('aiLab.title')}</h2>
          </div>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            {t('aiLab.description')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {experimentKeys.map((slug) => (
              <Link key={slug} href={`/experiments/${slug}`}>
                <div className="group bg-card rounded-lg border border-border p-6 hover:border-accent/40 transition-all cursor-pointer h-full">
                  <div className="text-3xl mb-4">{experimentIcons[slug]}</div>
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {t(`aiLab.experiments.${slug}.name`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`aiLab.experiments.${slug}.description`)}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="outline">{t('aiLab.viewAll')}</Button>
            </Link>
          </div>
        </section>

        {/* How I Work Section */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-secondary">
              <span className="text-lg">⚙️</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t('howIWork.title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workKeys.map((key) => (
              <div key={key} className="p-5 rounded-lg border border-border bg-secondary/30">
                <h3 className="font-semibold text-foreground mb-2">{t(`howIWork.items.${key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`howIWork.items.${key}.content`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-secondary">
              <span className="text-lg">🛠️</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t('techStack.title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="text-accent">◆</span> {t('techStack.frontend')}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {techStack.frontend.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="text-accent">◆</span> {t('techStack.apis')}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {techStack.apis.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="text-accent">◆</span> {t('techStack.data')}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {techStack.data.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="text-accent">◆</span> {t('techStack.cloud')}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {techStack.cloud.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            {t('techStack.disclaimer')}
          </p>
        </section>

        {/* Future Direction Section */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-secondary">
              <span className="text-lg">🚀</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t('future.title')}</h2>
          </div>

          <div className="bg-card rounded-lg border border-border p-8">
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t('future.intro')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">{t('future.team.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('future.team.description')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-3">{t('future.strategy.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('future.strategy.description')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-3">{t('future.systems.title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('future.systems.description')}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-muted-foreground leading-relaxed">
                {t('future.conclusion')}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-secondary">
              <span className="text-lg">📬</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t('contact.title')}</h2>
          </div>

          <div className="bg-card rounded-lg border border-border p-8">
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t('contact.description')}
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:bonguynvan289@email.com"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border hover:border-accent/40 transition-colors text-foreground text-sm font-medium"
              >
                <span>📧</span> Email
              </a>
              <a
                href="https://www.linkedin.com/in/bonguynvan289/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border hover:border-accent/40 transition-colors text-foreground text-sm font-medium"
              >
                <span>💼</span> LinkedIn
              </a>
              <a
                href="https://github.com/bonguynvan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border hover:border-accent/40 transition-colors text-foreground text-sm font-medium"
              >
                <span>⚙️</span> GitHub
              </a>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              {t('contact.location')}
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t('footer.role')}
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                AI Lab
              </Link>
              <Link
                href="/architecture"
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Architecture
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
