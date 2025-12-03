import { ConsoleUI } from '../ui/ConsoleUI';
import chalk from 'chalk';

export class CipherMechanics {
  
  // === CAESAR CIPHER ===
  static caesarEncrypt(text: string, shift: number): string {
    return text.split('').map(char => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const base = (code >= 65 && code <= 90) ? 65 : 97;
        return String.fromCharCode(((code - base + shift) % 26) + base);
      }
      return char;
    }).join('');
  }

  static caesarDecrypt(text: string, shift: number): string {
    return this.caesarEncrypt(text, (26 - shift) % 26);
  }

  static generateXORPuzzle() {
    // Генерируем два числа от 0 до 255 (1 байт)
    const val1 = Math.floor(Math.random() * 255);
    const val2 = Math.floor(Math.random() * 255);
    const answer = val1 ^ val2;
    
    return {
      val1Bin: val1.toString(2).padStart(8, '0'),
      val2Bin: val2.toString(2).padStart(8, '0'),
      answerBin: answer.toString(2).padStart(8, '0')
    };
  }

  static substitutionEncrypt(text: string): { encrypted: string, key: string } {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const shuffled = alphabet.split('').sort(() => 0.5 - Math.random()).join('');
    
    const map = new Map<string, string>();
    for (let i = 0; i < alphabet.length; i++) {
      map.set(alphabet[i], shuffled[i]);
      map.set(alphabet[i].toLowerCase(), shuffled[i].toLowerCase());
    }

    const result = text.split('').map(char => map.get(char) || char).join('');
    return { encrypted: result, key: shuffled };
  }
}