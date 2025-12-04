import { ICommand } from './ICommand';
import { GameSession } from '../GameSession';
import { ConsoleUI } from '../../ui/ConsoleUI';
import { HackingMinigame } from '../../mechanics/HackingMinigame';
import chalk from 'chalk';

export class ScanCommand implements ICommand {
  name = 'scan';
  description = 'Сканировать текущую сеть на наличие устройств';

  async execute(args: string[], session: GameSession): Promise<void> {
    if (session.connectedDevice) {
      await ConsoleUI.print('Ошибка: Нельзя сканировать внешнюю сеть изнутри хоста. Сначала disconnect.', 'red');
      return;
    }
    await ConsoleUI.print('Scanning network...', 'blue', 10);
    
    console.log(chalk.white('------------------------------------------------'));
    console.log(chalk.bold('IP ADDRESS      HOSTNAME           TYPE       STATUS'));
    console.log(chalk.white('------------------------------------------------'));
    
    for (const dev of session.currentNetwork.devices) {
        const status = dev.isHacked ? chalk.green('PWNED') : chalk.red('SECURE');
        // Добавим отображение типа, чтобы видеть кто Router, а кто PC
        console.log(`${chalk.cyan(dev.ip.padEnd(15))} ${dev.hostname.padEnd(18)} ${dev.type.padEnd(10)} [${status}]`);
    }
    console.log(chalk.white('------------------------------------------------'));
  }
}

export class ConnectCommand implements ICommand {
  name = 'connect';
  description = 'Подключиться к устройству по IP';

  async execute(args: string[], session: GameSession): Promise<void> {
    const ip = args[0];
    if (!ip) {
      await ConsoleUI.print('Usage: connect <ip>', 'yellow');
      return;
    }

    const target = session.currentNetwork.devices.find(d => d.ip === ip);
    if (!target) {
      await ConsoleUI.print(`Host ${ip} unreachable.`, 'red');
      return;
    }

    // Если уже взломан - пускаем сразу
    if (target.isHacked) {
      session.connectedDevice = target;
      await ConsoleUI.print(`Access granted to ${target.hostname}.`, 'green');
      return;
    }

    // === ЛОГИКА АВТО-ВЗЛОМА РОУТЕРА ===
    if (target.type === 'ROUTER') {
        // Проверяем все остальные устройства (ПК)
        const pcs = session.currentNetwork.devices.filter(d => d.type === 'PC');
        const allPcsHacked = pcs.every(pc => pc.isHacked);

        if (allPcsHacked) {
            await ConsoleUI.print('>>> NETWORK COMPROMISED <<<', 'green');
            await ConsoleUI.print('All nodes under control. Gateway firewall disabled.', 'cyan');
            await ConsoleUI.print('Injecting admin token...', 'gray', 20);
            
            target.isHacked = true;
            session.connectedDevice = target;
            return;
        } else {
            await ConsoleUI.print('Gateway firewall active. Other nodes in subnet are still secure.', 'yellow');
            await ConsoleUI.print('Manual override required.', 'gray');
        }
    }

    // Обычный взлом (мини-игра)
    await ConsoleUI.print(`Initiating handshake with ${ip}...`, 'yellow');
    const success = await HackingMinigame.start(target.password, 4);

    if (success) {
      target.isHacked = true;
      session.connectedDevice = target;
    } else {
      await ConsoleUI.print('Connection refused by remote host.', 'red');
    }
  }
}

export class DisconnectCommand implements ICommand {
  name = 'disconnect';
  aliases = ['dc', 'exit'];
  description = 'Отключиться от текущего устройства';

  async execute(args: string[], session: GameSession): Promise<void> {
    if (session.connectedDevice) {
      await ConsoleUI.print(`Closing connection to ${session.connectedDevice.hostname}...`, 'yellow');
      session.connectedDevice = null;
    } else {
      await ConsoleUI.print('No active connection.', 'gray');
    }
  }
}

// === НОВАЯ КОМАНДА: TUNNEL ===
export class TunnelCommand implements ICommand {
    name = 'tunnel';
    description = 'Пробросить соединение в следующую сеть (Требуется ROOT на Роутере)';

    async execute(args: string[], session: GameSession): Promise<void> {
        // 1. Проверяем, подключены ли мы вообще
        if (!session.connectedDevice) {
            await ConsoleUI.print('Error: Tunneling requires active router connection.', 'red');
            return;
        }

        // 2. Проверяем, что это Роутер
        if (session.connectedDevice.type !== 'ROUTER') {
            await ConsoleUI.print('Error: This device does not support routing protocols.', 'red');
            return;
        }

        // 3. Запускаем переход
        await ConsoleUI.print('Initiating VPN tunneling protocol...', 'cyan');
        
        // Красивая анимация
        const steps = ['Resolving next hop...', 'Handshaking...', 'Encrypting traffic...', 'Establishing link...'];
        for(const step of steps) {
            process.stdout.write(chalk.gray(`> ${step}`));
            await new Promise(r => setTimeout(r, 600));
            process.stdout.write(chalk.green(' [OK]\n'));
        }

        await ConsoleUI.print('\n>>> TUNNEL ESTABLISHED <<<', 'green');
        
        // Вызываем метод перехода уровня в сессии
        await session.nextLevel();
    }
}