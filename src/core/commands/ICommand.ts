import { GameSession } from '../GameSession';

export interface ICommand {
  // Имя команды (например, 'scan')
  name: string;
  // Альтернативные имена (например, 'ls' и 'dir')
  aliases?: string[];
  // Описание для help
  description: string;
  // Логика выполнения
  execute(args: string[], session: GameSession): Promise<void>;
}