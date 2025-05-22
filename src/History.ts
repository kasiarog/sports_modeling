import { Event } from "./interfaces/Event";
export class History {//add observer for history events
  private events: Event[] = [];

  constructor(historyEvents: Event[], resultEvents: Event[]) {
    this.events = [...historyEvents, ...resultEvents];

    this.events.sort((a, b) => a.getDate().getTime() - b.getDate().getTime());
  }

  getEvents(): Event[] {
    return this.events;
  }

  printHistory(): void {
    console.log("Historia zdarzeń (posortowana po dacie):");
    for (const event of this.events) {
      const name = event.getName();
      const date = event.getDate().toISOString();
      const desc = event.getDescription();
      const contestant = event.getContestant ? event.getContestant() : "";
      const points = event.getPoint ? event.getPoint() : 0;

      if (points && points > 0) {
        console.log(
          `${date} | ${name} | ${desc} | Punkty: ${points} | Zawodnik: ${contestant}`
        );
      } else {
        console.log(`${date} | ${name} | ${desc}| Zawodnik: ${contestant}`);
      }
    }
  }
}
