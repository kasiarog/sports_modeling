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

var discipline = "soccer"; 
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
    match.createEvent(
      "Point Won",
      `${contestantA.getTeamName()} team wins a point`,
      contestantA,
      1
    );
    match.createEvent(
      "Faul",
      `${contestantB.getTeamName()} team commits a faul`,
      contestantB
    );
    match.createEvent(
      "Point Won",
      `${contestantB.getTeamName()} team wins 20 points`,
      contestantB,
      20
    );
    match.createEvent(
      "Point Won",
      `${contestantA.getTeamName()} team wins 19 points`,
      contestantA,
      19
    );
    EventFactory.createEvent(match, "Break", "Short break between sets");
    match.createEvent(
      "Point Won",
      `${contestantB.getTeamName()} team wins a point`,
      contestantB,
      1
    );
    match.createEvent(
      "Smash",
      `${contestantA.getTeamName()} smashes and wins a point`,
      contestantA,
      1
    );
    match.createEvent(
      "Faul",
      `${contestantA.getTeamName()} team hits the net`,
      contestantA
    );
    match.createEvent(
      "Point Won",
      `${contestantA.getTeamName()} wins a point`,
      contestantA,
      1
    );
    match.createEvent(
      "Smash Winner",
      `${contestantA.getTeamName()} smashes and wins a set`,
      contestantA,
      1
    );
    match.createEvent(
      "Point Won",
      `${contestantB.getTeamName()} wins a point`,
      contestantB,
      1
    );
    match.printScoreboard();
    break;

  case "soccer":
    match.createEvent("Goal", `${contestantA.getTeamName()} team scores a goal`, contestantA, 1);
    match.createEvent("Faul", `${contestantA.getTeamName()} team fauls`, contestantA);
    match.createEvent("Goal", `${contestantB.getTeamName()} team scores a goal`, contestantB, 1);
    match.createEvent("Break", "15 minutes break");
    match.createEvent("Goal", `${contestantA.getTeamName()} team scores a goal`, contestantA, 1);
    match.createEvent("Penalty", `Penalty for team ${contestantA.getTeamName()}`, contestantA, 1);
    match.createEvent("Own goal", `Own goal for team ${contestantA.getTeamName()}`, contestantA, 1);
    match.createEvent("Yellow Card", `${contestantA.getTeamName()} player receives a yellow card`, contestantA);
    match.createEvent("Red Card", `${contestantB.getTeamName()} player receives a red card`, contestantB);
    match.createEvent("Goal", `${contestantA.getTeamName()} team scores another goal`, contestantA, 1);  // 4th goal for Ordinary
    match.createEvent("Yellow Card", `${contestantB.getTeamName()} player receives a yellow card`, contestantB);
    match.printScoreboard();
    break;

  case "tennis":
    match.createEvent(
      "Three points Won",
      `${contestantA.getTeamName()} team wins 3 points`,
      contestantA,
      3
    );
    match.createEvent(
      "Faul",
      `${contestantA.getTeamName()} team fauls`,
      contestantA
    );
    match.createEvent(
      "Point Won",
      `${contestantB.getTeamName()} team wins point`,
      contestantB,
      1
    );
    match.createEvent(
      "Point Won",
      `${contestantA.getTeamName()} team wins point`,
      contestantA,
      1
    );
    EventFactory.createEvent(match, "Break", "Break lasting 2 minutes");
    match.createEvent(
      "Point Won",
      `${contestantA.getTeamName()} team wins point`,
      contestantA,
      1
    );
    match.createEvent(
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
