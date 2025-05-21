import { Contestant } from "./Contestant";
import { EventFactory } from "./Event/EventFactory";
import { Result } from "./interfaces/Result";
import { Player } from "./Player";
import { BadmintonResult } from "./Result/BadmintonResult"; // Or your path

const playerA1 = new Player(1, "John", "Doe");
const playerA2 = new Player(1, "Adam", "Mayer");
const playerA3 = new Player(1, "Bob", "Snail");
const playerB1 = new Player(2, "Bilo", "Baggins");
const playerB2 = new Player(2, "Harry", "Potter");
const playerB3 = new Player(2, "Ron", "Wesley");

const contestantA = new Contestant("A1", "Ordinary");
const contestantB = new Contestant("B1", "Like in the movies");
contestantA.addPlayer(playerA1);
contestantA.addPlayer(playerA2);
contestantA.addPlayer(playerA3);
contestantB.addPlayer(playerB1);
contestantB.addPlayer(playerB2);
contestantB.addPlayer(playerB3);

const discipline = "badminton";
let scoringStrategy;

switch (discipline) {
  case "badminton":
    scoringStrategy = new BadmintonResult();
    break;
  // case "soccer":
  //   scoringStrategy = new SoccerResult();
  //   break;
  default:
    throw new Error("Unsupported discipline");
}

const resultObserver = new Result("Match Observer", scoringStrategy);

EventFactory.createEvent(
  "Point Won",
  new Date(),
  "Player scored a point",
  3,
  contestantA,
  contestantB,
  resultObserver
);

EventFactory.createEvent(
  "Point Won",
  new Date(),
  "Another point is scored",
  2,
  contestantB,
  contestantA,
  resultObserver
);

EventFactory.createEvent(
  "Point Won",
  new Date(),
  "Another point is scored",
  20,
  contestantB,
  contestantA,
  resultObserver
);

EventFactory.createEvent(
  "Point Won",
  new Date(),
  "Another point is scored",
  3,
  contestantA,
  contestantB,
  resultObserver
);

EventFactory.createEvent(
  "Point Won",
  new Date(),
  "Another point is scored",
  1,
  contestantB,
  contestantA,
  resultObserver
);

console.log("\nEvent Tab:", resultObserver.getResultEvents());
console.log("\nCurrent Score:");
resultObserver.getCurrentResult();
