export class Event {
    name: string;
    date: Date;
    description: string;

    constructor(name: string, date: Date, description: string){
        this.name = name;
        this.date = date;
        this.description = description;
    }

    getName(): string {
        return this.name;
    }
    getDate(): Date {
        return this.date;
    }
    getDescription(): string {
        return this.description;
    }
}
