import { notFound } from 'next/navigation';
import { getExperimentBySlug } from '@/config/experiments';
import ExperimentPage from '@/components/ExperimentPage';
import { getTranslations } from 'next-intl/server';

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams?: Promise<{ repro?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const experiment = getExperimentBySlug(slug);
  const t = await getTranslations('Experiments');

  if (!experiment) {
    return {
      title: 'Demo Not Found',
    };
  }

  return {
    title: t(`${slug}.name`),
    description: t(`${slug}.description`),
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const search = searchParams ? await searchParams : undefined;
  const reproEncoded = search?.repro;

  const experiment = getExperimentBySlug(slug);

  if (!experiment) {
    notFound();
  }

  // Only pass serializable metadata to client component
  const experimentMeta = {
    slug: experiment.metadata.slug,
    name: experiment.metadata.name,
    description: experiment.metadata.description,
    costWeight: experiment.metadata.costWeight,
    promptVersion: experiment.metadata.promptVersion,
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <ExperimentPage experiment={experimentMeta} reproEncoded={reproEncoded} />
      </div>
    </div>
  );
}
