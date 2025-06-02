import { Contestant } from "../Contestant";
import { Event } from "../interfaces/Event";
export class HistoryEvent implements Event {
  name: string;
  date: Date;
  description: string;
  contestant?: Contestant;
  opponent?: Contestant;

  constructor(
    name: string,
    date: Date,
    description: string,
    contestant?: Contestant,
    opponent?: Contestant
  ) {
    this.name = name;
    this.date = date;
    this.description = description;
    this.contestant = contestant;
    this.opponent = opponent;
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
        return 0;
    }
}