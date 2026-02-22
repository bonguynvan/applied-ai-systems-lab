'use client';

import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from 'next-intl';
import { calculateCost, getModelConfig } from '@/lib/config/models';
import { estimateTokens } from '@/lib/utils/hash';
import { Info, AlertTriangle } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface CostEstimatorProps {
    input: string;
    model: string;
    limit: number;
}

export function CostEstimator({ input, model, limit }: CostEstimatorProps) {
    const t = useTranslations('ExperimentForm.costEstimator');

    const stats = useMemo(() => {
        const inputTokens = estimateTokens(input);
        // Assume worst-case for output tokens (max capable by model or limit)
        // For estimation, we'll use a standard buffer like 1000 tokens or the model's max output if lower
        const estimatedOutputTokens = 1000;

        try {
            // Calculate cost
            const cost = calculateCost(model, inputTokens, estimatedOutputTokens);
            const percentage = Math.min((cost / limit) * 100, 100);

            return {
                inputTokens,
                cost,
                percentage,
                isOverLimit: cost > limit,
                error: null
            };
        } catch (error) {
            return {
                inputTokens,
                cost: 0,
                percentage: 0,
                isOverLimit: false,
                error: error instanceof Error ? error.message : 'Unknown calculation error'
            };
        }
    }, [input, model, limit]);

    if (stats.error) {
        return (
            <div className="p-4 bg-muted/30 rounded-lg border border-border border-dashed">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span>{t('errorCalculation')}</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-3 h-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-[10px]">{stats.error}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        );
    }

    const getStatusColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-destructive';
        if (percentage >= 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{t('title')}</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="w-[200px] text-xs">
                                    {t('tooltip', { limit: limit.toFixed(2) })}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <span className={`font-mono font-medium ${stats.isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                    ${stats.cost.toFixed(4)} / ${limit.toFixed(2)}
                </span>
            </div>

            <Progress
                value={stats.percentage}
                className="h-2"
                indicatorClassName={getStatusColor(stats.percentage)}
            />

            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('tokens', { count: stats.inputTokens })}</span>
                <span>{model}</span>
            </div>

            {stats.isOverLimit && (
                <p className="text-xs text-destructive font-medium mt-1">
                    {t('overLimit')}
                </p>
            )}
        </div>
    );
}
