export class Event {
    name: string;
    date: Date;
    description: string;
    contestant: string;
    points?: number;

    constructor(name: string, date: Date, description: string,contestant: string, points?: number) {
        this.name = name;
        this.date = date;
        this.description = description;
        this.contestant = contestant;
        this.points = points;
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
    getContestant(): string {
        return this.contestant;
    }
    getPoint(): number {
        return this.points ? this.points : 0;
    }
}
