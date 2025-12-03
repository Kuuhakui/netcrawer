import { ConsoleUI } from '../ui/ConsoleUI';
import chalk from 'chalk';

export interface IGameSettings {
  typingSpeed: number;
  textSpeedName: string;
  enableAnimations: boolean;
  themeColor: string;
}

export class SettingsManager {
  private static config: IGameSettings = {
    typingSpeed: 25,
    textSpeedName: 'Нормально',
    enableAnimations: true,
    themeColor: 'green'
  };

  static get speed(): number { return this.config.typingSpeed; }
  static get isAnimEnabled(): boolean { return this.config.enableAnimations; }
  static get color(): string { return this.config.themeColor; }

  static async openSettingsMenu() {
    let inSettings = true;
    
    while (inSettings) {
      console.clear();
      console.log(chalk.yellow('=== НАСТРОЙКИ ТЕРМИНАЛА ==='));
      
      const speedStr = `${this.config.textSpeedName} (${this.config.typingSpeed}мс)`;
      const animStr = this.config.enableAnimations ? chalk.green('ВКЛ') : chalk.red('ВЫКЛ');
      
      // ИСПРАВЛЕНИЕ 1: Используем (chalk as any), чтобы TypeScript не ругался на динамический ключ
      const colorFunc = (chalk as any)[this.config.themeColor]; 
      const colorStr = colorFunc(this.config.themeColor.toUpperCase());

      const choice = await ConsoleUI.menu('Выберите параметр для изменения', [
        `Скорость печати [ Текущая: ${speedStr} ]`,
        `Анимации взлома [ Текущие: ${animStr} ]`,
        `Цвет интерфейса [ Текущий: ${colorStr} ]`,
        'Вернуться в меню'
      ]);

      switch (choice) {
        case '1':
          await this.changeTypingSpeed();
          break;
        case '2':
          this.config.enableAnimations = !this.config.enableAnimations;
          break;
        case '3':
          await this.changeColor();
          break;
        case '4':
          inSettings = false;
          break;
      }
    }
  }

  private static async changeTypingSpeed() {
    const choice = await ConsoleUI.selection('Выберите скорость вывода текста:', [
      'Мгновенно (0 мс) - Для спидраннеров',
      'Быстро (10 мс) - Оптимально',
      'Нормально (30 мс) - Кинематографично',
      'Медленно (60 мс) - Ретро модем',
    ]);

    if (choice.includes('Мгновенно')) {
      this.config.typingSpeed = 0;
      this.config.textSpeedName = 'Мгновенно';
    } else if (choice.includes('Быстро')) {
      this.config.typingSpeed = 10;
      this.config.textSpeedName = 'Быстро';
    } else if (choice.includes('Нормально')) {
      this.config.typingSpeed = 30;
      this.config.textSpeedName = 'Нормально';
    } else if (choice.includes('Медленно')) {
      this.config.typingSpeed = 60;
      this.config.textSpeedName = 'Медленно';
    }
  }

  private static async changeColor() {
     const colors = ['green', 'cyan', 'white', 'yellow', 'magenta', 'red'];
     const choice = await ConsoleUI.selection('Выберите цвет подсветки:', colors.map(c => `[ ${c.toUpperCase()} ]`));
     
     const selected = choice.replace('[ ', '').replace(' ]', '').toLowerCase();
     this.config.themeColor = selected;
  }
}