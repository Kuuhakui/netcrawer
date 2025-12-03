import { IDevice } from './IDevice';

export interface INetwork {
  id: string;
  name: string;
  subnet: string; // например '192.168.1.x'
  difficulty: number;
  devices: IDevice[];
  routerGatewayIp: string; // IP роутера в этой сети
}