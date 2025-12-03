import { IFile } from './IFileSystem';

export type DeviceType = 'PC' | 'ROUTER';

export interface IDevice {
  id: string;
  ip: string;
  hostname: string;
  type: DeviceType;
  os: string;
  
  // Безопасность
  ports: { port: number; service: string; isOpen: boolean }[];
  isOnline: boolean;
  isHacked: boolean;
  password: string; // Пароль (для ПК - для SSH, для Роутера - спец. ключ)
  
  // Для ПК
  files: IFile[];
  
  // Для Роутера
  connectedSubnetId?: string; // ID подсети, куда ведет этот роутер
}