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
  private currentLevelDifficulty: number = 1;
  // === SNIFFER STATE ===
  public activeSniffTargetIp: string | null = null;
  private sniffInterval: NodeJS.Timeout | null = null;
  public collectedFragments: Map<string, string[]> = new Map(); // IP -> [фрагменты]


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

  startSniffing(targetIp: string, fragments: string[]) {
      if (this.sniffInterval) {
          clearInterval(this.sniffInterval);
      }
      
      this.activeSniffTargetIp = targetIp;
      this.collectedFragments.set(targetIp, []); // Сброс собранного для этого IP
      
      let index = 0;
      
      // Запускаем таймер (раз в 10 секунд)
      this.sniffInterval = setInterval(async () => {
          if (index >= fragments.length) {
              await ConsoleUI.printAsyncLog(chalk.green(`\n[SNIFFER] Capture complete for ${targetIp}. All packets intercepted.`));
              this.stopSniffing();
              return;
          }

          const frag = fragments[index];
          // Сохраняем фрагмент в инвентарь (мы его как бы "услышали")
          const currentCollection = this.collectedFragments.get(targetIp) || [];
          currentCollection.push(frag);
          this.collectedFragments.set(targetIp, currentCollection);

          // Вывод в консоль "пассивно"
          await ConsoleUI.printAsyncLog(chalk.cyan(`\n[SNIFFER] Intercepted packet from ${targetIp}: "${frag.substring(0, 10)}..."`));
          
          index++;
      }, 10000); // 10 секунд
  }

  stopSniffing() {
      if (this.sniffInterval) {
          clearInterval(this.sniffInterval);
          this.sniffInterval = null;
          this.activeSniffTargetIp = null;
      }
  }

  // При завершении игры или уровня нужно чистить таймер
  cleanup() {
      this.stopSniffing();
  }

// === ПЕРЕХОД НА СЛЕДУЮЩИЙ УРОВЕНЬ ===
  async nextLevel() {
      this.currentLevelDifficulty++;
      
      // Генерируем новый IP подсети (просто +10 к третьему октету)
      // Было 192.168.10 -> станет 192.168.20
      const nextSubnetIp = `192.168.${this.currentLevelDifficulty * 10}`;
      
      // Увеличиваем кол-во ПК с каждым уровнем (сложность растет)
      const minPcs = 2 + this.currentLevelDifficulty; // Ур 2 -> мин 3 ПК
      const maxPcs = 3 + this.currentLevelDifficulty; // Ур 2 -> макс 4 ПК

      const newNetwork = WorldGenerator.generateSubnet(
          nextSubnetIp, 
          this.currentLevelDifficulty, 
          minPcs, 
          maxPcs
      );

      // Добавляем в список сетей
      this.networks.push(newNetwork);
      this.currentNetwork = newNetwork;
      
      // Отключаемся от старого роутера
      this.connectedDevice = null;

      await new Promise(r => setTimeout(r, 1000));
      console.clear();
      
      // Приветствие нового уровня
      const header = `=== ENTERING SECTOR ${nextSubnetIp} [LEVEL ${this.currentLevelDifficulty}] ===`;
      await ConsoleUI.print(header, 'cyan');
      await ConsoleUI.print(`Security Level: ${this.currentLevelDifficulty}`, 'yellow');
      await ConsoleUI.print('Scanning for nearby nodes...', 'gray');
      
      // Автоматически делаем скан для удобства
      await this.cmdProcessor.process('scan', this);
  }
static async createNewGame(): Promise<GameSession> {
    // УРОВЕНЬ 1: Генерируем сеть с 2-3 ПК
    const startNet = WorldGenerator.generateSubnet('192.168.10', 1, 2, 3);
    const session = new GameSession([startNet]);
    
    TutorialManager.stop();
    console.clear();
    await ConsoleUI.print('System initialized. Connection established to Sector 192.168.10.', 'green');
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
      await TutorialManager.checkProgress(input.split(' ')[0], '');
    }
    
    ConsoleUI.closeRawMode();
  }
}