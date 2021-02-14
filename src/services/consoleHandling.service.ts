import { resolve } from 'path';
import * as readline from 'readline';
import AuthService from './auth.service';

class ConsoleHandlingService {
    private static instance: ConsoleHandlingService = new ConsoleHandlingService()

    // logger object with syslog levels as specified loglevels
    // logs into build_service.log in directory log and onto console of running node.js process
    private consoleLine: readline.ReadLine = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    constructor() {
        if (ConsoleHandlingService.instance)
            throw new Error("Use ConsoleHandling.Instance() instead new ConsoleHandling()")
        ConsoleHandlingService.instance = this
    }

    public static getInstance(): ConsoleHandlingService {
        return ConsoleHandlingService.instance
    }

    public question(question: String): Promise<String> {
        let answer: String = "";
        return new Promise((resolve) => {
            this.consoleLine.question(question.toString(), (_answer: string) => {
                answer = _answer;
                resolve(answer);
            })
        });
    }

    public showPossibilities(showPossibilities: String[], question: String): Promise<String> {
        this.consoleLine.write("\n");
        for (let possibility of showPossibilities) {
            this.consoleLine.write(possibility.toString());
            this.consoleLine.write("\n")
        }
        this.consoleLine.write("\n");

        return new Promise((resolve) => this.consoleLine.question(question.toString(), (answer: string) => {
            resolve(answer);
        }));
    }

    public print(input: string = "") {
        this.consoleLine.write(input);
        this.consoleLine.write("\n");
    }

    public closeConsole() {
        this.consoleLine.close();
    }
}

export default ConsoleHandlingService.getInstance();