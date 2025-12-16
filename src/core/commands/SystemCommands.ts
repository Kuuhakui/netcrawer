import { ICommand } from './ICommand';
import { GameSession } from '../GameSession';
import { ConsoleUI } from '../../ui/ConsoleUI';
import { ManualSystem } from '../ManualSystem';
import chalk from 'chalk';

export class ManCommand implements ICommand {
  name = 'man';
  description = 'Открыть руководство пользователя';

  async execute(args: string[], session: GameSession): Promise<void> {
    const topic = args[0];
    await ManualSystem.showTopic(topic);
  }
}

export class HelpCommand implements ICommand {
    name = 'help';
    description = 'Список доступных команд';

    async execute(args: string[], session: GameSession): Promise<void> {
        // Мы не можем вызвать showHelp из CommandProcessor напрямую,
        // поэтому выведем базовую справку или список через man
        console.log(chalk.yellow('Используйте "man basics" для обучения.'));
        console.log('Доступные команды: scan, connect, ls, cat, decrypt, download, sniff, man, exit');
    }
}

export class ClearCommand implements ICommand {
    name = 'clear';
    description = 'Очистить терминал';

    async execute(args: string[], session: GameSession): Promise<void> {
        console.clear();
    }
}

export class ExitCommand implements ICommand {
    name = 'exit';
    description = 'Выйти из игры';

    async execute(args: string[], session: GameSession): Promise<void> {
        // Логика выхода обрабатывается в GameSession, тут просто подтверждение
        await ConsoleUI.print('Shutting down...', 'red');
        // Флаг остановки ставится в GameSession по возврату, 
        // но можно просто использовать process.exit(0) если нужно срочно
    }
}