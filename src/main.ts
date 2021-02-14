import AuthService from './services/auth.service';
import Console from './services/consoleHandling.service';
import Menu from './services/menu.service';

(async () => {

    do {
        await AuthService.logIn();
    }
    while (!AuthService.isLoggedIn());

    Console.print(`Willkommen, ${AuthService.isAdmin() ? 'Admin' : 'Gast'}!`);
    Menu.showMainMenu();
})();

