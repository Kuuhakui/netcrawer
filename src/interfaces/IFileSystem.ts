export type EncryptionType = 'NONE' | 'CAESAR' | 'XOR' | 'VIGENERE' | 'SUBSTITUTION';

export interface IFile {
  name: string;
  content: string;
  originalContent: string; // Контент после расшифровки
  encryption: EncryptionType;
  encryptionKey?: number | string; // Может быть числом (Цезарь) или строкой (Виженер)
}