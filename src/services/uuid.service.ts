import { v5 as uuidv5 } from 'uuid';

class UuidService {

    private static instance: UuidService = new UuidService();

    // https://www.uuidgenerator.net/
    private static readonly UUID_NAMESPACE: string = "e9f3af14-3385-4841-b1fe-aebd0c9a4c88";

    constructor(){
        if(UuidService.instance){
            throw new Error("Instance of UuidService already existing");
        }
        UuidService.instance = this;
    }

    public static getInstance(): UuidService{
        return UuidService.instance;
    }

    public generateUuidFromString(input: string){
        return uuidv5(input, UuidService.UUID_NAMESPACE);
    }
}
export default UuidService.getInstance();