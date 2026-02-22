'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, X, Sparkles, Lightbulb, BookOpen, Zap, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UserGuideSection {
  icon: any;
  heading: string;
  content: string;
}

interface UserGuideContent {
  title: string;
  sections: UserGuideSection[];
}

interface UserGuideProps {
  variant?: 'home' | 'experiment';
  experimentSlug?: string;
}

const ICON_MAP = {
  Info,
  Zap,
  BookOpen,
  Lightbulb,
  Sparkles,
};

export function UserGuide({ variant = 'home', experimentSlug }: UserGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('UserGuide');

  // ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const getGuideContent = (): UserGuideContent => {
    if (variant === 'home' || !experimentSlug) {
      return {
        title: t('home.title'),
        sections: [
          { icon: Info, heading: t('home.sections.what.heading'), content: t('home.sections.what.content') },
          { icon: Zap, heading: t('home.sections.quickStart.heading'), content: t('home.sections.quickStart.content') },
          { icon: BookOpen, heading: t('home.sections.whatYouGet.heading'), content: t('home.sections.whatYouGet.content') },
          { icon: Lightbulb, heading: t('home.sections.explained.heading'), content: t('home.sections.explained.content') },
          { icon: Sparkles, heading: t('home.sections.tips.heading'), content: t('home.sections.tips.content') },
        ],
      };
    }

    if (experimentSlug) {
      // Normalize slug to match translation keys
      const normalizedSlug = experimentSlug;
      const sectionKeys = {
        'vietnamese-text': ['what', 'how', 'examples', 'cost'],
        'code-insight': ['what', 'how', 'bestPractices', 'cost'],
        'sql-generator': ['what', 'how', 'examples', 'schema'],
        'data-extractor': ['what', 'how', 'bestPractices'],
        'model-arena': ['what', 'how', 'useCases'],
        'intent-classifier': ['what', 'how'],
        'robustness-tester': ['what', 'how'],
        'cot-reasoning': ['what', 'how'],
      };

      const keys = sectionKeys[normalizedSlug as keyof typeof sectionKeys] || [];
      const icons = [Info, Zap, Lightbulb, BookOpen];

      try {
        // Double check existence of keys before calling t()
        const title = t.raw(`experiments.${normalizedSlug}.title`) ? t(`experiments.${normalizedSlug}.title`) : t('home.title');

        return {
          title,
          sections: keys.map((key, i) => ({
            icon: icons[i % icons.length],
            heading: t(`experiments.${normalizedSlug}.sections.${key}.heading`),
            content: t(`experiments.${normalizedSlug}.sections.${key}.content`),
          })),
        };
      } catch (e) {
        console.warn(`Translation key missing for ${normalizedSlug}, falling back to home guide`, e);
      }
    }

    return {
      title: t('home.title'),
      sections: [],
    };
  };

  const content = getGuideContent();

  if (!isOpen) {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 bg-slate-100 text-slate-900 hover:bg-white"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        {t('trigger')}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative bg-background/95 backdrop-blur-xl rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{content.title}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {content.sections.map((section, i) => {
            const IconComponent = section.icon;
            return (
              <div
                key={i}
                className="bg-muted/30 rounded-lg p-4 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">{section.heading}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/50">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              {t('footer.tip')}
            </p>
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-slate-100 text-slate-900 hover:bg-white font-medium"
            >
              {t('footer.close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
