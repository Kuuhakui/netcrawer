import { ConsoleUI } from './ui/ConsoleUI';
import { GameSession } from './core/GameSession';
import { SettingsManager } from './core/SettingsManager';
import chalk from 'chalk';

export async function startApp() {
  let running = true;

  // Логотип показываем один раз при запуске с эффектом
  console.clear();
  const logo = `
    _   _      _    _____rawler 
   | \\ | | ___| |_ / ____|      
   |  \\| |/ _ \\ __| |     v0.3  
   | . \` |  __/ |_| |____       
   |_| \\_|\\___|\\__ \\_____|      
  `;
  
  // Для логотипа форсируем скорость чуть побыстрее, чтобы не ждать вечность (5мс)
  await ConsoleUI.print(logo, 'cyan', 5);
  await ConsoleUI.print('System initialized...', 'gray');
  await new Promise(r => setTimeout(r, 500));

  while (running) {
    console.clear();
    // Повторяем лого (но уже без задержки, мгновенно)
    console.log(chalk.cyan(logo));
    
    // Меню теперь будет печататься с текущей скоростью из настроек
    const choice = await ConsoleUI.menu('ГЛАВНОЕ МЕНЮ', [
      'Новая игра (Случайная генерация)',
      'Обучение (Рекомендуется новичкам)',
      'Загрузить профиль',
      'Настройки',
      'Выход'
    ]);

    try {
      let session: GameSession | null = null;

      switch (choice) {
        case '1': // New Game
          session = await GameSession.createNewGame();
          break;

        case '2': // Tutorial
          session = await GameSession.createTutorial();
          break;

        case '3': // Load
          try {
            session = await GameSession.load();
            await ConsoleUI.print('>>> СЕССИЯ ВОССТАНОВЛЕНА <<<', 'green');
          } catch (e) {
            await ConsoleUI.print('ОШИБКА: Нет доступных сохранений.', 'red');
            await new Promise(r => setTimeout(r, 1500));
          }
          break;

        case '4': // Settings
          // Вызываем наш новый менеджер настроек
          await SettingsManager.openSettingsMenu();
          break;

        case '5': // Exit
          running = false;
          break;
      }

      if (session) {
          await session.startLoop();
      }

    } catch (error) {
      console.error('CRITICAL ERROR:', error);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  ConsoleUI.close();
  console.log('Terminal shut down.');
}