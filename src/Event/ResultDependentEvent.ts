import { Event } from "../interfaces/Event";
import { Observer, Subject } from "../patternsInterface/Observer";
import { Contestant } from "../Contestant";

export class ResultDependentEvent<T> implements Event, Subject {
  name: string;
  date: Date;
  description: string;
  point: number;
  contestant: Contestant;
  opponent: Contestant;

  private observers: Observer[] = [];

  constructor(
    name: string,
    date: Date,
    description: string,
    point: number,
    contestant: Contestant,
    opponent: Contestant,
    observer: Observer
  ) {
    this.name = name;
    this.date = date;
    this.description = description;
    this.point = point;
    this.contestant = contestant;
    this.opponent = opponent;
    this.addObserver(observer);
    this.notifyObservers();
  }

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
      `Event triggered: ${this.name} at ${this.date} by ${this.contestant.getTeamName()}`
    );
    this.notifyObservers();
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

  getOpponent(): Contestant {
    return this.opponent;
  }

  getPoint(): number {
    return this.point;
  }
}
