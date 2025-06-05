import { Contestant } from "../src/Contestant";
import { EventFactory } from "../src/Event/EventFactory";
import { Result } from "../src/interfaces/Result";
import { Match } from "../src/Match";
import { Player } from "../src/Player";
import { TennisResult } from "../src/Result/TennisResult";

describe("Tennis Match Scoreboard", () => {
  let match: Match;
  let contestantA: Contestant;
  let contestantB: Contestant;

  beforeEach(() => {
    const playerA1 = new Player(1, "John", "Doe");
    const playerA2 = new Player(1, "Adam", "Mayer");
    const playerA3 = new Player(1, "Bob", "Snail");
    const playerB1 = new Player(2, "Bilbo", "Baggins");
    const playerB2 = new Player(2, "Harry", "Potter");
    const playerB3 = new Player(2, "Ron", "Wesley");

    contestantA = new Contestant("1234", "Ordinary");
    contestantB = new Contestant("2255", "Movies");
    contestantA.addPlayer(playerA1);
    contestantA.addPlayer(playerA2);
    contestantA.addPlayer(playerA3);
    contestantB.addPlayer(playerB1);
    contestantB.addPlayer(playerB2);
    contestantB.addPlayer(playerB3);

    const scoringStrategy = new TennisResult();

    const resultObserver = new Result("Match Observer", scoringStrategy);
    match = new Match(new Date(), contestantA, contestantB, resultObserver);
  });

  test("should display the correct scoreboard after some events", () => {
    const eventLog: any[] = [];

    const consoleSpy = jest.spyOn(console, "log").mockImplementation((output) => {
      eventLog.push(output);
    });

    match.createEvent("Three points Won", `${contestantA.getTeamName()} team wins 3 points`, contestantA, 3);
    match.createEvent("Faul", `${contestantA.getTeamName()} team fauls`, contestantA);
    match.createEvent("Point Won", `${contestantB.getTeamName()} team wins point`, contestantB, 1);
    match.createEvent("Point Won", `${contestantA.getTeamName()} team wins point`, contestantA, 1);
    match.createEvent("Break", "Break lasting 2 minutes");
    match.createEvent("Point Won", `${contestantA.getTeamName()} team wins point`, contestantA, 1);
    match.createEvent("Two points Won", `${contestantB.getTeamName()} team wins 2 points`, contestantB, 2);

    match.printScoreboard();

    expect(eventLog[0]).toContain("--- All Match Events ---");


    expect(eventLog[1]).toContain(`Three points Won - Ordinary team wins 3 points | Contestant: Ordinary vs Movies | Points: 3`);
    expect(eventLog[2]).toContain(`Faul - Ordinary team fauls | Contestant: Ordinary vs Movies`);
    expect(eventLog[3]).toContain(`Point Won - Movies team wins point | Contestant: Movies vs Ordinary | Points: 1`);
    expect(eventLog[4]).toContain(`Point Won - Ordinary team wins point | Contestant: Ordinary vs Movies | Points: 1`);
    expect(eventLog[5]).toContain(`Break - Break lasting 2 minutes`);
    expect(eventLog[6]).toContain(`Point Won - Ordinary team wins point | Contestant: Ordinary vs Movies | Points: 1`);
    expect(eventLog[7]).toContain(`Two points Won - Movies team wins 2 points | Contestant: Movies vs Ordinary | Points: 2`);

    expect(eventLog[8]).toContain("--- Current Score ---");
    expect(eventLog[9]).toContain("Contestant: 1234 - Sets: 0, Games: 1, Points: 15");
    expect(eventLog[10]).toContain("Contestant: 2255 - Sets: 0, Games: 0, Points: 30");
  });
});
