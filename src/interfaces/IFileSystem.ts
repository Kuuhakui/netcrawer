export type EncryptionType = 'NONE' | 'CAESAR' | 'XOR' | 'SUBSTITUTION';

export interface IFile {
  name: string;
  content: string; // Здесь лежит текст (зашифрованный или открытый)
  originalContent: string; // Оригинал для восстановления после взлома
  encryption: EncryptionType;
  encryptionKey?: number | string; // Ключ (смещение для Цезаря, байт для XOR и т.д.)
}