// import { ResultDependentEvent } from "./ResultDependentEvent";
// import { HistoryEvent } from "./HistoryEvent";
// import { Contestant } from "../Contestant";
// import { Result } from "../interfaces/Result";

// export class EventFactory {
//   static createEvent(
//     name: string,
//     date: Date,
//     description: string,
//     contestant: Contestant,
//     opponent: Contestant,
//     point?: number,
//     observer?: Result
//   ): ResultDependentEvent<any> | HistoryEvent {
//     if (point !== undefined && observer !== undefined) {
//       return new ResultDependentEvent(
//         name,
//         date,
//         description,
//         point,
//         contestant,
//         opponent,
//         observer
//       );
//     } else {
//       return new HistoryEvent(
//         name,
//         date,
//         description,
//         contestant,
//         opponent
//       );
//     }
//   }
// }

import { ResultDependentEvent } from "./ResultDependentEvent";
import { HistoryEvent } from "./HistoryEvent";
import { Contestant } from "../Contestant";
import { Match } from "../Match";

export class EventFactory {
  static createEvent(
    match: Match,
    name: string,
    description: string,
    contestant?: Contestant,
    point?: number
  ) {
    const date = new Date();
    const observer = match.getObserver();

    let contestantObj: Contestant | undefined = undefined;
    let opponentObj: Contestant | undefined = undefined;

    if (contestant) {
      if (contestant === match.getContestantA()) {
        contestantObj = match.getContestantA();
        opponentObj = match.getContestantB();
      } else if (contestant === match.getContestantB()) {
        contestantObj = match.getContestantB();
        opponentObj = match.getContestantA();
      } else {
        throw new Error("Provided contestant does not belong to the match.");
      }
    }

    let event;
    if (point !== undefined && contestantObj && opponentObj) {
      event = new ResultDependentEvent(
        name,
        date,
        description,
        point,
        contestantObj,
        opponentObj,
        observer
      );
    } else if (contestantObj && opponentObj) {
      event = new HistoryEvent(
        name,
        date,
        description,
        contestantObj,
        opponentObj
      );
    } else {
      event = new HistoryEvent(
        name,
        date,
        description
      );
    }

    match.addEvent(event);
    return event;
  }
}
