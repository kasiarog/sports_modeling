import { Contestant } from "./Contestant";
import { EventFactory } from "./Event/EventFactory";
import { Result } from "./interfaces/Result";
import { Match } from "./Match";
import { Player } from "./Player";
import { BadmintonResult } from "./Result/BadmintonResult"; // Or your path
import { SoccerResult } from "./Result/SoccerResult";
import { TennisResult } from "./Result/TennisResult";
import { Tournament, ManagedMatch } from "./Tournament"; // Import ManagedMatch
import { GroupPhase } from "./Phase/GroupPhase";
import { LadderPhase } from "./Phase/LadderPhase";

const playerA1 = new Player(1, "John", "Doe");
const playerA2 = new Player(1, "Adam", "Mayer");
const playerA3 = new Player(1, "Bob", "Snail");
const playerB1 = new Player(2, "Bilbo", "Baggins");
const playerB2 = new Player(2, "Harry", "Potter");
const playerB3 = new Player(2, "Ron", "Wesley");

const contestantA = new Contestant("1234", "Ordinary");
const contestantB = new Contestant("2255", "Movies");
contestantA.addPlayer(playerA1);
contestantA.addPlayer(playerA2);
contestantA.addPlayer(playerA3);
contestantB.addPlayer(playerB1);
contestantB.addPlayer(playerB2);
contestantB.addPlayer(playerB3);

var discipline = "badminton";
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
const match = new Match(new Date(), contestantA, contestantB, resultObserver);

switch (discipline) {
  case "badminton":
    EventFactory.createEvent(
      match,
      "Point Won",
      `${contestantA.getTeamName()} team wins a point`,
      contestantA,
      1
    );
    EventFactory.createEvent(
      match,
      "Faul",
      `${contestantB.getTeamName()} team commits a faul`,
      contestantB
    );
    EventFactory.createEvent(
      match,
      "Point Won",
      `${contestantB.getTeamName()} team wins 20 points`,
      contestantB,
      20
    );
    EventFactory.createEvent(
      match,
      "Point Won",
      `${contestantA.getTeamName()} team wins 19 points`,
      contestantA,
      19
    );
    EventFactory.createEvent(match, "Break", "Short break between sets");
    EventFactory.createEvent(
      match,
      "Point Won",
      `${contestantB.getTeamName()} team wins a point`,
      contestantB,
      1
    );
    EventFactory.createEvent(
      match,
      "Smash",
      `${contestantA.getTeamName()} smashes and wins a point`,
      contestantA,
      1
    );
    EventFactory.createEvent(
      match,
      "Faul",
      `${contestantA.getTeamName()} team hits the net`,
      contestantA
    );
    EventFactory.createEvent(
      match,
      "Point Won",
      `${contestantA.getTeamName()} wins a point`,
      contestantA,
      1
    );
    EventFactory.createEvent(
      match,
      "Smash Winner",
      `${contestantA.getTeamName()} smashes and wins a set`,
      contestantA,
      1
    );
    EventFactory.createEvent(
      match,
      "Point Won",
      `${contestantB.getTeamName()} wins a point`,
      contestantB,
      1
    );
    match.printScoreboard();
    break;

  case "soccer":
    EventFactory.createEvent(
      match,
      "Goal",
      `${contestantA.getTeamName()} team scores a goal`,
      contestantA,
      1
    );
    EventFactory.createEvent(
      match,
      "Faul",
      `${contestantA.getTeamName()} team fauls`,
      contestantA
    );
    EventFactory.createEvent(
      match,
      "Goal",
      `${contestantB.getTeamName()} team scores a goal`,
      contestantB,
      1
    );
    EventFactory.createEvent(match, "Break", "15 minutes break");
    EventFactory.createEvent(
      match,
      "Goal",
      `${contestantA.getTeamName()} team scores a goal`,
      contestantA,
      1
    );
    EventFactory.createEvent(
      match,
      "Penalty",
      `Penalty for team ${contestantA.getTeamName()}`,
      contestantA,
      1
    );
    EventFactory.createEvent(
      match,
      "Own goal",
      `Own goal for team ${contestantA.getTeamName()}`,
      contestantA,
      1
    );
    match.printScoreboard();
    break;

  case "tennis":
    EventFactory.createEvent(
      match,
      "Three points Won",
      `${contestantA.getTeamName()} team wins 3 points`,
      contestantA,
      3
    );
    EventFactory.createEvent(
      match,
      "Faul",
      `${contestantA.getTeamName()} team fauls`,
      contestantA
    );
    EventFactory.createEvent(
      match,
      "Point Won",
      `${contestantB.getTeamName()} team wins point`,
      contestantB,
      1
    );
    EventFactory.createEvent(
      match,
      "Point Won",
      `${contestantA.getTeamName()} team wins point`,
      contestantA,
      1
    );
    EventFactory.createEvent(match, "Break", "Break lasting 2 minutes");
    EventFactory.createEvent(
      match,
      "Point Won",
      `${contestantA.getTeamName()} team wins point`,
      contestantA,
      1
    );
    EventFactory.createEvent(
      match,
      "Two points Won",
      `${contestantB.getTeamName()} team wins point`,
      contestantB,
      2
    );
    match.printScoreboard();
    break;

  default:
    throw new Error("Unsupported discipline");
}
