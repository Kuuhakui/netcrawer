import chalk from 'chalk';
import { ConsoleUI } from '../ui/ConsoleUI';

export class ManualSystem {
  
  private static readonly topics: Record<string, string> = {
    // === GENERAL ===
    'basics': `
${chalk.yellow('ОСНОВЫ NETCRAWLER')}
Ваша задача — проникать в защищенные сети, собирать данные и находить ключи.

${chalk.cyan('Основные команды:')}
  ${chalk.green('scan')}        - Обнаружить устройства в сети.
  ${chalk.green('connect <ip>')} - Подключиться к устройству (может потребоваться взлом).
  ${chalk.green('ls')}          - Показать файлы.
  ${chalk.green('cat <file>')}  - Прочитать файл.
  ${chalk.green('decrypt <file>')} - Запустить дешифратор.
  ${chalk.green('download <file>')} - Скачать файл себе (на localhost).
  ${chalk.green('disconnect')}  - Отключиться от текущего устройства.
    `,

    // === CRYPTOGRAPHY ===
    'caesar': `
${chalk.yellow('ШИФР ЦЕЗАРЯ (CAESAR CIPHER)')}
Один из старейших методов шифрования. Каждая буква заменяется на другую,
смещенную на фиксированное число позиций в алфавите.

${chalk.cyan('Как взломать:')}
В мини-игре вы увидите две строки алфавита.
${chalk.red('Красная строка')} — это зашифрованные буквы.
${chalk.green('Зеленая строка')} — это исходные буквы.

Используйте стрелки, чтобы сдвигать зеленую строку, пока текст
справа не станет читаемым (осмысленным).
    `,

    'xor': `
${chalk.yellow('XOR (ИСКЛЮЧАЮЩЕЕ ИЛИ)')}
Битовая операция, основа компьютерной логики. Сравнивает два бита.

${chalk.cyan('Таблица истины (Правила):')}
  0 ^ 0 = ${chalk.green('0')} (Одинаковые)
  1 ^ 1 = ${chalk.green('0')} (Одинаковые)
  1 ^ 0 = ${chalk.green('1')} (Разные)
  0 ^ 1 = ${chalk.green('1')} (Разные)

В мини-игре вам нужно применить это правило к каждому биту
двух чисел, чтобы получить результат.
    `,

    'vigenere': `
${chalk.yellow('ШИФР ВИЖЕНЕРА (VIGENERE CIPHER)')}
Продвинутый шифр, использующий Ключевое Слово. Для каждой буквы текста
используется свой сдвиг, зависящий от буквы ключа.

${chalk.cyan('Как пользоваться таблицей:')}
В мини-игре вам нужно найти исходную букву (HEADER), используя таблицу.

1. ${chalk.magenta('Key Letter')} (Буква Ключа) — указывает на нужную ${chalk.magenta('СТРОКУ')} (Row).
   Найдите строку, которая начинается с этой буквы.

2. ${chalk.red('Cipher Letter')} (Буква Шифра) — это символ, который вы видите в этой строке.
   Найдите эту букву внутри выбранной строки.

3. ${chalk.green('Result')} (Ответ) — посмотрите ${chalk.green('НАВЕРХ')} (в заголовок таблицы).
   Буква, стоящая в самом верху над вашей буквой шифра — это ответ.

${chalk.gray('Пример: Ключ B, Шифр C.')}
${chalk.gray('Строка B: B C D...')}
${chalk.gray('Находим C. Смотрим наверх -> Там стоит B.')}
    `,

    // === NETWORK ===
    'ssh': `
${chalk.yellow('ПРОТОКОЛ SSH И СНИФФИНГ')}
Некоторые цели (отмеченные как ${chalk.yellow('ACTIVE')}) используют защищенный протокол SSH.
Их нельзя взломать простым перебором пароля. Нужно перехватить ключ.

${chalk.cyan('Алгоритм взлома:')}
1. Найдите цель со статусом ACTIVE через ${chalk.green('scan')}.
2. Используйте команду ${chalk.green('sniff <ip>')} для начала прослушки.
3. Ждите, пока сниффер соберет все фрагменты (вы увидите уведомления).
4. Подключитесь через ${chalk.green('connect <ip>')}.
5. Соберите фрагменты ключа в правильном порядке.
    `,
    
    'tunnel': `
${chalk.yellow('ТУННЕЛИРОВАНИЕ (TUNNELING)')}
Способ перехода в следующую подсеть (на новый уровень).

Доступен только на ${chalk.magenta('GATEWAY-ROUTER')}.
Требует полного контроля над текущей сетью (все ПК должны быть взломаны).
Команда: ${chalk.green('tunnel')}
    `
  };

  static async showTopic(topic: string) {
    if (!topic) {
        await this.showIndex();
        return;
    }

    const key = topic.toLowerCase();
    const content = this.topics[key];

    if (content) {
        console.log(chalk.gray('------------------------------------------------'));
        console.log(content);
        console.log(chalk.gray('------------------------------------------------'));
    } else {
        await ConsoleUI.print(`Manual entry for '${topic}' not found.`, 'red');
        await this.showIndex();
    }
  }

  static async showIndex() {
      console.log(chalk.yellow('\n=== NETCRAWLER MANUAL PAGES ==='));
      console.log('Available topics:');
      const keys = Object.keys(this.topics);
      keys.forEach(k => {
          console.log(` - ${chalk.cyan(k)}`);
      });
      console.log(chalk.gray('\nUsage: man <topic> (e.g., "man vigenere")'));
  }
}