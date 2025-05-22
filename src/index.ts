import { Contestant } from "./Contestant";
import { EventFactory } from "./Event/EventFactory";
import { Result } from "./interfaces/Result";
import { Player } from "./Player";
import { BadmintonResult } from "./Result/BadmintonResult"; // Or your path
import { SoccerResult } from "./Result/SoccerResult";
import { TennisResult } from "./Result/TennisResult";

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

var discipline = "tennis";
let scoringStrategy;

switch (discipline) {
  case "badminton":
    scoringStrategy = new BadmintonResult();
    break;
  case "soccer":
    scoringStrategy = new SoccerResult();
    break;
  case "tennis":
    scoringStrategy = new TennisResult();
    break;
  default:
    throw new Error("Unsupported discipline");
}

const resultObserver = new Result("Match Observer", scoringStrategy);

switch (discipline) {
  case "badminton":
    EventFactory.createEvent(
      "Point Won",
      new Date(),
      "Player scored a point",
      contestantA,
      contestantB,
      3,
      resultObserver
    );

    EventFactory.createEvent(
      "Point Won",
      new Date(),
      "Another point is scored",
      contestantB,
      contestantA,
      2,
      resultObserver
    );

    EventFactory.createEvent(
      "Point Won",
      new Date(),
      "Another point is scored",

      contestantB,
      contestantA,
      20,
      resultObserver
    );

    EventFactory.createEvent(
      "Point Won",
      new Date(),
      "Another point is scored",

      contestantA,
      contestantB,
      3,
      resultObserver
    );

    EventFactory.createEvent(
      "Point Won",
      new Date(),
      "Another point is scored",

      contestantB,
      contestantA,
      1,
      resultObserver
    );

    console.log("\nEvent Tab:", resultObserver.getResultEvents());
    console.log("\nCurrent Score:");
    resultObserver.getCurrentResult();
    break;

  case "soccer":
    EventFactory.createEvent(
      "Goal scored",
      new Date(),
      "Player scored a goal",

      contestantA,
      contestantB,
      1,
      resultObserver
    );

    EventFactory.createEvent(
      "Three goal scored",
      new Date(),
      "Another point is scored",

      contestantB,
      contestantA,
      3,
      resultObserver
    );

    EventFactory.createEvent(
      "penalty",
      new Date(),
      "Penalty for team A",

      contestantA,
      contestantB,
      1,
      resultObserver
    );

    EventFactory.createEvent(
      "own goal",
      new Date(),
      "Own goal by a team A",

      contestantA,
      contestantB,
      1,
      resultObserver
    );

    console.log("\nEvent Tab:", resultObserver.getResultEvents());
    console.log("\nCurrent Score:");
    resultObserver.getCurrentResult();
    break;

  case "tennis":
    EventFactory.createEvent(
      "Three points Won",
      new Date(),
      "Player A wins point",

      contestantA,
      contestantB,
      3,
      resultObserver
    );
    EventFactory.createEvent(
      "Point Won",
      new Date(),
      "Player B wins point",

      contestantB,
      contestantA,
      1,
      resultObserver
    );
    EventFactory.createEvent(
      "Point Won",
      new Date(),
      "Player A wins point",

      contestantA,
      contestantB,
      1,
      resultObserver
    );
    EventFactory.createEvent(
      "Point Won",
      new Date(),
      "Player A wins point",

      contestantA,
      contestantB,
      3,
      resultObserver
    );
    EventFactory.createEvent(
      "Point Won",
      new Date(),
      "Player B wins point",
      contestantB,
      contestantA,
      2,
      resultObserver
    );

    console.log("\nEvent Tab:", resultObserver.getResultEvents());
    console.log("\nCurrent Score:");
    resultObserver.getCurrentResult();
    break;

  default:
    throw new Error("Unsupported discipline");
}
