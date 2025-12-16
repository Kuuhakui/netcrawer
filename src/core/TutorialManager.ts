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

  // Этот метод вызывается ПОСЛЕ выполнения команды
  static async checkProgress(lastCommand: string, output: string) {
    if (!this.isActive) return;

    // Сценарный поток
    switch (this.step) {
      // === ВСТУПЛЕНИЕ ===
      case 0:
        console.clear();
        await ConsoleUI.print('>>> ИНИЦИАЛИЗАЦИЯ СИМУЛЯЦИИ <<<', 'cyan');
        await new Promise(r => setTimeout(r, 1000));
        await ConsoleUI.print('\n[КУРАТОР]: Добро пожаловать, Оператор.', 'green');
        await ConsoleUI.print('[КУРАТОР]: Перед допуском к полевым операциям вы обязаны пройти курс переподготовки.', 'green');
        await ConsoleUI.print('[КУРАТОР]: Ваша задача: Обнаружить цель, проникнуть в систему и расшифровать данные.', 'green');
        
        await ConsoleUI.print('\n[ЗАДАЧА 1]: Используйте сетевой сканер для обнаружения активных хостов.', 'yellow');
        await ConsoleUI.print('Введите команду: scan', 'gray');
        this.step++;
        break;

      // === ПОСЛЕ SCAN ===
      case 1:
        if (lastCommand === 'scan') {
            await ConsoleUI.print('\n[КУРАТОР]: Отлично. Сканер обнаружил устройство TRAINING-UNIT.', 'green');
            await ConsoleUI.print('[КУРАТОР]: Обратите внимание на IP-адрес. Это уникальный идентификатор узла.', 'green');
            
            await ConsoleUI.print('\n[ЗАДАЧА 2]: Подключитесь к обнаруженному устройству.', 'yellow');
            await ConsoleUI.print('Введите команду: connect 192.168.0.10', 'gray');
            this.step++;
        }
        break;

      // === ПОСЛЕ CONNECT ===
      case 2:
        if (lastCommand.startsWith('connect') && !output.includes('Ошибка')) {
            await ConsoleUI.print('\n[КУРАТОР]: Соединение установлено. Вы находитесь внутри файловой системы цели.', 'green');
            await ConsoleUI.print('[КУРАТОР]: Нам нужно оценить, какие данные хранятся на диске.', 'green');
            
            await ConsoleUI.print('\n[ЗАДАЧА 3]: Выведите список файлов.', 'yellow');
            await ConsoleUI.print('Введите команду: ls', 'gray');
            this.step++;
        }
        break;
      
      // === ПОСЛЕ LS (ОБЪЯСНЕНИЕ ШИФРОВ) ===
      case 3:
        if (lastCommand === 'ls') {
            await ConsoleUI.print('\n[КУРАТОР]: Вижу три зашифрованных файла (.enc).', 'green');
            await ConsoleUI.print('[КУРАТОР]: Стандартные протоколы защиты. Начнем с самого простого — Шифра Цезаря.', 'green');
            await ConsoleUI.print('[ИНФО]: Шифр Цезаря просто смещает буквы алфавита. A -> C, B -> D.', 'cyan');
            
            await ConsoleUI.print('\n[ЗАДАЧА 4]: Запустите дешифратор для первого файла.', 'yellow');
            await ConsoleUI.print('Введите: decrypt lesson_1_caesar.enc', 'gray');
            this.step++;
        }
        break;
        
      // === ПОСЛЕ ЦЕЗАРЯ ===
      case 4:
         if (lastCommand.startsWith('decrypt') && lastCommand.includes('caesar')) {
            await ConsoleUI.print('\n[КУРАТОР]: Успешно. Вы визуально подобрали смещение.', 'green');
            await ConsoleUI.print('[КУРАТОР]: Следующий уровень защиты — XOR (Исключающее ИЛИ). Это битовая логика.', 'green');
            await ConsoleUI.print('[ИНФО]: Здесь нет букв, только биты. Используйте таблицу истинности, которую покажет терминал.', 'cyan');
            await ConsoleUI.print('[ИНФО]: 1 и 0 дают 1. Одинаковые цифры дают 0.', 'cyan');

            await ConsoleUI.print('\n[ЗАДАЧА 5]: Взломайте бинарный файл.', 'yellow');
            await ConsoleUI.print('Введите: decrypt lesson_2_xor.enc', 'gray');
            this.step++;
         }
         break;

      // === ПОСЛЕ XOR ===
      case 5:
          if (lastCommand.startsWith('decrypt') && lastCommand.includes('xor')) {
              await ConsoleUI.print('\n[КУРАТОР]: Впечатляет. Логические вентили пройдены.', 'green');
              await ConsoleUI.print('[КУРАТОР]: Остался самый сложный файл. Шифр Виженера.', 'green');
              await ConsoleUI.print('[ИНФО]: Он использует Ключевое Слово. Каждая буква шифруется своим сдвигом.', 'cyan');
              await ConsoleUI.print('[ИНФО]: Вам придется вручную сопоставить буквы, используя таблицу-сетку. Будьте внимательны.', 'cyan');
              
              await ConsoleUI.print('\n[ЗАДАЧА 6]: Запустите протокол Виженера.', 'yellow');
              await ConsoleUI.print('Введите: decrypt lesson_3_vigenere.enc', 'gray');
              this.step++;
          }
          break;

      // === ПОСЛЕ ВИЖЕНЕРА (СКАЧИВАНИЕ) ===
      case 6:
          if (lastCommand.startsWith('decrypt') && lastCommand.includes('vigenere')) {
              await ConsoleUI.print('\n[КУРАТОР]: Все файлы расшифрованы. Отличная работа.', 'green');
              await ConsoleUI.print('[КУРАТОР]: Последний этап — извлечение данных. Мы не оставляем информацию врагу.', 'green');
              
              await ConsoleUI.print('\n[ЗАДАЧА 7]: Скачайте последний файл на свой локальный диск.', 'yellow');
              await ConsoleUI.print('Введите: download lesson_3_vigenere.enc', 'gray');
              this.step++;
          }
          break;

      // === ЗАВЕРШЕНИЕ ===
      case 7:
          if (lastCommand.startsWith('download')) {
              await ConsoleUI.print('\n[КУРАТОР]: Данные получены и верифицированы.', 'green');
              await ConsoleUI.print('[КУРАТОР]: Операция завершена. Теперь нам нужно замести следы и разорвать соединение.', 'green');

              await ConsoleUI.print('\n[ЗАДАЧА 8]: Отключитесь от терминала.', 'yellow');
              await ConsoleUI.print('Введите: disconnect', 'gray');
              this.step++;
          }
          break;

      case 8:
          if (lastCommand === 'disconnect' || lastCommand === 'exit') {
              await ConsoleUI.print('\n[КУРАТОР]: Курс завершен. Вы допущены к реальным операциям.', 'green');
              await ConsoleUI.print('[СИСТЕМА]: Генерация случайного сектора...', 'cyan', 20);
              await new Promise(r => setTimeout(r, 2000));
              
              this.stop(); // Выключаем туториал
              // Здесь можно вызвать генерацию новой игры, но пока просто дадим свободу
              await ConsoleUI.print('\n>>> СВОБОДНЫЙ РЕЖИМ АКТИВИРОВАН <<<', 'yellow');
              await ConsoleUI.print('Используйте "man" для справки, если забудете команды.', 'gray');
          }
          break;
    }
  }
}