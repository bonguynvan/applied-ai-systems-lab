'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Shield, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getUserSettings, saveUserSettings, UserSettings } from '@/lib/settings';

export const SettingsModal = memo(function SettingsModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState<UserSettings>({});
    const [isSaved, setIsSaved] = useState(false);
    const t = useTranslations('SettingsModal');

    // Load settings on open
    useEffect(() => {
        if (isOpen) {
            setSettings(getUserSettings());
            setIsSaved(false);
        }
    }, [isOpen]);

    const handleSave = useCallback(() => {
        saveUserSettings(settings);
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            setIsOpen(false);
        }, 1500);
    }, [settings]);

    const handleChange = (provider: keyof UserSettings, value: string) => {
        setSettings(prev => ({ ...prev, [provider]: value }));
        setIsSaved(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-accent transition-colors">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">{t('title')}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-accent" />
                        {t('title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex items-start gap-3 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                        <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {t('privacyNote')}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Key className="h-3.5 w-3.5" /> OpenAI API Key
                            </label>
                            <Input
                                type="password"
                                placeholder="sk-..."
                                value={settings.openaiKey || ''}
                                onChange={e => handleChange('openaiKey', e.target.value)}
                                className="bg-muted/30 border-border/50 focus:border-accent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Key className="h-3.5 w-3.5" /> Anthropic API Key
                            </label>
                            <Input
                                type="password"
                                placeholder="sk-ant-..."
                                value={settings.anthropicKey || ''}
                                onChange={e => handleChange('anthropicKey', e.target.value)}
                                className="bg-muted/30 border-border/50 focus:border-accent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Key className="h-3.5 w-3.5" /> Gemini API Key
                            </label>
                            <Input
                                type="password"
                                placeholder="AIza..."
                                value={settings.geminiKey || ''}
                                onChange={e => handleChange('geminiKey', e.target.value)}
                                className="bg-muted/30 border-border/50 focus:border-accent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Key className="h-3.5 w-3.5" /> Groq API Key
                            </label>
                            <Input
                                type="password"
                                placeholder="gsk_..."
                                value={settings.groqKey || ''}
                                onChange={e => handleChange('groqKey', e.target.value)}
                                className="bg-muted/30 border-border/50 focus:border-accent"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between items-center gap-4">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {isSaved ? (
                            <span className="text-green-500 flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                                <CheckCircle2 className="h-3 w-3" /> {t('saved')}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {t('localOnly')}
                            </span>
                        )}
                    </div>
                    <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 text-white min-w-[100px]">
                        {t('saveAction')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
