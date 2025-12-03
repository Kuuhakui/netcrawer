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

  // === МИНИ-ИГРА: ЦЕЗАРЬ ===
  static async interactiveCaesarHack(encryptedText: string): Promise<boolean> {
    this.closeRawMode(); 

    let shift = 0;
    let playing = true;
    let confirmed = false;

    // Обрезаем длинный текст
    const previewText = encryptedText.length > 30 
        ? encryptedText.substring(0, 30) + '...' 
        : encryptedText;

    process.stdout.write('\x1B[?25l'); // Скрыть курсор
    console.log(chalk.yellow('\n=== CAESAR DECRYPTION TOOL ==='));
    console.log(chalk.gray('LEFT/RIGHT - Сдвиг | ENTER - Подтвердить'));
    console.log(chalk.gray('------------------------------------------------'));

    const render = () => {
      const decrypted = CipherMechanics.caesarDecrypt(previewText, shift);
      // \r и \x1b[K нужны, чтобы обновлять одну строку
      const output = `[SHIFT: ${chalk.cyan(shift.toString().padStart(2, '0'))}] Result: ${chalk.green(decrypted)}`;
      process.stdout.write('\r' + output + '\x1b[K');
    };

    render();

    process.stdin.setRawMode(true);
    process.stdin.resume();

    return new Promise<boolean>((resolve) => {
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
          process.exit(0);
        }

        if (!playing) {
          process.stdin.setRawMode(false);
          process.stdin.removeListener('keypress', handler);
          process.stdout.write('\n');
          process.stdout.write('\x1B[?25h'); // Вернуть курсор
          resolve(confirmed);
        }
      };
      process.stdin.on('keypress', handler);
    });
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

  static close() {
    this.closeRawMode();
  }
}