const { v4: uuidv4 } = require('uuid');
import { IDevice } from '../interfaces/IDevice';
import { INetwork } from '../interfaces/INetwork';
import { IFile } from '../interfaces/IFileSystem';
import { CipherMechanics } from '../mechanics/CipherMechanics';

export class WorldGenerator {
  
  private static generateFlavorFiles(): IFile[] {
    const rawFiles = [
      { name: 'todo.txt', content: '1. Buy milk\n2. Fix server\n3. Call Mom' },
      { name: 'project_x.log', content: 'Prototype failed. Adjusting voltage.' },
      { name: 'salary.csv', content: 'John: 5000\nAlice: 6000\nBob: 200' },
      { name: 'notes.txt', content: 'Meeting at 10 AM. Don\'t be late.' },
      { name: 'config.yaml', content: 'host: localhost\nport: 8080\ndebug: true' },
    ];
    
    // Берем случайный файл
    const base = rawFiles[Math.floor(Math.random() * rawFiles.length)];
    const shouldEncrypt = Math.random() > 0.4; // 60% шанс шифрования

    if (shouldEncrypt) {
        // Для обычных файлов чередуем Цезаря и XOR
        const type = Math.random() > 0.5 ? 'CAESAR' : 'XOR';
        
        if (type === 'CAESAR') {
            const shift = Math.floor(Math.random() * 10) + 1;
            const encrypted = CipherMechanics.caesarEncrypt(base.content, shift);
            return [{
                ...base,
                content: encrypted,
                originalContent: base.content,
                encryption: 'CAESAR' as const,
                encryptionKey: shift
            }];
        } else {
            // XOR скрывает контент заглушкой
            return [{
                ...base,
                content: '[BINARY ENCRYPTED DATA]',
                originalContent: base.content,
                encryption: 'XOR' as const,
                encryptionKey: 0 
            }];
        }
    }

    return [{ ...base, originalContent: base.content, encryption: 'NONE' as const }];
  }

static generateSubnet(subnetBase: string, difficulty: number, minPcs: number = 3, maxPcs: number = 5): INetwork {
    const devices: IDevice[] = [];
    const routerPassword = this.generateRouterKey();
    const keyParts = routerPassword.split('-');

    // Генерируем количество ПК в заданном диапазоне
    const pcCount = Math.floor(Math.random() * (maxPcs - minPcs + 1)) + minPcs;
    
    for (let i = 1; i <= pcCount; i++) {
      const ip = `${subnetBase}.${i + 10}`;
      let files = this.generateFlavorFiles();
      
      if (keyParts.length > 0) {
        const part = keyParts.shift();
        const clearText = `GATEWAY KEY FRAGMENT: "${part}"`;
        
        files.push({
            name: `secure_frag_${i}.enc`, 
            content: '[LOCKED BITSTREAM]', 
            originalContent: clearText,
            encryption: 'XOR' as const, 
            encryptionKey: 0 
        });
      }

      devices.push({
        id: uuidv4(),
        ip,
        hostname: `WORKSTATION-${i}`,
        type: 'PC',
        os: 'Windows 10',
        isOnline: true,
        isHacked: false,
        password: Math.random().toString(36).slice(-6).toUpperCase(),
        ports: [{ port: 22, service: 'ssh', isOpen: true }, { port: 80, service: 'http', isOpen: true }],
        files: files
      });
    }

    const gatewayIp = `${subnetBase}.1`;
    devices.push({
      id: uuidv4(),
      ip: gatewayIp,
      hostname: 'GATEWAY-ROUTER',
      type: 'ROUTER',
      os: 'Cisco IOS',
      isOnline: true,
      isHacked: false,
      password: routerPassword,
      ports: [{ port: 80, service: 'http', isOpen: true }, { port: 443, service: 'admin-panel', isOpen: true }],
      // Добавляем подсказку в файлы роутера
      files: [
          {
              name: 'routing_table.log', 
              content: 'To access next sector, initiate tunnelling protocol.\nCommand: tunnel <confirm>',
              originalContent: '',
              encryption: 'NONE' as const
          }
      ], 
    });

    return {
      id: uuidv4(),
      name: `Sector ${subnetBase}`,
      subnet: subnetBase,
      difficulty,
      devices,
      routerGatewayIp: gatewayIp
    };
  }

  // Для туториала (IFile типы)
  static generateTutorialNetwork(): INetwork {
    const devices: IDevice[] = [];
    const secretContent = "TUTORIAL COMPLETE. PASSWORD: ADMIN";
    const encryptedContent = CipherMechanics.caesarEncrypt(secretContent, 1);

    const targetPC: IDevice = {
        id: uuidv4(),
        ip: '192.168.0.10',
        hostname: 'TRAINING-TARGET',
        type: 'PC',
        os: 'TestOS',
        isOnline: true,
        isHacked: false,
        password: 'USER',
        ports: [{ port: 22, service: 'ssh', isOpen: true }],
        files: [
            {
                name: 'readme.txt',
                content: 'Welcome, cadet. Your task is to decrypt the secret file.',
                originalContent: '',
                encryption: 'NONE' as const
            },
            {
                name: 'secret_data.enc',
                content: encryptedContent,
                originalContent: secretContent,
                encryption: 'CAESAR' as const,
                encryptionKey: 1
            }
        ]
    };

    devices.push(targetPC);

    // Роутер
    devices.push({
      id: uuidv4(),
      ip: '192.168.0.1',
      hostname: 'GATEWAY',
      type: 'ROUTER',
      os: 'RouterOS',
      isOnline: true,
      isHacked: false,
      password: 'ADMIN',
      ports: [{port: 80, service: 'http', isOpen: true}],
      files: [],
    });

    return {
        id: uuidv4(),
        name: 'Training Ground',
        subnet: '192.168.0',
        difficulty: 0,
        devices: devices,
        routerGatewayIp: '192.168.0.1'
    };
  }

 private static generateRouterKey(): string {
    const p1 = Math.floor(Math.random() * 90 + 10);
    const p2 = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Math.floor(Math.random()*9);
    const p3 = ['XK', 'QZ', 'AB', 'MV'][Math.floor(Math.random()*4)];
    return `${p2}-${p1}-${p3}`;
  }
}