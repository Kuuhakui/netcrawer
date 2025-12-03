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
    console.log(chalk.bold('IP ADDRESS      HOSTNAME           STATUS'));
    console.log(chalk.white('------------------------------------------------'));
    
    for (const dev of session.currentNetwork.devices) {
        const status = dev.isHacked ? chalk.green('PWNED') : chalk.red('SECURE');
        console.log(`${chalk.cyan(dev.ip.padEnd(15))} ${dev.hostname.padEnd(18)} [${status}]`);
    }
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

    if (target.isHacked) {
      session.connectedDevice = target;
      await ConsoleUI.print(`Access granted to ${target.hostname}.`, 'green');
      return;
    }

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