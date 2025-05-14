import { Event } from "../interfaces/Event";
import { Observer, Subject } from "../patternsInterface/Observer";

export class ResultDependentEvent<T> implements Event, Subject {
  name: string;
  date: Date;
  description: string;
  point: number;
  contestant: string;

  private observers: Observer[] = [];

  //constructor
  constructor(
    name: string,
    date: Date,
    description: string,
    point: number,
    contestant: string,
    observer: Observer
  ) {
    this.name = name;
    this.date = date;
    this.description = description;
    this.point = point;
    this.contestant = contestant;
    this.addObserver(observer);
    this.notifyObservers();
  }
  //implementing Observer interface
  addObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  notifyObservers(): void {
    for (const observer of this.observers) {
      observer.update(this);
    }
  }
  trigger(): void {
    console.log(
      `Event triggered: ${this.getName()} at ${this.getDate()} by ${
        this.contestant
      }`
    );
    this.notifyObservers();
  }

  //implementing Event interface
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
    return this.contestant; //returning the contestant who scored points
  }
  //end of Event interface
  getPoint(): number {
    return this.point;
  }
}
