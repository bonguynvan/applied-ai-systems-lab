'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
    const t = useTranslations('LanguageSwitcher');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleLanguageChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title={t('switchLanguage')}>
                    <Globe className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">{t('switchLanguage')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLanguageChange('en')} className={locale === 'en' ? 'bg-accent' : ''}>
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('vi')} className={locale === 'vi' ? 'bg-accent' : ''}>
                    Tiếng Việt
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
