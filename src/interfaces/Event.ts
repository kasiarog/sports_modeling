import { Contestant } from "../Contestant";

export class Event {
    name: string;
    date: Date;
    description: string;
    contestant?: Contestant;
    opponent?: Contestant;
    points?: number;

    constructor(name: string, date: Date, description: string, contestant: Contestant, opponent: Contestant, points?: number) {
        this.name = name;
        this.date = date;
        this.description = description;
        this.contestant = contestant;
        this.opponent = opponent;
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
    getContestant(): Contestant | undefined {
        return this.contestant;
    }
    getOpponent(): Contestant | undefined {
        return this.opponent;
    }
    getPoint(): number {
        return this.points ? this.points : 0;
    }
}
