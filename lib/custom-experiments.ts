// Custom Experiment Manager
const CUSTOM_EXPERIMENTS_KEY = 'ai-lab-custom-experiments';

export interface CustomExperiment {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  inputFields: {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select';
    placeholder?: string;
    options?: { value: string; label: string }[]; // For select type
    required?: boolean;
  }[];
  createdAt: number;
  updatedAt: number;
}

export function createCustomExperiment(experiment: Omit<CustomExperiment, 'id' | 'createdAt' | 'updatedAt'>): CustomExperiment {
  const now = Date.now();
  const newExperiment: CustomExperiment = {
    ...experiment,
    id: `custom-${now}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };

  const experiments = getCustomExperiments();
  experiments.push(newExperiment);
  saveCustomExperiments(experiments);

  return newExperiment;
}

export function getCustomExperiments(): CustomExperiment[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(CUSTOM_EXPERIMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load custom experiments:', error);
    return [];
  }
}

export function getCustomExperimentById(id: string): CustomExperiment | null {
  const experiments = getCustomExperiments();
  return experiments.find(e => e.id === id) || null;
}

export function updateCustomExperiment(id: string, updates: Partial<Omit<CustomExperiment, 'id' | 'createdAt'>>): CustomExperiment | null {
  const experiments = getCustomExperiments();
  const index = experiments.findIndex(e => e.id === id);

  if (index === -1) return null;

  experiments[index] = {
    ...experiments[index],
    ...updates,
    updatedAt: Date.now(),
  };

  saveCustomExperiments(experiments);
  return experiments[index];
}

export function deleteCustomExperiment(id: string): boolean {
  const experiments = getCustomExperiments();
  const filtered = experiments.filter(e => e.id !== id);

  if (filtered.length === experiments.length) return false;

  saveCustomExperiments(filtered);
  return true;
}

function saveCustomExperiments(experiments: CustomExperiment[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CUSTOM_EXPERIMENTS_KEY, JSON.stringify(experiments));
  } catch (error) {
    console.error('Failed to save custom experiments:', error);
  }
}

// Generate the final prompt for AI call
export function generateCustomPrompt(
  experiment: CustomExperiment,
  input: Record<string, string>
): { systemPrompt: string; userPrompt: string } {
  let userPrompt = experiment.userPromptTemplate;

  // Replace template variables like {{fieldName}} with actual values
  experiment.inputFields.forEach(field => {
    const value = input[field.name] || '';
    userPrompt = userPrompt.replace(new RegExp(`{{${field.name}}}`, 'g'), value);
  });

  return {
    systemPrompt: experiment.systemPrompt,
    userPrompt,
  };
}
