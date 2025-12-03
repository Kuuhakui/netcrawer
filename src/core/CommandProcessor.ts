import { GameSession } from './GameSession';
import { ConsoleUI } from '../ui/ConsoleUI';
import { ICommand } from './commands/ICommand';
import { ScanCommand, ConnectCommand, DisconnectCommand } from './commands/NetworkCommands';
import { LsCommand, CatCommand, DecryptCommand, DownloadCommand } from './commands/FileCommands';
import chalk from 'chalk';

export class CommandProcessor {
  private commands: Map<string, ICommand> = new Map();

  constructor() {
    this.registerCommands();
  }

  private registerCommands() {
    const cmdList: ICommand[] = [
      new ScanCommand(),
      new ConnectCommand(),
      new DisconnectCommand(),
      new LsCommand(),
      new CatCommand(),
      new DecryptCommand(),
      new DownloadCommand(),
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

    if (commandName === 'help') {
        this.showHelp();
        return;
    }
    
    if (commandName === 'clear') {
        console.clear();
        return;
    }

    const command = this.commands.get(commandName);

    if (command) {
      await command.execute(args, session);
    } else {
      await ConsoleUI.print(`Command '${commandName}' not found. Type 'help'.`, 'red');
    }
  }

  private showHelp() {
    console.log(chalk.yellow('\n=== AVAILABLE COMMANDS ==='));
    // Выводим только уникальные команды (без алиасов для красоты)
    const uniqueCmds = new Set<ICommand>(this.commands.values());
    
    uniqueCmds.forEach(cmd => {
        console.log(`${chalk.green(cmd.name.padEnd(12))} - ${cmd.description}`);
    });
    console.log('==========================');
  }
}