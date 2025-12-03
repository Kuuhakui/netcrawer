import { INetwork } from '../interfaces/INetwork';
import { IDevice } from '../interfaces/IDevice';
import { WorldGenerator } from '../services/WorldGenerator';
import { ConsoleUI } from '../ui/ConsoleUI';
import { CommandProcessor } from './CommandProcessor';
import { StorageService } from '../services/Storage';
import { TutorialManager } from './TutorialManager';
import chalk from 'chalk';
const { v4: uuidv4 } = require('uuid');

export class GameSession {
  public networks: INetwork[] = [];
  public currentNetwork: INetwork;
  public connectedDevice: IDevice | null = null;
  public playerDevice: IDevice; 
  private cmdProcessor: CommandProcessor;
  private isRunning: boolean = false;

  constructor(networks: INetwork[], playerDevice?: IDevice) {
    this.networks = networks;
    this.currentNetwork = networks[0];
    this.cmdProcessor = new CommandProcessor();
    
    this.playerDevice = playerDevice || {
        id: 'player-local',
        ip: '127.0.0.1',
        hostname: 'localhost',
        type: 'PC',
        os: 'NetCrawler OS',
        isOnline: true,
        isHacked: true,
        password: '',
        ports: [],
        files: []
    };
  }

  // === ОБЫЧНАЯ ИГРА (БЕЗ ТУТОРИАЛА) ===
  static async createNewGame(): Promise<GameSession> {
    // Генерируем случайную сеть (сложность 1)
    const startNet = WorldGenerator.generateSubnet('10.0.0', 1);
    const session = new GameSession([startNet]);
    
    // Принудительно отключаем туториал, если он был включен
    // (нужно добавить метод stop() в TutorialManager или просто не запускать его)
    // В TutorialManager добавь метод static stop() { this.isActive = false; }
    TutorialManager.stop(); 
    
    console.clear();
    await ConsoleUI.print('System initialized. Random world generated.', 'green');
    return session;
  }

  // === ТУТОРИАЛ (ФИКСИРОВАННЫЙ УРОВЕНЬ) ===
  static async createTutorial(): Promise<GameSession> {
    // Генерируем специальную сеть
    const tutorialNet = WorldGenerator.generateTutorialNetwork();
    const session = new GameSession([tutorialNet]);
    
    // Запускаем менеджер обучения
    TutorialManager.start();
    console.clear(); 
    await TutorialManager.checkProgress('', ''); 
    
    return session;
  }

  static async load(): Promise<GameSession> {
    const networks = await StorageService.loadNetworks();
    if (networks.length === 0) throw new Error('No saves');
    TutorialManager.stop(); // При загрузке туториал обычно не нужен, если не сохраняем его состояние
    console.clear();
    return new GameSession(networks);
  }

  async startLoop() {
    this.isRunning = true;
    ConsoleUI.initRawMode(); 

    while (this.isRunning) {
      const user = this.connectedDevice ? 'root' : 'guest';
      const host = this.connectedDevice ? this.connectedDevice.hostname : this.playerDevice.hostname;
      const path = '~';
      
      const promptStr = `${chalk.green(user)}@${chalk.blue(host)}:${chalk.yellow(path)}$ `;
      
      const input = await ConsoleUI.promptShell(promptStr);
      
      if (!input) continue;

      if (input === 'exit' && !this.connectedDevice) {
        this.isRunning = false;
        break;
      }

      await this.cmdProcessor.process(input, this);
      
      // Проверяем туториал (он сам проверит isActive внутри)
      await TutorialManager.checkProgress(input.split(' ')[0], '');
    }
    
    ConsoleUI.closeRawMode();
  }
}