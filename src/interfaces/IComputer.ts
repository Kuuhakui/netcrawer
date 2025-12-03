export interface IComputer {
  id: string;
  ip: string;
  hostname: string;
  os: 'Windows Server' | 'Ubuntu Linux' | 'CentOS' | 'macOS';
  ports: { port: number; service: string; isOpen: boolean }[]; // Детальные порты
  vulnerabilities: string[];
  securityLevel: 1 | 2 | 3; // 1 - легко, 3 - сложно
  password: string; // Пароль для доступа
  isOnline: boolean;
  isHacked: boolean; // Получен ли доступ
}