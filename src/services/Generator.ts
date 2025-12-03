const { v4: uuidv4 } = require('uuid');
import { IDevice } from '../interfaces/IDevice';
import { INetwork } from '../interfaces/INetwork';

// Этот генератор упрощенный, используется для совместимости
export class Generator {
  
  static generateSimpleDevice(ip: string): IDevice {
    return {
      id: uuidv4(),
      ip,
      hostname: `LEGACY-HOST-${Math.floor(Math.random() * 100)}`,
      type: 'PC', // Обязательно указываем тип
      os: 'Windows XP',
      isOnline: true,
      isHacked: false,
      securityLevel: 1, // Поле из IComputer (если оно есть в IDevice, если нет - убери)
      password: 'admin',
      ports: [{ port: 80, service: 'http', isOpen: true }],
      vulnerabilities: ['weak-auth'],
      files: [] 
    } as any; 
  }

  static generateNetwork(subnet: string, num: number): INetwork {
    const devices: IDevice[] = [];
    for(let i=0; i<num; i++) {
        devices.push(this.generateSimpleDevice(`${subnet}.${i+2}`));
    }

    return {
      id: uuidv4(),
      name: 'Legacy Network',
      subnet,
      difficulty: 1,
      devices: devices,
      routerGatewayIp: `${subnet}.1`
    };
  }
}