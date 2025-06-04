import { Contestant } from "./Contestant";
import { Event } from "./interfaces/Event";
import { Result } from "./interfaces/Result";
import { History } from "./History";

export class Match {
  private date: Date;
  private contestantA: Contestant;
  private contestantB: Contestant;
  private observer: Result;
  private events: Event[] = [];
  private matchHistory: History= new History();

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

  

  printScoreboard(): void {
    console.log("\n--- All Match Events ---");
    this.matchHistory.printHistory();
    console.log("\n--- Current Score ---");
    this.observer.getCurrentResult();
  }
}
