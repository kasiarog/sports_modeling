import { Contestant } from "./Contestant";
import { Event } from "./interfaces/Event";
import { Result } from "./interfaces/Result";

export class Match {
  private date: Date;
  private contestantA: Contestant;
  private contestantB: Contestant;
  private observer: Result;
  private events: Event[] = [];

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
    this.events.push(event);
  }

  getEvents(): Event[] {
    return this.events;
  }

  listEvents(): void {
    if (this.events.length === 0) {
      console.log("No events recorded.");
      return;
    }

    this.events.forEach((event, index) => {
      const contestantName = event.getContestant()?.getTeamName();
      const opponentName = event.getOpponent()?.getTeamName();
      const points = event.getPoint();
      const pointInfo = points > 0 ? ` | Points: ${points}` : "";

      if (contestantName && opponentName) {
        console.log(
          `${index + 1}. [${event
            .getDate()
            .toLocaleString()}] ${event.getName()} - ${event.getDescription()} | Contestant: ${contestantName} vs ${opponentName}${pointInfo}`
        );
      } else {
        console.log(
          `${index + 1}. [${event
            .getDate()
            .toLocaleString()}] ${event.getName()} - ${event.getDescription()}`
        );
      }
    });
  }

  printScoreboard(): void {
    console.log("\n--- All Match Events ---");
    this.listEvents();
    console.log("\n--- Current Score ---");
    this.observer.getCurrentResult();
  }
}
