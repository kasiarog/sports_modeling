import { Event } from "./interfaces/Event";
export class History {
  //add observer for history events
  private events: Event[] = [];

  

  getEvents(): Event[] {
    return this.events;
  }
  addEvent(event: Event): void {
    this.events.push(event);
  }

  printHistory(): void {
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
        console.log(`${index + 1}. [${event.getDate().toLocaleString()}] ${event.getName()} - ${event.getDescription()}`);
      }
    });
  }
}
