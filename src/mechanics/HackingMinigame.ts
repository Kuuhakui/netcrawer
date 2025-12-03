import { ConsoleUI } from '../ui/ConsoleUI';
import chalk from 'chalk';

export class HackingMinigame {
  
  // Генерация списка слов
  private static getWordList(target: string, count: number): string[] {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // Используем Set, чтобы слова не повторялись
    const uniqueList = new Set<string>();
    
    // 1. Сразу добавляем ПРАВИЛЬНЫЙ пароль
    uniqueList.add(target);

    // 2. Генерируем остальные слова (мусор)
    while (uniqueList.size < count) {
      let noise = '';
      for (let i = 0; i < target.length; i++) {
        // С вероятностью 30% символ совпадает с правильным паролем (чтобы было сходство)
        // С вероятностью 70% это случайная буква
        if (Math.random() < 0.3) {
           noise += target[i];
        } else {
           noise += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
      
      // Добавляем, только если такого слова еще нет
      uniqueList.add(noise);
    }

    // 3. Превращаем в массив и перемешиваем
    return Array.from(uniqueList).sort(() => Math.random() - 0.5);
  }

  // Подсчет совпадений (Символ и позиция совпадают)
  private static calculateLikeness(guess: string, target: string): number {
    let matches = 0;
    for (let i = 0; i < target.length; i++) {
      if (guess[i] === target[i]) matches++;
    }
    return matches;
  }

  static async start(targetPassword: string, attempts: number): Promise<boolean> {
    const wordList = this.getWordList(targetPassword, 8); // Генерируем 8 вариантов
    const formattedList = wordList.map(w => `[ ${w} ]`);
    const attemptLog: string[] = [];
    
    let currentAttempt = 0;

    while (currentAttempt < attempts) {
      console.clear();
      
      // === HEADER ===
      await ConsoleUI.print('=== PROTOCOL INITIATED: HYDRA BRUTEFORCE ===', 'red');
      console.log(chalk.yellow(`Цель зашифрована. Длина ключа: ${targetPassword.length}`));
      console.log(chalk.blue('Анализ дампа памяти...'));
      console.log(chalk.gray('------------------------------------------------'));
      
      // === LOGS ===
      if (attemptLog.length > 0) {
        attemptLog.forEach(log => console.log(log));
        console.log(chalk.gray('------------------------------------------------'));
      }

      // === SELECTION ===
      const remaining = attempts - currentAttempt;
      
      const selectedString = await ConsoleUI.selection(
        chalk.white(`Выберите пароль (${remaining} попыток):`), 
        formattedList
      );

      const guess = selectedString.replace('[ ', '').replace(' ]', '');

      // === CHECK ===
      if (guess === targetPassword) {
        console.log(chalk.gray('------------------------------------------------'));
        await ConsoleUI.print(`ПАРОЛЬ ПРИНЯТ. ДОСТУП РАЗРЕШЕН.`, 'green', 10);
        await new Promise(r => setTimeout(r, 1500));
        return true;
      } else {
        const likeness = this.calculateLikeness(guess, targetPassword);
        
        // Подкрашиваем совпадение: если высокое - зеленым, низкое - красным
        const likenessColor = likeness > targetPassword.length / 2 ? chalk.green : chalk.red;
        
        const logEntry = `${chalk.red('X')} ${chalk.cyan(guess)}: Отказано. Совпадение: ${likenessColor(likeness)}/${targetPassword.length}`;
        attemptLog.push(logEntry);
        
        currentAttempt++;
      }
    }

    // === FAILURE ===
    console.log(chalk.gray('------------------------------------------------'));
    console.log(chalk.red('ОБНАРУЖЕНО ВТОРЖЕНИЕ. СОЕДИНЕНИЕ СБРОШЕНО.'));
    // ПОКАЗЫВАЕМ ИГРОКУ, ГДЕ БЫЛ ПРАВИЛЬНЫЙ ОТВЕТ
    console.log(chalk.gray(`Правильный ключ был: ${chalk.bold.white(targetPassword)}`));
    
    await new Promise(r => setTimeout(r, 3000));
    return false;
  }
}