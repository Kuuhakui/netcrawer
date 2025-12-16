import chalk from 'chalk';
import inquirer from 'inquirer';
import readline from 'readline';
import { SettingsManager } from '../core/SettingsManager';
import { CipherMechanics } from '../mechanics/CipherMechanics';

export class ConsoleUI {
  private static rl: readline.Interface | null = null;

  static initRawMode() {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '',
        terminal: true
      });
    }
  }

  static closeRawMode() {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  // === ВЫВОД ТЕКСТА ===
  static async print(text: string, color: string = 'white', speed: number = -1) {
    const chalkFunc = (chalk as any)[color];
    const coloredText = chalkFunc ? chalkFunc(text) : text;
    const currentSpeed = speed === -1 ? SettingsManager.speed : speed;

    if (currentSpeed > 0) {
      for (const char of coloredText) {
        process.stdout.write(char);
        await new Promise(r => setTimeout(r, currentSpeed));
      }
      process.stdout.write('\n');
    } else {
      console.log(coloredText);
    }
  }

  // === ЛОГИРОВАНИЕ (Асинхронное) ===
  static async printAsyncLog(text: string) {
      process.stdout.write('\r\x1b[K'); 
      console.log(text);
      process.stdout.write(chalk.gray('> ')); 
  }

  static async promptShell(promptText: string): Promise<string> {
    this.initRawMode();
    return new Promise((resolve) => {
      this.rl!.question(promptText, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  static async menu(title: string, options: string[]): Promise<string> {
    this.closeRawMode();
    await this.print(title, 'cyan'); 

    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: ' ', 
        choices: options.map((opt, index) => ({
          name: opt,
          value: (index + 1).toString()
        })),
        prefix: chalk.cyan('>'),
      },
    ]);
    return choice;
  }

  static async selection(message: string, choices: string[]): Promise<string> {
    this.closeRawMode();
    const { selection } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selection',
        message: message,
        choices: choices,
        prefix: chalk.green('>'),
        pageSize: 10,
      },
    ]);
    return selection;
  }

  static async prompt(question: string): Promise<string> {
    this.closeRawMode();
    const { result } = await inquirer.prompt([
     {
       type: 'input',
       name: 'result',
       message: question,
       prefix: '',
       transformer: (input) => chalk.white(input),
     },
   ]);
   return result;
 }

  // =========================================================
  // === МИНИ-ИГРА 1: ЦЕЗАРЬ (С визуализацией алфавита) ===
  // =========================================================
  static async interactiveCaesarHack(encryptedText: string): Promise<number | null> {
    this.closeRawMode(); 

    let shift = 0;
    let playing = true;
    let confirmed = false;

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const previewText = encryptedText.length > 30 
        ? encryptedText.substring(0, 30) + '...' 
        : encryptedText;

    process.stdout.write('\x1B[?25l'); 
    console.log(chalk.yellow('\n=== CAESAR DECRYPTION TOOL v2.0 ==='));
    console.log(chalk.gray('Используйте стрелки LEFT/RIGHT для сдвига алфавита.'));
    console.log(chalk.gray('Задача: Сопоставить буквы так, чтобы текст стал читаемым.'));
    console.log(chalk.gray('------------------------------------------------'));

    const render = () => {
      // 1. Формируем сдвинутый алфавит для визуализации
      // Если сдвиг 1, то A -> B. Значит под A должно быть B.
      // В шифре Цезаря Decrypt: char - shift. 
      // Визуально: Верхний ряд (Шифр), Нижний ряд (Исходный)
      
      const shiftedAlphabet = alphabet.slice(shift) + alphabet.slice(0, shift);
      
      readline.cursorTo(process.stdout, 0);
      readline.clearLine(process.stdout, 0);
      
      console.log(`Cipher: ${chalk.red(alphabet)}`); 
      console.log(`Plain:  ${chalk.green(shiftedAlphabet)}  <-- (Shift: ${shift})`);
      console.log(chalk.gray('------------------------------------------------'));
      
      const decrypted = CipherMechanics.caesarDecrypt(previewText, shift);
      console.log(`Result: ${chalk.white(decrypted)}`);
      
      // Возвращаем курсор на 4 строки вверх для перерисовки
      process.stdout.write('\x1b[4A'); 
    };

    // Делаем отступ для рендера
    console.log('\n\n\n\n');
    process.stdout.write('\x1b[4A'); // Возвращаемся назад
    render();

    process.stdin.setRawMode(true);
    process.stdin.resume();

    return new Promise<number | null>((resolve) => {
      const handler = (ch: any, key: any) => {
        if (!key) return;
        
        if (key.name === 'right') {
          shift = (shift + 1) % 26;
          render();
        } else if (key.name === 'left') {
          shift = (shift - 1);
          if (shift < 0) shift = 25;
          render();
        } else if (key.name === 'return' || key.name === 'enter') {
          playing = false;
          confirmed = true;
        } else if (key.ctrl && key.name === 'c') {
          playing = false;
          confirmed = false;
          process.exit(0);
        }

        if (!playing) {
          process.stdin.setRawMode(false);
          process.stdin.removeListener('keypress', handler);
          // Спускаемся вниз, чтобы не затереть вывод
          console.log('\n\n\n\n'); 
          process.stdout.write('\x1B[?25h');
          resolve(confirmed ? shift : null);
        }
      };
      process.stdin.on('keypress', handler);
    });
  }

  // =========================================================
  // === МИНИ-ИГРА 2: XOR (С Таблицей Истины) ===
  // =========================================================
  static async interactiveXorHack(): Promise<boolean> {
    this.closeRawMode(); 
    const puzzle = CipherMechanics.generateXORPuzzle();

    console.log(chalk.yellow('\n=== XOR LOGIC GATE ==='));
    
    // === ТАБЛИЦА ИСТИНЫ (ШПАРГАЛКА) ===
    console.log(chalk.white('TRUTH TABLE (ШПАРГАЛКА):'));
    console.log(chalk.gray('┌─────┬─────┬─────────┐'));
    console.log(chalk.gray('│  A  │  B  │ Result  │'));
    console.log(chalk.gray('├─────┼─────┼─────────┤'));
    console.log(chalk.gray('│  0  │  0  │    ') + chalk.green('0') + chalk.gray('    │'));
    console.log(chalk.gray('│  0  │  1  │    ') + chalk.green('1') + chalk.gray('    │'));
    console.log(chalk.gray('│  1  │  0  │    ') + chalk.green('1') + chalk.gray('    │'));
    console.log(chalk.gray('│  1  │  1  │    ') + chalk.green('0') + chalk.gray('    │'));
    console.log(chalk.gray('└─────┴─────┴─────────┘'));
    console.log(chalk.cyan('Правило: Одинаковые = 0, Разные = 1'));
    
    console.log('\n' + chalk.gray('------------------------------------------------'));
    console.log(`Value A:  ${chalk.cyan(puzzle.val1Bin)}`);
    console.log(`Value B:  ${chalk.cyan(puzzle.val2Bin)}`);
    console.log(`Target:   ${chalk.red('????????')}`);
    
    const { answer } = await inquirer.prompt([
        {
            type: 'input',
            name: 'answer',
            message: 'Введите результат XOR (8 бит):',
            prefix: chalk.green('>'),
            validate: (input) => {
                if (/^[01]{8}$/.test(input)) return true;
                return 'Нужно ровно 8 символов (0 или 1)';
            }
        }
    ]);

    if (answer === puzzle.answerBin) {
        console.log(chalk.green('>>> CORRECT <<<'));
        await new Promise(r => setTimeout(r, 1000));
        return true;
    } else {
        console.log(chalk.red(`>>> ERROR. EXPECTED: ${puzzle.answerBin}`));
        await new Promise(r => setTimeout(r, 1500));
        return false;
    }
  }

  // =========================================================
  // === МИНИ-ИГРА 3: ВИЖЕНЕР (Ручная дешифровка) ===
  // =========================================================
  static async interactiveVigenereHack(encryptedText: string, key: string): Promise<boolean> {
    this.closeRawMode();
    const cleanKey = key.toUpperCase();
    const cleanText = encryptedText.toUpperCase().replace(/[^A-Z]/g, '');
    
    console.log(chalk.yellow('\n=== VIGENERE DECRYPTION PROTOCOL ==='));
    console.log(chalk.gray('В этом методе буква ключа определяет строку в таблице.'));
    console.log(chalk.gray('1. Найдите букву ШИФРА (Cipher) в указанной строке.'));
    console.log(chalk.gray('2. Посмотрите НАВЕРХ (Header), чтобы узнать исходную букву.'));
    
    // Нужно угадать 3 буквы вручную
    const steps = 3;
    let solvedCount = 0;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < steps; i++) {
        const cipherChar = cleanText[i];
        const keyChar = cleanKey[i % cleanKey.length];
        
        // Вычисляем правильный ответ
        // Vigenere Decrypt: (Cipher - Key + 26) % 26
        const cipherCode = cipherChar.charCodeAt(0) - 65;
        const keyCode = keyChar.charCodeAt(0) - 65;
        const plainCode = (cipherCode - keyCode + 26) % 26;
        const correctChar = String.fromCharCode(plainCode + 65);

        // Генерируем строку таблицы Виженера для текущего ключа
        // Строка начинается с KeyChar
        const rowStart = alphabet.indexOf(keyChar);
        const vigenereRow = alphabet.slice(rowStart) + alphabet.slice(0, rowStart);

        console.log(chalk.gray('\n------------------------------------------------'));
        console.log(chalk.yellow(`STEP ${i+1}/${steps}`));
        console.log(`Key Letter:    [ ${chalk.cyan(keyChar)} ] -> Используем строку, начинающуюся с ${keyChar}`);
        console.log(`Cipher Letter: [ ${chalk.red(cipherChar)} ] -> Найдите эту букву в строке ниже`);
        
        // Визуализация таблицы
        console.log(chalk.gray('\nHeader (PLAIN): ') + chalk.white(alphabet.split('').join(' ')));
        console.log(chalk.gray('Row (CIPHER):   ') + chalk.cyan(vigenereRow.split('').join(' ')));
        
        const { input } = await inquirer.prompt([{
            type: 'input',
            name: 'input',
            message: `Какая буква в Header стоит над '${cipherChar}'?`,
            filter: (val) => val.toUpperCase(),
            validate: (val) => val.length === 1 && /[A-Z]/.test(val) ? true : 'Введите одну букву'
        }]);

        if (input === correctChar) {
            console.log(chalk.green('>>> MATCH CONFIRMED <<<'));
            solvedCount++;
        } else {
            console.log(chalk.red(`>>> ERROR. Correct was: ${correctChar} <<<`));
            console.log(chalk.gray('Decryption sequence aborted.'));
            return false;
        }
    }

    console.log(chalk.green('\n>>> MANUAL OVERRIDE SUCCESSFUL. AUTO-DECRYPTING REST... <<<'));
    
    // Эффект автозаполнения
    const decryptedTotal = CipherMechanics.vigenereDecrypt(encryptedText, key);
    process.stdout.write(chalk.white(decryptedTotal.substring(0, 3))); // Первые 3 мы уже знаем
    
    for (let i = 3; i < decryptedTotal.length; i++) {
        process.stdout.write(chalk.green(decryptedTotal[i]));
        await new Promise(r => setTimeout(r, 30));
    }
    console.log('\n');
    
    return true;
  }

  // === МИНИ-ИГРА 4: СБОРКА SSH КЛЮЧА ===
  static async interactiveKeyAssembly(fragments: string[]): Promise<boolean> {
    this.closeRawMode();
    
    let currentOrder = [...fragments].sort(() => Math.random() - 0.5);
    const attempts = 2;

    console.log(chalk.yellow('\n=== SSH KEY RECONSTRUCTION ==='));
    console.log(chalk.gray('Восстановите порядок пакетов (например, "2 1 4 3").'));

    for (let attempt = 0; attempt < attempts; attempt++) {
        console.log(chalk.cyan(`\nПопытка ${attempt + 1}/${attempts}`));
        
        currentOrder.forEach((frag, idx) => {
            console.log(`${chalk.yellow(idx + 1)}: ${frag}`);
        });

        const { input } = await inquirer.prompt([{
            type: 'input',
            name: 'input',
            message: 'Введите последовательность:',
            validate: val => /^[1-4\s]+$/.test(val) ? true : 'Неверный формат'
        }]);

        const indices = input.trim().split(/\s+/).map((n: string) => parseInt(n) - 1);
        
        if (indices.length !== fragments.length) {
            console.log(chalk.red('Ошибка: Нужно использовать все фрагменты.'));
            continue;
        }

        let isCorrect = true;
        const assembled = [];
        
        for(let i=0; i<indices.length; i++) {
            const chosenFragment = currentOrder[indices[i]];
            assembled.push(chosenFragment);
            if (chosenFragment !== fragments[i]) isCorrect = false;
        }

        if (isCorrect) {
            console.log(chalk.green('>>> SIGNATURE VERIFIED. <<<'));
            return true;
        } else {
            console.log(chalk.red('>>> CHECKSUM FAILED. <<<'));
            let hint = 'Анализ: ';
            for(let i=0; i<assembled.length; i++) {
                if (assembled[i] === fragments[i]) hint += chalk.green('[OK] ');
                else hint += chalk.red('[ERR] ');
            }
            console.log(hint);
        }
    }
    return false;
  }

  static async animateSubstitutionCrack(encrypted: string, original: string): Promise<void> {
      this.closeRawMode();
      
      if (!SettingsManager.isAnimEnabled) {
          console.log(chalk.green('>>> ANIMATION SKIPPED <<<'));
          return;
      }

      console.log(chalk.yellow('\n=== FREQUENCY ANALYSIS ==='));
      process.stdout.write('\x1B[?25l');

      const steps = 15;
      const len = Math.min(original.length, 50);
      let currentDisplay = encrypted.split('');
      const target = original.split('');

      for (let i = 0; i < steps; i++) {
          for(let j=0; j<len; j++) {
              if (currentDisplay[j] !== target[j]) {
                  currentDisplay[j] = String.fromCharCode(33 + Math.floor(Math.random() * 90));
              }
          }
          process.stdout.write('\r' + chalk.blue(currentDisplay.join('').substring(0, 50)) + '...');
          await new Promise(r => setTimeout(r, 50));
      }

      process.stdout.write('\r' + chalk.green(original.substring(0, 50)) + '...   [MATCH]\n');
      process.stdout.write('\x1B[?25h');
  }

  static close() {
    this.closeRawMode();
  }
}