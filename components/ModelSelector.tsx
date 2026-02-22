'use client';

import { useTranslations } from 'next-intl';
import { MODEL_CONFIGS } from '@/lib/config/models';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ModelSelectorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
    const t = useTranslations('ExperimentForm.modelSelector');

    // Group models by provider
    const models = Object.entries(MODEL_CONFIGS).reduce((acc, [id, config]) => {
        const provider = config.provider;
        if (!acc[provider]) acc[provider] = [];
        acc[provider].push({ id, ...config });
        return acc;
    }, {} as Record<string, (typeof MODEL_CONFIGS[string] & { id: string })[]>);

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
                {t('label')}
            </label>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('placeholder')} />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(models).map(([provider, providerModels]) => (
                        <div key={provider}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                                {provider}
                            </div>
                            {providerModels.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                    {model.id}
                                </SelectItem>
                            ))}
                        </div>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
                {t('help')}
            </p>
        </div>
    );
}
