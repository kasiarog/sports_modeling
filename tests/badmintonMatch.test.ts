import { Contestant } from "../src/Contestant";
import { EventFactory } from "../src/Event/EventFactory";
import { Result } from "../src/interfaces/Result";
import { Match } from "../src/Match";
import { Player } from "../src/Player";
import { BadmintonResult } from "../src/Result/BadmintonResult";

describe("Match Scoreboard", () => {
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

    const scoringStrategy = new BadmintonResult();

    const resultObserver = new Result("Match Observer", scoringStrategy);
    match = new Match(new Date(), contestantA, contestantB, resultObserver);
  });

  test("should display the correct scoreboard after some events", () => {
    const eventLog: any[] = [];

    const consoleSpy = jest.spyOn(console, "log").mockImplementation((output) => {
      eventLog.push(output);
    });

    match.createEvent("Point Won", `${contestantA.getTeamName()} team wins a point`, contestantA, 1);
    match.createEvent("Faul", `${contestantB.getTeamName()} team commits a faul`, contestantB);
    match.createEvent("Point Won", `${contestantB.getTeamName()} team wins 20 points`, contestantB, 20);
    match.createEvent("Point Won", `${contestantA.getTeamName()} team wins 19 points`, contestantA, 19);
    match.createEvent("Break", "Short break between sets");
    match.createEvent("Point Won", `${contestantB.getTeamName()} team wins a point`, contestantB, 1);
    match.createEvent("Smash", `${contestantA.getTeamName()} smashes and wins a point`, contestantA, 1);
    match.createEvent("Faul", `${contestantA.getTeamName()} team hits the net`, contestantA);
    match.createEvent("Point Won", `${contestantA.getTeamName()} wins a point`, contestantA, 1);
    match.createEvent("Smash Winner", `${contestantA.getTeamName()} smashes and wins a set`, contestantA, 1);
    match.createEvent("Point Won", `${contestantB.getTeamName()} wins a point`, contestantB, 1);

    match.printScoreboard();

    expect(eventLog[0]).toContain("--- All Match Events ---");


 
    expect(eventLog[1]).toContain(`Point Won - Ordinary team wins a point | Contestant: Ordinary vs Movies | Points: 1`);
    expect(eventLog[2]).toContain(` Faul - Movies team commits a faul | Contestant: Movies vs Ordinary`);
    expect(eventLog[3]).toContain(`Point Won - Movies team wins 20 points | Contestant: Movies vs Ordinary | Points: 20`);
    expect(eventLog[4]).toContain(`Point Won - Ordinary team wins 19 points | Contestant: Ordinary vs Movies | Points: 19`);
    expect(eventLog[5]).toContain(`Break - Short break between sets`);
    expect(eventLog[6]).toContain(`Point Won - Movies team wins a point | Contestant: Movies vs Ordinary | Points: 1`);
    expect(eventLog[7]).toContain(`Smash - Ordinary smashes and wins a point | Contestant: Ordinary vs Movies | Points: 1`);
    expect(eventLog[8]).toContain(`Faul - Ordinary team hits the net | Contestant: Ordinary vs Movies`);
    expect(eventLog[9]).toContain(`Point Won - Ordinary wins a point | Contestant: Ordinary vs Movies | Points: 1`);
    expect(eventLog[10]).toContain(`Smash Winner - Ordinary smashes and wins a set | Contestant: Ordinary vs Movies | Points: 1`);
    expect(eventLog[11]).toContain(`Point Won - Movies wins a point | Contestant: Movies vs Ordinary | Points: 1`);
    expect(eventLog[12]).toContain("--- Current Score ---");
    expect(eventLog[13]).toContain("Contestant: 1234 - Sets: 1, Points: 0");
    expect(eventLog[14]).toContain("Contestant: 2255 - Sets: 0, Points: 1");
  });
});
