import { ResultDependentEvent } from "./ResultDependentEvent";
import { Contestant } from "../Contestant";
import { Result } from "../interfaces/Result";

export class EventFactory {
  static createEvent(
    name: string,
    date: Date,
    description: string,
    point: number,
    contestant: Contestant,
    opponent: Contestant,
    observer: Result
  ): ResultDependentEvent<any> {
    return new ResultDependentEvent(
      name,
      date,
      description,
      point,
      contestant,
      opponent,
      observer
    );
  }
}
