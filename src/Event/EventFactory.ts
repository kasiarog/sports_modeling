import { ResultDependentEvent } from "./ResultDependentEvent";
import { HistoryEvent } from "./HistoryEvent";
import { Contestant } from "../Contestant";
import { Result } from "../interfaces/Result";

export class EventFactory {
  static createEvent(
    name: string,
    date: Date,
    description: string,
    contestant: Contestant,
    opponent: Contestant,
    point?: number,
    observer?: Result
  ): ResultDependentEvent<any> | HistoryEvent {
    if (point !== undefined && observer !== undefined) {
      return new ResultDependentEvent(
        name,
        date,
        description,
        point,
        contestant,
        opponent,
        observer
      );
    } else {
      return new HistoryEvent(
        name,
        date,
        description,
        contestant,
        opponent
      );
    }
  }
}
