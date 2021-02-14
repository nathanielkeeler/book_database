import Console from "./consoleHandling.service";
import DB from "./bookDatabase.service";
import AuthService from "./auth.service";

class MenuService {

    private static instance: MenuService = new MenuService();

    constructor(){
        if(MenuService.instance){
            throw new Error("Instance of MenuService already existing");
        }
        MenuService.instance = this;
    }

    public static getInstance(): MenuService {
        return MenuService.instance;
    }

    public async showMainMenu(): Promise<void> {
        const options: string[] = [
            "1. Alle Bücher mit Autor und Release-Datum",
            "2. Buch suchen",
            "3. Autor suchen",
            "4. Genre suchen"
        ];

        const isAdmin: boolean = AuthService.isAdmin();

        if(isAdmin){
            options.push("\n5. Administratorbereich");
        }

        let answer: String = await Console.showPossibilities(options, "Wählen Sie eine Funktion: ");

        switch (answer) {
            case "1":
                DB.showAllBooksInDb();
                break;
            case "2":
                await DB.searchForBook();
                break;
            case "3":
                await DB.searchForAuthor();
                break;
            case "4":
                await DB.searchForGenre();
                break;
            case "5":
                if(isAdmin){
                    await this.showAdminMenu();
                }
                break;
            default:
                break;
        }
        await this.goToMainMenu();
    }

    private async goToMainMenu(): Promise<void> {
        let answer: String = await Console.question("Drücken Sie eine beliebige Taste um fortzufahren. ");
        switch (answer.toLowerCase()) {
            default:
                this.showMainMenu();
                break;
        }
    }

    private async showAdminMenu(): Promise<void> {

        if(!AuthService.isAdmin())
            return;

        const options: string[] = [
            "1. Autor erstellen",
            "2. Rubrik erstellen" 
        ];

        const authorsExisting: boolean = DB.getAuthors().length > 0;
        if(authorsExisting){
            options.push("3. Buch erstellen");
        }

        let answer: String = await Console.showPossibilities(options, "Wählen Sie eine Funktion: ");
        switch (answer) {
            case "1":
                await DB.createAuthor();
                break;
            case "2":
                await DB.createGenre();
                break;
            case "3":
                if(authorsExisting){
                    await DB.createBook();
                }
                break;
            default:
                break;
        }
    }
}
export default MenuService.getInstance();