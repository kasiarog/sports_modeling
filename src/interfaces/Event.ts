import { Contestant } from "../Contestant";

export class Event {
    name: string;
    date: Date;
    description: string;
    contestant: Contestant;
    points?: number;

    constructor(name: string, date: Date, description: string, contestant: Contestant, points?: number) {
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
    getContestant(): Contestant {
        return this.contestant;
    }
    getPoint(): number {
        return this.points ? this.points : 0;
    }
}
