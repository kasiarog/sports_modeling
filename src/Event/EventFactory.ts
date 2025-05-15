import { Result } from "../Result";
import { ResultDependentEvent } from "./ResultDependentEvent";

export class EventFactory {
  static createEvent(
    name: string,
    date: Date,
    description: string,
    point: number,
    contestant: string,
    observer: Result
  ): ResultDependentEvent<any> {
    return new ResultDependentEvent(
      name,
      date,
      description,
      point,
      contestant,
      observer
    );
  }
}
