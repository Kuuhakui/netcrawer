import fs from 'fs/promises';
import { INetwork } from '../interfaces/INetwork';
import { SAVE_FILE } from '../config/settings';

export class StorageService {
  static async saveNetworks(networks: INetwork[]): Promise<void> {
    try {
      const data = JSON.stringify(networks, null, 2);
      await fs.writeFile(SAVE_FILE, data, 'utf8');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  }

  static async loadNetworks(): Promise<INetwork[]> {
    try {
      await fs.access(SAVE_FILE);
      const data = await fs.readFile(SAVE_FILE, 'utf8');
      return JSON.parse(data) as INetwork[];
    } catch (error) {
      return [];
    }
  }
}