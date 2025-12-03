import { ICommand } from './ICommand';
import { GameSession } from '../GameSession';
import { ConsoleUI } from '../../ui/ConsoleUI';
import chalk from 'chalk';

export class LsCommand implements ICommand {
  name = 'ls';
  aliases = ['dir', 'll'];
  description = 'Показать список файлов';

  async execute(args: string[], session: GameSession): Promise<void> {
    // ЕСЛИ ПОДКЛЮЧЕНЫ -> смотрим файлы удаленного ПК
    // ЕСЛИ НЕ ПОДКЛЮЧЕНЫ -> смотрим файлы своего ПК (playerDevice)
    const device = session.connectedDevice ? session.connectedDevice : session.playerDevice;
    
    const contextName = session.connectedDevice ? 'REMOTE' : 'LOCAL';
    console.log(chalk.gray(`--- FILE LISTING [${contextName}] ---`));
    
    const files = device.files || [];
    if (files.length === 0) {
      console.log(chalk.gray('(empty directory)'));
      return;
    }

    files.forEach(f => {
      const icon = f.encryption !== 'NONE' ? '🔒' : '📄';
      const color = f.encryption !== 'NONE' ? chalk.red : chalk.green;
      const encType = f.encryption !== 'NONE' ? `[${f.encryption}]` : '';
      console.log(`${icon} ${color(f.name.padEnd(25))} ${chalk.gray(encType)}`);
    });
  }
}

export class CatCommand implements ICommand {
  name = 'cat';
  aliases = ['read', 'more'];
  description = 'Прочитать содержимое файла';

  async execute(args: string[], session: GameSession): Promise<void> {
    // Тоже выбираем между удаленным и локальным устройством
    const device = session.connectedDevice ? session.connectedDevice : session.playerDevice;
    const fileName = args[0];

    if (!fileName) {
        await ConsoleUI.print('Usage: cat <filename>', 'yellow');
        return;
    }

    const file = device.files.find(f => f.name === fileName);
    if (!file) {
      await ConsoleUI.print('File not found.', 'red');
      return;
    }

    if (file.encryption !== 'NONE') {
      await ConsoleUI.print(`[ACCESS DENIED] File is encrypted with ${file.encryption} cipher.`, 'red');
      console.log(chalk.gray('Use "decrypt <filename>" to break the security layer.'));
    } else {
      console.log(chalk.white('--- START OF FILE ---'));
      console.log(file.content);
      console.log(chalk.white('--- END OF FILE ---'));
    }
  }
}

export class DownloadCommand implements ICommand {
  name = 'download';
  aliases = ['scp', 'cp', 'get']; // Линуксовые алиасы для атмосферы
  description = 'Скачать файл с удаленного устройства на локальный диск';

  async execute(args: string[], session: GameSession): Promise<void> {
    // 1. Проверяем подключение
    if (!session.connectedDevice) {
      await ConsoleUI.print('Error: Cannot download. No active connection.', 'red');
      return;
    }

    const fileName = args[0];
    if (!fileName) {
      await ConsoleUI.print('Usage: download <filename>', 'yellow');
      return;
    }

    // 2. Ищем файл на удаленном ПК
    const remoteFile = session.connectedDevice.files.find(f => f.name === fileName);

    if (!remoteFile) {
      await ConsoleUI.print(`Remote file '${fileName}' not found.`, 'red');
      return;
    }

    // 3. (Опционально) Запрещаем качать зашифрованное, или разрешаем? 
    // Давай разрешим, но добавим предупреждение.
    if (remoteFile.encryption !== 'NONE') {
        await ConsoleUI.print('Warning: Downloading encrypted file. You will need to decrypt it locally.', 'yellow');
    }

    // 4. Проверяем, нет ли такого файла уже у нас
    const alreadyExists = session.playerDevice.files.find(f => f.name === fileName);
    if (alreadyExists) {
        await ConsoleUI.print(`Error: File '${fileName}' already exists on local drive.`, 'red');
        return;
    }

    // 5. Копируем файл
    await ConsoleUI.print(`Initiating transfer: ${fileName} -> localhost...`, 'cyan');
    
    // Имитация прогресс-бара
    const width = 20;
    for(let i=0; i<=width; i++) {
        const pct = Math.round((i/width)*100);
        const bar = '█'.repeat(i) + '-'.repeat(width-i);
        process.stdout.write(`\r[${bar}] ${pct}%`);
        await new Promise(r => setTimeout(r, 50));
    }
    process.stdout.write('\n');

    // Клонируем объект, чтобы изменения в копии не влияли на оригинал
    const newFile = { ...remoteFile };
    session.playerDevice.files.push(newFile);

    await ConsoleUI.print('Transfer complete.', 'green');
  }
}

export class DecryptCommand implements ICommand {
  name = 'decrypt';
  aliases = ['crack'];
  description = 'Взломать шифрование файла';

  async execute(args: string[], session: GameSession): Promise<void> {
    if (!session.connectedDevice) {
        await ConsoleUI.print('Error: Decryption tools require active connection to target.', 'red');
        return;
    }
    
    const fileName = args[0];
    if (!fileName) {
        await ConsoleUI.print('Usage: decrypt <filename>', 'yellow');
        return;
    }

    const file = session.connectedDevice.files.find(f => f.name === fileName);

    if (!file) {
       await ConsoleUI.print('File not found.', 'red');
       return;
    }
    
    if (file.encryption === 'NONE') {
       await ConsoleUI.print('Target file is unencrypted.', 'yellow');
       return;
    }

    let success = false;

    // === ЛОГИКА ВЗЛОМА ===
    if (file.encryption === 'CAESAR') {
       const result = await ConsoleUI.interactiveCaesarHack(file.content);
       if (result) success = true;
    } 
    else if (file.encryption === 'SUBSTITUTION') {
        await ConsoleUI.animateSubstitutionCrack(file.content, file.originalContent);
        success = true;
    }
    else if (file.encryption === 'XOR') {
        // Запускаем мини-игру XOR
        success = await ConsoleUI.interactiveXorHack();
    }

    // === ЕСЛИ ВЗЛОМ УСПЕШЕН ===
   if (success) {
        // 1. Расшифровываем файл на удаленном ПК
        file.content = file.originalContent;
        // Используем 'as const' или приведение к типу, чтобы TS не ругался
        file.encryption = 'NONE' as const; 
        
        await ConsoleUI.print('\nDecryption successful. File readable.', 'green');

        // 2. ПРОВЕРЯЕМ, ЯВЛЯЕТСЯ ЛИ ЭТО ФРАГМЕНТОМ КЛЮЧА
        if (file.content.includes('FRAGMENT') || file.content.includes('KEY')) {
            await ConsoleUI.print('>>> IMPORTANT DATA FOUND <<<', 'cyan');
            await ConsoleUI.print('Downloading to local storage...', 'cyan', 20);
            
            // Создаем копию файла для локального ПК
            const localFile = {
                ...file,
                name: `downloaded_${file.name}`,
                // ВАЖНО: Добавляем 'as const', чтобы зафиксировать тип
                encryption: 'NONE' as const 
            };

            // Проверка на дубликаты
            const alreadyExists = session.playerDevice.files.find(f => f.name === localFile.name);
            if (!alreadyExists) {
                // Теперь TypeScript поймет, что localFile соответствует IFile
                session.playerDevice.files.push(localFile); 
                await ConsoleUI.print(`File saved to ${session.playerDevice.hostname}:/home/guest/${localFile.name}`, 'green');
            } else {
                await ConsoleUI.print('File already exists in local storage.', 'gray');
            }
        }
    } else {
        await ConsoleUI.print('Decryption failed or cancelled.', 'red');
    }
  }
}