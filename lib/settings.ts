// User Settings Manager - Handles personal API keys in localStorage
const SETTINGS_KEY = 'ai-lab-user-settings';

export interface UserSettings {
    openaiKey?: string;
    anthropicKey?: string;
    geminiKey?: string;
    groqKey?: string;
    preferredModel?: string;
}

export function saveUserSettings(settings: UserSettings): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}

export function updateUserSettings(updates: Partial<UserSettings>): void {
    const current = getUserSettings();
    saveUserSettings({ ...current, ...updates });
}

export function getUserSettings(): UserSettings {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Failed to load settings:', error);
        return {};
    }
}

export function clearUserSettings(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SETTINGS_KEY);
}

export function hasUserKey(provider: keyof UserSettings): boolean {
    const settings = getUserSettings();
    return !!settings[provider];
}
