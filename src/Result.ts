import { ResultDependentEvent } from "./Event/ResultDependentEvent";
import { Observer, Subject } from "./patternsInterface/Observer";

export class Result implements Observer {
    private resultEvents: ResultDependentEvent<any>[] = [];
  private points: { [contestant: string]: number } = {};
  constructor(private name: string) {}

  update<T>(subject: ResultDependentEvent<T>): void {
    const eventDetails = `Event: ${subject.getName()} at ${subject.getDate()} - Points: ${subject.getPoint()}`;

    this.resultEvents.push(subject);
    const contestant = subject.getContestant();
    const result = subject.getPoint();

    // Check if the contestant already has points, if not initialize to 0
    if (!this.points[contestant]) {
      this.points[contestant] = 0;
    }
    this.points[contestant] += result;
  }
  getResultEvents(): ResultDependentEvent<any>[] {
    return this.resultEvents;
  }

  getCurrentResult():void {
    for (const contestant in this.points) {
      console.log(
        `Contestant: ${contestant} - Points: ${this.points[contestant]}`
      );
    }
  }
 
}
