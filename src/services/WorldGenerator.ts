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
    ];
    
    // Берем случайный файл и решаем, шифровать его или нет
    const base = rawFiles[Math.floor(Math.random() * rawFiles.length)];
    const shouldEncrypt = Math.random() > 0.5;

    if (shouldEncrypt) {
        // 50/50 между Цезарем и XOR
        const type = Math.random() > 0.5 ? 'CAESAR' : 'XOR';
        
        if (type === 'CAESAR') {
            const shift = Math.floor(Math.random() * 10) + 1;
            const encrypted = CipherMechanics.caesarEncrypt(base.content, shift);
            return [{
                ...base,
                content: encrypted,
                originalContent: base.content,
                encryption: 'CAESAR',
                encryptionKey: shift
            }];
        } else {
            // XOR просто блокирует контент "бинарным мусором" пока не решишь
            return [{
                ...base,
                content: '[BINARY LOCK ACTIVE] - 010101... (Use decipher)',
                originalContent: base.content,
                encryption: 'XOR',
                encryptionKey: 0 // Ключ генерируется динамически при взломе
            }];
        }
    }

    return [{ ...base, originalContent: base.content, encryption: 'NONE' }];
  }

  static generateTutorialNetwork(): INetwork {
      const devices: IDevice[] = [];
      const subnetBase = '192.168.0';

      // 1. Создаем целевой компьютер для обучения
      // Файл с Цезарем (простой сдвиг 1)
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
          password: 'USER', // Простой пароль для брутфорса
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

      // Роутер (формальный)
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
          subnet: subnetBase,
          difficulty: 0,
          devices: devices,
          routerGatewayIp: '192.168.0.1'
      };
  }

  static generateSubnet(subnetBase: string, difficulty: number, nextSubnetId?: string): INetwork {
    const devices: IDevice[] = [];
    const routerPassword = this.generateRouterKey();
    const keyParts = routerPassword.split('-');

    const pcCount = 3 + Math.floor(Math.random() * 4);
    
    for (let i = 1; i <= pcCount; i++) {
      const ip = `${subnetBase}.${i + 10}`;
      let files = this.generateFlavorFiles();
      
      // Добавляем сюжетный файл (фрагмент ключа) с шифрованием SUBSTITUTION (самый сложный)
      if (keyParts.length > 0) {
        const part = keyParts.shift();
        const clearText = `GATEWAY KEY FRAGMENT: "${part}"`;
        const { encrypted, key } = CipherMechanics.substitutionEncrypt(clearText);
        
        files.push({
            name: `secure_frag_${i}.enc`, 
            content: encrypted, 
            originalContent: clearText,
            encryption: 'SUBSTITUTION',
            encryptionKey: key 
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

    // Router creation (без изменений, кроме добавления password в качестве ключа)
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
      files: [],
      connectedSubnetId: nextSubnetId
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

  private static generateRouterKey(): string {
    const p1 = Math.floor(Math.random() * 90 + 10);
    const p2 = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Math.floor(Math.random()*9);
    const p3 = ['XK', 'QZ', 'AB', 'MV'][Math.floor(Math.random()*4)];
    return `${p2}-${p1}-${p3}`;
  }
}