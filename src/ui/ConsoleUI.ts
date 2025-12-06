import chalk from 'chalk';
import inquirer from 'inquirer';
import readline from 'readline';
import { ChalkColor } from '../config/settings';
import { CipherMechanics } from '../mechanics/CipherMechanics';
import { SettingsManager } from '../core/SettingsManager';

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
    // ИСПРАВЛЕНИЕ: приводим chalk к any
    const chalkFunc = (chalk as any)[color];
    const coloredText = chalkFunc ? chalkFunc(text) : text;
    
    // Берем скорость из настроек, если не задана
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

  // === ВВОД (КОМАНДНАЯ СТРОКА) ===
  static async promptShell(promptText: string): Promise<string> {
    this.initRawMode();
    return new Promise((resolve) => {
      this.rl!.question(promptText, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  // === МЕНЮ (СПИСОК) ===
  static async menu(title: string, options: string[]): Promise<string> {
    this.closeRawMode();
    // Красивый заголовок с эффектом печати
    await this.print(title, 'cyan'); 

    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: ' ', // Пустое, т.к. заголовок уже напечатан
        choices: options.map((opt, index) => ({
          name: opt,
          value: (index + 1).toString()
        })),
        prefix: chalk.cyan('>'),
      },
    ]);
    return choice;
  }

  // === ВЫБОР ИЗ СПИСКА ===
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
  
  // === ПРОСТОЙ ВВОД ===
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

 // === ОБНОВЛЕННАЯ МИНИ-ИГРА: ВОЗВРАЩАЕТ СДВИГ ===
  // Возвращает number (сдвиг), если подтвердили, или null, если отменили
  static async interactiveCaesarHack(encryptedText: string): Promise<number | null> {
    this.closeRawMode(); 

    let shift = 0;
    let playing = true;
    let confirmed = false;

    const previewText = encryptedText.length > 30 
        ? encryptedText.substring(0, 30) + '...' 
        : encryptedText;

    process.stdout.write('\x1B[?25l'); 
    console.log(chalk.yellow('\n=== CAESAR DECRYPTION TOOL ==='));
    console.log(chalk.gray('LEFT/RIGHT - Сдвиг | ENTER - Подтвердить выбор'));
    console.log(chalk.gray('------------------------------------------------'));

    const render = () => {
      const decrypted = CipherMechanics.caesarDecrypt(previewText, shift);
      const output = `[SHIFT: ${chalk.cyan(shift.toString().padStart(2, '0'))}] Preview: ${chalk.green(decrypted)}`;
      process.stdout.write('\r' + output + '\x1b[K');
    };

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
          confirmed = false; // Отмена
          process.exit(0);
        }

        if (!playing) {
          process.stdin.setRawMode(false);
          process.stdin.removeListener('keypress', handler);
          process.stdout.write('\n');
          process.stdout.write('\x1B[?25h');
          
          // Возвращаем сдвиг, если подтвердили, иначе null
          resolve(confirmed ? shift : null);
        }
      };
      process.stdin.on('keypress', handler);
    });
  }

  static async interactiveVigenereHack(encryptedText: string, correctKey: string): Promise<boolean> {
    this.closeRawMode();
    const attempts = 3;
    const decoys = ['SYSTEM', 'ROOT', 'ACCESS', 'SERVER', 'NETWORK'];
    
    // Формируем список: Правильный ключ + 3-4 случайных неправильных
    const options = new Set<string>();
    options.add(correctKey);
    while(options.size < 5) {
        options.add(decoys[Math.floor(Math.random() * decoys.length)]);
    }
    const choices = Array.from(options).sort(); // Сортируем по алфавиту

    console.log(chalk.yellow('\n=== VIGENERE DECRYPTION MATRIX ==='));
    console.log(chalk.gray(`Target Encrypted Block: "${encryptedText.substring(0, 15)}..."`));
    console.log(chalk.gray('Analyze pattern shifts and select the correct pass-phrase.'));

    for (let i = 0; i < attempts; i++) {
        const remaining = attempts - i;
        const choice = await this.selection(`Select Key Candidate (${remaining} attempts left):`, choices);
        
        const selectedKey = choice.replace('[ ', '').replace(' ]', '');

        // АНИМАЦИЯ СМЕЩЕНИЯ
        process.stdout.write(chalk.cyan('Applying shift algorithm... '));
        for(let k=0; k<10; k++) {
            process.stdout.write('.');
            await new Promise(r => setTimeout(r, 100));
        }
        process.stdout.write('\n');

        if (selectedKey === correctKey) {
            console.log(chalk.green('>>> KEY MATCHED. DECRYPTING STREAM. <<<'));
            await new Promise(r => setTimeout(r, 800));
            return true;
        } else {
            console.log(chalk.red('>>> INVALID KEY. OUTPUT IS GARBAGE. <<<'));
            // Можно показать "мусор", который получился
            const garbage = CipherMechanics.vigenereDecrypt(encryptedText.substring(0, 10), selectedKey);
            console.log(chalk.gray(`Result: ${garbage}...`));
        }
    }
    
    console.log(chalk.red('LOCKDOWN INITIATED. DECRYPTION FAILED.'));
    return false;
  }

  // === МИНИ-ИГРА: СБОРКА SSH КЛЮЧА ===
  static async interactiveKeyAssembly(fragments: string[]): Promise<boolean> {
    this.closeRawMode();
    
    // Правильный порядок - это исходный массив fragments
    // Создаем копию и перемешиваем её для игрока
    let currentOrder = [...fragments].sort(() => Math.random() - 0.5);
    const attempts = 2;

    console.log(chalk.yellow('\n=== SSH KEY RECONSTRUCTION ==='));
    console.log(chalk.gray('Arrange the captured packets in the correct order to form a valid key.'));

    for (let attempt = 0; attempt < attempts; attempt++) {
        console.log(chalk.cyan(`\nAttempt ${attempt + 1}/${attempts}`));
        
        // Используем inquirer для сортировки (выбора порядка)
        // В inquirer нет встроенного "drag and drop", поэтому сделаем пошаговый выбор
        // Или упростим: Пользователь должен ввести номера фрагментов в правильном порядке (1 3 2 4)
        
        currentOrder.forEach((frag, idx) => {
            console.log(`${chalk.yellow(idx + 1)}: ${frag}`);
        });

        const { input } = await inquirer.prompt([{
            type: 'input',
            name: 'input',
            message: 'Enter sequence (e.g. "3 1 4 2"):',
            validate: val => /^[1-4\s]+$/.test(val) ? true : 'Invalid format'
        }]);

        const indices = input.trim().split(/\s+/).map((n: string) => parseInt(n) - 1);
        
        // Проверка длины
        if (indices.length !== fragments.length) {
            console.log(chalk.red('Error: You must use all fragments.'));
            continue;
        }

        // Проверка правильности
        let isCorrect = true;
        const assembled = [];
        
        for(let i=0; i<indices.length; i++) {
            const chosenFragment = currentOrder[indices[i]];
            assembled.push(chosenFragment);
            
            if (chosenFragment !== fragments[i]) {
                isCorrect = false;
            }
        }

        if (isCorrect) {
            console.log(chalk.green('>>> SIGNATURE VERIFIED. AUTHENTICATED. <<<'));
            return true;
        } else {
            console.log(chalk.red('>>> CHECKSUM FAILED. KEY INVALID. <<<'));
            
            // ПОДСКАЗКА: Показываем, какие части совпали
            let hint = 'Structure Analysis: ';
            for(let i=0; i<assembled.length; i++) {
                if (assembled[i] === fragments[i]) {
                    hint += chalk.green('[OK] ');
                } else {
                    hint += chalk.red('[ERR] ');
                }
            }
            console.log(hint);
        }
    }

    return false;
  }

  // === МИНИ-ИГРА: XOR ===
  static async interactiveXorHack(): Promise<boolean> {
    this.closeRawMode(); 
    const puzzle = CipherMechanics.generateXORPuzzle();

    console.log(chalk.yellow('\n=== XOR BITWISE LOGIC GATE ==='));
    console.log(chalk.gray('0^0=0, 1^1=0, 1^0=1, 0^1=1 (Одинаковые=0, Разные=1)'));
    console.log('------------------------------------------------');
    console.log(`Value A:  ${chalk.cyan(puzzle.val1Bin)}`);
    console.log(`Value B:  ${chalk.cyan(puzzle.val2Bin)}`);
    console.log(`Target:   ${chalk.red('????????')}`);
    
    // Для ввода используем inquirer, так как raw mode тут сложнее
    const { answer } = await inquirer.prompt([
        {
            type: 'input',
            name: 'answer',
            message: 'Введите результат (8 бит):',
            prefix: chalk.green('>'),
            validate: (input) => {
                if (/^[01]{8}$/.test(input)) return true;
                return 'Нужно 8 символов (0 или 1)';
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

  // === АНИМАЦИЯ: МАТРИЦА (SUBSTITUTION) ===
  static async animateSubstitutionCrack(encrypted: string, original: string): Promise<void> {
      this.closeRawMode();
      
      if (!SettingsManager.isAnimEnabled) {
          console.log(chalk.green('>>> DECRYPTION BYPASSED (ANIMATION OFF) <<<'));
          console.log(`Original: ${original}`);
          return;
      }

      console.log(chalk.yellow('\n=== FREQUENCY ANALYSIS (SUBSTITUTION) ==='));
      process.stdout.write('\x1B[?25l');

      const steps = 20;
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

      process.stdout.write('\r' + chalk.green(original.substring(0, 50)) + '...   [MATCH FOUND]\n');
      process.stdout.write('\x1B[?25h');
  }

  static async printAsyncLog(text: string) {
      // Очищаем текущую строку, пишем лог, переносим строку
      process.stdout.write('\r\x1b[K'); 
      console.log(text);
      // Восстанавливаем промпт (это сложно сделать идеально без глобального состояния промпта)
      // Поэтому просто оставим как лог. Игрок нажмет Enter и увидит промпт снова.
      process.stdout.write(chalk.gray('> ')); 
  }

  static close() {
    this.closeRawMode();
  }
}