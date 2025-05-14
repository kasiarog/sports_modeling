import { EventFactory } from "./Event/EventFactory";
import { ResultDependentEvent } from "./Event/ResultDependentEvent";
import { Result } from "./Result";
const resultObserver = new Result("Match Result Observer");

const goalEvent = EventFactory.createEvent(
  "Goal Scored",
  new Date(),
  "A player scored a goal",
  1,
  "Contestant A",
  resultObserver
);

const secondGoalEvent = EventFactory.createEvent(
  "Goal Scored",
  new Date(),
  "Another goal is scored",
  2,
  "Contestant B",
  resultObserver
);

const penaltyEvent = EventFactory.createEvent(
  "Penalty Awarded",
  new Date(),
  "A penalty is awarded",
  -3,
  "Contestant A",
  resultObserver
);

console.log("\nEvent Tab:", resultObserver.getEventTab());
console.log("\nCurrent Score:");
resultObserver.getCurrentResult();
