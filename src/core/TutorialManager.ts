import chalk from 'chalk';
import { ConsoleUI } from '../ui/ConsoleUI';

export class TutorialManager {
  private static step = 0;
  private static isActive = false;

  static start() {
    this.isActive = true;
    this.step = 0;
  }

  static stop() {
  this.isActive = false;
}

  static isTutorialActive() {
    return this.isActive;
  }

  static async checkProgress(lastCommand: string, output: string) {
    if (!this.isActive) return;

    switch (this.step) {
      case 0:
        await ConsoleUI.print('\n[ОБУЧЕНИЕ] Добро пожаловать, Оператор.', 'cyan');
        await ConsoleUI.print('Ваша цель: найти уязвимости в сети и добыть данные.', 'gray');
        await ConsoleUI.print('ШАГ 1: Для начала нам нужно узнать, какие устройства есть рядом.', 'yellow');
        await ConsoleUI.print('>> Введите команду: scan\n', 'white');
        this.step++;
        break;

      case 1:
        if (lastCommand === 'scan') {
            await ConsoleUI.print('\n[ОБУЧЕНИЕ] Отлично! Вы видите список IP-адресов.', 'cyan');
            await ConsoleUI.print('Вам нужно подключиться к одному из них.', 'gray');
            await ConsoleUI.print('ШАГ 2: Используйте команду connect с IP адресом.', 'yellow');
            await ConsoleUI.print('>> Пример: connect 192.168.0.3\n', 'white');
            this.step++;
        }
        break;

      case 2:
        if (lastCommand.startsWith('connect') && !output.includes('Ошибка')) {
            await ConsoleUI.print('\n[ОБУЧЕНИЕ] Доступ получен!', 'cyan');
            await ConsoleUI.print('Теперь вы внутри устройства. Осмотритесь.', 'gray');
            await ConsoleUI.print('ШАГ 3: Введите ls, чтобы увидеть файлы.', 'yellow');
            this.step++;
        }
        break;
      
      case 3:
        if (lastCommand === 'ls') {
            await ConsoleUI.print('\n[ОБУЧЕНИЕ] Видите файлы с расширением .enc? Они зашифрованы.', 'cyan');
            await ConsoleUI.print('ШАГ 4: Попробуйте прочитать файл.', 'yellow');
            await ConsoleUI.print('>> Введите: cat <имя_файла>\n', 'white');
            this.step++;
        }
        break;
        
      case 4:
         if (lastCommand.startsWith('cat')) {
            await ConsoleUI.print('\n[ОБУЧЕНИЕ] Файл зашифрован. Нам нужно его взломать.', 'cyan');
            await ConsoleUI.print('ШАГ 5: Используйте decrypt <имя_файла>, чтобы запустить дешифратор.', 'yellow');
            this.step++;
         }
         break;

      case 5:
          if (lastCommand.startsWith('decrypt')) {
              await ConsoleUI.print('\n[ОБУЧЕНИЕ] Поздравляю! Вы прошли базовый курс.', 'green');
              await ConsoleUI.print('Далее вы действуете самостоятельно. Удачи.', 'cyan');
              this.isActive = false;
          }
          break;
    }
  }
}