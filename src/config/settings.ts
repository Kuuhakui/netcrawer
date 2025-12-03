import path from 'path';

export const SETTINGS_FILE = path.join(process.cwd(), 'netcrawler.settings.json');
export const SAVE_FILE = path.join(process.cwd(), 'networks.json');

// Добавляем 'gray' в список
export type ChalkColor = 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'red' | 'gray';

export interface GameSettings {
    typingSpeed: number;
    textColor: ChalkColor;
}

export const defaultSettings: GameSettings = {
    typingSpeed: 25,
    textColor: 'cyan',
};