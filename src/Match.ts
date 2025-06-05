import { Contestant } from "./Contestant";
import { Event } from "./interfaces/Event";
import { Result } from "./interfaces/Result";
import { History } from "./History";
import { EventFactory } from "./Event/EventFactory";

export class Match {
  private date: Date;
  private contestantA: Contestant;
  private contestantB: Contestant;
  private observer: Result;
  private matchHistory: History = new History();

  constructor(
    date: Date,
    contestantA: Contestant,
    contestantB: Contestant,
    observer: Result
  ) {
    this.date = date;
    this.contestantA = contestantA;
    this.contestantB = contestantB;
    this.observer = observer;
  }

  getDate(): Date {
    return this.date;
  }

  getContestantA(): Contestant {
    return this.contestantA;
  }

  getContestantB(): Contestant {
    return this.contestantB;
  }

  getObserver(): Result {
    return this.observer;
  }

  addEvent(event: Event): void {
    this.matchHistory.addEvent(event);
  }

  getEvents(): Event[] {
    return this.matchHistory.getEvents();
  }
  createEvent(
    name: string,
    description: string,
    contestant?: Contestant,
    point?: number
  ) {
    EventFactory.createEvent(this, name, description, contestant, point);
  }

  printScoreboard(): void {
    console.log("\n--- All Match Events ---\n");
    this.matchHistory.printHistory();
    console.log("\n--- Current Score ---\n");
    this.observer.getCurrentResult();
  }
}
