import ConsoleHandling from "./consoleHandling.service";


class AuthService {

    private static instance: AuthService = new AuthService();

    private static readonly ADMIN_PASSWORD: string = "admin";

    private _isLoggedIn: boolean = false;
    private _isAdmin: boolean = false;


    constructor() {
        if (AuthService.instance) {
            throw new Error("Instance of AuthenticationService already existing");
        }
        AuthService.instance = this;
    }

    public static getInstance(): AuthService {
        return AuthService.instance;
    }

    public async logIn(): Promise<void> {
        return ConsoleHandling.showPossibilities([
            "1. Als Gast fortfahren",
            "2. Als Admin fortfahren"
        ], "Wie möchten Sie fortfahren? ").then(answer => {
            switch (answer) {
                case "1":
                    this._isAdmin = false;
                    this._isLoggedIn = true;

                    return;
                case "2":
                    return this.checkPassword();
                default:
                    return;
            }
        });
    }

    private async checkPassword(): Promise<void> {
        return ConsoleHandling.question("Passwort: ").then(answer => {
            if (answer === AuthService.ADMIN_PASSWORD) {
                this._isAdmin = true;
                this._isLoggedIn = true;
            }
            else {
                this._isAdmin = false;
                this._isLoggedIn = false;
                ConsoleHandling.print("Passwort falsch. Try (admin) again!");
            }
        });
    }

    public isAdmin(): boolean {
        return this._isAdmin;
    }

    public isLoggedIn(): boolean {
        return this._isLoggedIn;
    }
}

export default AuthService.getInstance();