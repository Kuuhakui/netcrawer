import { GameSession } from './GameSession';
import { ConsoleUI } from '../ui/ConsoleUI';
import { ICommand } from './commands/ICommand';
// Импортируем наши команды
import { ScanCommand, ConnectCommand, DisconnectCommand, TunnelCommand, SniffCommand } from './commands/NetworkCommands';
import { LsCommand, CatCommand, DecryptCommand, DownloadCommand } from './commands/FileCommands';
import { ManCommand, ClearCommand, HelpCommand } from './commands/SystemCommands'; // <-- Импорт новых команд
import chalk from 'chalk';

export class CommandProcessor {
  private commands: Map<string, ICommand> = new Map();

  constructor() {
    this.registerCommands();
  }

  private registerCommands() {
    const cmdList: ICommand[] = [
      // Сеть
      new ScanCommand(),
      new ConnectCommand(),
      new DisconnectCommand(),
      new TunnelCommand(),
      new SniffCommand(),
      
      // Файлы
      new LsCommand(),
      new CatCommand(),
      new DecryptCommand(),
      new DownloadCommand(),

      // Система
      new ManCommand(),   // <-- MAN
      new ClearCommand(), // <-- CLEAR
      new HelpCommand(),  // <-- HELP
    ];

    cmdList.forEach(cmd => {
      this.commands.set(cmd.name, cmd);
      if (cmd.aliases) {
        cmd.aliases.forEach(alias => this.commands.set(alias, cmd));
      }
    });
  }

  async process(input: string, session: GameSession): Promise<void> {
    const parts = input.trim().split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Особая обработка для exit, так как она влияет на цикл сессии напрямую
    if (commandName === 'exit') {
        // Мы позволяем GameSession обработать это в цикле, 
        // но если нужно выполнить команду disconnect перед выходом:
        if (session.connectedDevice) {
             const dc = new DisconnectCommand();
             await dc.execute([], session);
             return; 
        }
        return; // Возвращаем управление в loop, там сработает break
    }

    const command = this.commands.get(commandName);

    if (command) {
      await command.execute(args, session);
    } else {
      await ConsoleUI.print(`Command '${commandName}' not found. Type 'help' or 'man'.`, 'red');
    }
  }
}