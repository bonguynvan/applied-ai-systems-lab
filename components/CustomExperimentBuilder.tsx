'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  CustomExperiment,
  createCustomExperiment,
  getCustomExperiments,
  deleteCustomExperiment,
} from '@/lib/custom-experiments';
import { Plus, Trash2, Wand2, Code, ChevronDown, ChevronUp, X, Sparkles } from 'lucide-react';

interface CustomExperimentBuilderProps {
  onExperimentCreated?: (experiment: CustomExperiment) => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown Select' },
] as const;

export const CustomExperimentBuilder = memo(function CustomExperimentBuilder({
  onExperimentCreated,
}: CustomExperimentBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [experiments, setExperiments] = useState<CustomExperiment[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPromptTemplate, setUserPromptTemplate] = useState('');
  const [inputFields, setInputFields] = useState<CustomExperiment['inputFields']>([
    { name: 'input', label: 'Your Input', type: 'textarea', placeholder: 'Enter your text here...', required: true },
  ]);

  const loadExperiments = useCallback(() => {
    setExperiments(getCustomExperiments());
  }, []);

  const handleOpen = useCallback(() => {
    loadExperiments();
    setIsOpen(true);
  }, [loadExperiments]);

  const handleAddField = useCallback(() => {
    setInputFields(prev => [
      ...prev,
      {
        name: `field${prev.length + 1}`,
        label: `Field ${prev.length + 1}`,
        type: 'text',
        placeholder: 'Enter value...',
        required: false,
      },
    ]);
  }, []);

  const handleRemoveField = useCallback((index: number) => {
    setInputFields(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpdateField = useCallback((index: number, updates: Partial<CustomExperiment['inputFields'][0]>) => {
    setInputFields(prev =>
      prev.map((field, i) => (i === index ? { ...field, ...updates } : field))
    );
  }, []);

  const handleCreate = useCallback(() => {
    if (!name.trim() || !systemPrompt.trim() || !userPromptTemplate.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newExperiment = createCustomExperiment({
      name: name.trim(),
      description: description.trim(),
      systemPrompt: systemPrompt.trim(),
      userPromptTemplate: userPromptTemplate.trim(),
      inputFields,
    });

    // Reset form
    setName('');
    setDescription('');
    setSystemPrompt('');
    setUserPromptTemplate('');
    setInputFields([
      { name: 'input', label: 'Your Input', type: 'textarea', placeholder: 'Enter your text here...', required: true },
    ]);
    setIsCreating(false);
    loadExperiments();

    if (onExperimentCreated) {
      onExperimentCreated(newExperiment);
    }
  }, [name, description, systemPrompt, userPromptTemplate, inputFields, loadExperiments, onExperimentCreated]);

  const handleDelete = useCallback((id: string) => {
    if (confirm('Delete this custom experiment?')) {
      deleteCustomExperiment(id);
      loadExperiments();
    }
  }, [loadExperiments]);

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

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Custom Experiments
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
      <div className="relative bg-background/95 backdrop-blur-xl rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-border/50">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Custom Experiments</h3>
              <p className="text-xs text-muted-foreground">
                Create your own AI experiments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isCreating && (
              <Button
                size="sm"
                onClick={() => setIsCreating(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isCreating ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                >
                  ← Back to List
                </Button>
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Experiment Name *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Resume Analyzer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this experiment do?"
                  />
                </div>
              </div>

              {/* Prompts */}
              <div className="space-y-3 border-t border-border pt-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    System Prompt *
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Instructions for the AI about its role and behavior
                  </p>
                  <Textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are an expert resume analyzer. Review the provided resume and provide feedback on..."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    User Prompt Template *
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Use {'{{fieldName}}'} to insert input values
                  </p>
                  <Textarea
                    value={userPromptTemplate}
                    onChange={(e) => setUserPromptTemplate(e.target.value)}
                    placeholder="Please analyze this resume:\n\n{{input}}\n\nProvide feedback on: strengths, weaknesses, and suggestions for improvement."
                    rows={4}
                  />
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-foreground">
                    Input Fields
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddField}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Field
                  </Button>
                </div>

                <div className="space-y-3">
                  {inputFields.map((field, index) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Field {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleRemoveField(index)}
                          disabled={inputFields.length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={field.name}
                          onChange={(e) => handleUpdateField(index, { name: e.target.value })}
                          placeholder="Field name (lowercase, no spaces)"
                        />
                        <Input
                          value={field.label}
                          onChange={(e) => handleUpdateField(index, { label: e.target.value })}
                          placeholder="Display label"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={field.type}
                          onChange={(e) => handleUpdateField(index, { type: e.target.value as any })}
                          className="px-3 py-2 bg-secondary border border-border rounded-md text-sm"
                        >
                          {FIELD_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        <Input
                          value={field.placeholder || ''}
                          onChange={(e) => handleUpdateField(index, { placeholder: e.target.value })}
                          placeholder="Placeholder text"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create Button */}
              <div className="pt-4 border-t border-border">
                <Button
                  onClick={handleCreate}
                  className="w-full"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Custom Experiment
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {experiments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Code className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No custom experiments yet</p>
                  <p className="text-xs mt-1">
                    Create your first custom experiment to get started
                  </p>
                </div>
              ) : (
                experiments.map((exp) => (
                  <div
                    key={exp.id}
                    className="border border-border rounded-lg bg-card overflow-hidden"
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground">{exp.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {exp.description || 'No description'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(exp.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {expandedId === exp.id ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedId === exp.id && (
                      <div className="px-4 pb-4 border-t border-border bg-muted/30">
                        <div className="pt-3 space-y-3">
                          <div>
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                              System Prompt
                            </span>
                            <pre className="text-xs text-foreground bg-secondary border border-border/50 rounded-lg p-2 mt-1 max-h-32 overflow-y-auto">
                              {exp.systemPrompt}
                            </pre>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                              User Template
                            </span>
                            <pre className="text-xs text-foreground bg-secondary border border-border/50 rounded-lg p-2 mt-1 max-h-32 overflow-y-auto">
                              {exp.userPromptTemplate}
                            </pre>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                              Input Fields ({exp.inputFields.length})
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {exp.inputFields.map((field) => (
                                <span
                                  key={field.name}
                                  className="px-2 py-1 bg-accent/10 text-accent rounded text-xs"
                                >
                                  {field.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
