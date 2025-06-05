import { Contestant } from "../src/Contestant";
import { EventFactory } from "../src/Event/EventFactory";
import { Result } from "../src/interfaces/Result";
import { Match } from "../src/Match";
import { Player } from "../src/Player";
import { SoccerResult } from "../src/Result/SoccerResult";

describe("Soccer Match Scoreboard", () => {
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

    const scoringStrategy = new SoccerResult();

    const resultObserver = new Result("Match Observer", scoringStrategy);
    match = new Match(new Date(), contestantA, contestantB, resultObserver);
  });

  test("should display the correct scoreboard after some events", () => {
    const eventLog: any[] = [];

    const consoleSpy = jest.spyOn(console, "log").mockImplementation((output) => {
      eventLog.push(output);
    });

    match.createEvent("Goal", `${contestantA.getTeamName()} team scores a goal`, contestantA, 1);
    match.createEvent("Faul", `${contestantA.getTeamName()} team fauls`, contestantA);
    match.createEvent("Goal", `${contestantB.getTeamName()} team scores a goal`, contestantB, 1);
    match.createEvent("Break", "15 minutes break");
    match.createEvent("Goal", `${contestantA.getTeamName()} team scores a goal`, contestantA, 1);
    match.createEvent("Penalty", `Penalty for team ${contestantA.getTeamName()}`, contestantA, 1);
    match.createEvent("Own goal", `Own goal for team ${contestantA.getTeamName()}`, contestantA, 1);

    match.printScoreboard();

    expect(eventLog[0]).toContain("--- All Match Events ---");


    expect(eventLog[1]).toContain(`Goal - Ordinary team scores a goal | Contestant: Ordinary vs Movies | Points: 1`);
    expect(eventLog[2]).toContain(`Faul - Ordinary team fauls | Contestant: Ordinary vs Movies`);
    expect(eventLog[3]).toContain(`Goal - Movies team scores a goal | Contestant: Movies vs Ordinary | Points: 1`);
    expect(eventLog[4]).toContain(`Break - 15 minutes break`);
    expect(eventLog[5]).toContain(`Goal - Ordinary team scores a goal | Contestant: Ordinary vs Movies | Points: 1`);
    expect(eventLog[6]).toContain(`Penalty - Penalty for team Ordinary | Contestant: Ordinary vs Movies | Points: 1`);
    expect(eventLog[7]).toContain(`Own goal - Own goal for team Ordinary | Contestant: Ordinary vs Movies | Points: 1`);

    expect(eventLog[8]).toContain("--- Current Score ---");
    expect(eventLog[9]).toContain("Contestant: 1234");
    expect(eventLog[10]).toContain("  Goals: 2");
    expect(eventLog[11]).toContain("  Penalties: 1");
    expect(eventLog[12]).toContain("  Own Goals: 1");
    expect(eventLog[13]).toContain("Contestant: 2255");
    expect(eventLog[14]).toContain("  Goals: 1");
    expect(eventLog[15]).toContain("  Penalties: 0");
    expect(eventLog[16]).toContain("  Own Goals: 0");
    expect(eventLog[17]).toContain("Final score: 3:2");
  });

    test("should display the correct scoreboard after multiple events including cards", () => {
    const eventLog: any[] = [];

    const consoleSpy = jest.spyOn(console, "log").mockImplementation((output) => {
      eventLog.push(output);
    });

    match.createEvent("Goal", `${contestantA.getTeamName()} team scores a goal`, contestantA, 1);
    match.createEvent("Faul", `${contestantA.getTeamName()} team fauls`, contestantA);
    match.createEvent("Goal", `${contestantB.getTeamName()} team scores a goal`, contestantB, 1);
    match.createEvent("Break", "15 minutes break");
    match.createEvent("Goal", `${contestantA.getTeamName()} team scores a goal`, contestantA, 1);
    match.createEvent("Penalty", `Penalty for team ${contestantA.getTeamName()}`, contestantA, 1);
    match.createEvent("Own goal", `Own goal for team ${contestantA.getTeamName()}`, contestantA, 1);
    match.createEvent("Yellow Card", `${contestantA.getTeamName()} player receives a yellow card`, contestantA);
    match.createEvent("Red Card", `${contestantB.getTeamName()} player receives a red card`, contestantB);
    match.createEvent("Goal", `${contestantA.getTeamName()} team scores another goal`, contestantA, 1);  
    match.createEvent("Yellow Card", `${contestantB.getTeamName()} player receives a yellow card`, contestantB);

    match.printScoreboard();

    expect(eventLog[0]).toContain("--- All Match Events ---");


    expect(eventLog[1]).toContain(`Goal - Ordinary team scores a goal | Contestant: Ordinary vs Movies | Points: 1`);
    expect(eventLog[2]).toContain(`Faul - Ordinary team fauls | Contestant: Ordinary vs Movies`);
    expect(eventLog[3]).toContain(`Goal - Movies team scores a goal | Contestant: Movies vs Ordinary | Points: 1`);
    expect(eventLog[4]).toContain(`Break - 15 minutes break`);
    expect(eventLog[5]).toContain(`Goal - Ordinary team scores a goal | Contestant: Ordinary vs Movies | Points: 1`);
    expect(eventLog[6]).toContain(`Penalty - Penalty for team Ordinary | Contestant: Ordinary vs Movies | Points: 1`);
    expect(eventLog[7]).toContain(`Own goal - Own goal for team Ordinary | Contestant: Ordinary vs Movies | Points: 1`);
    expect(eventLog[8]).toContain(`Yellow Card - Ordinary player receives a yellow card | Contestant: Ordinary vs Movies`);
    expect(eventLog[9]).toContain(`Red Card - Movies player receives a red card | Contestant: Movies vs Ordinary`);
    expect(eventLog[10]).toContain(`Goal - Ordinary team scores another goal | Contestant: Ordinary vs Movies | Points: 1`);  
    expect(eventLog[11]).toContain(`Yellow Card - Movies player receives a yellow card | Contestant: Movies vs Ordinary`);

    expect(eventLog[12]).toContain("--- Current Score ---");
    expect(eventLog[13]).toContain("Contestant: 1234");
    expect(eventLog[14]).toContain("  Goals: 3");
    expect(eventLog[15]).toContain("  Penalties: 1");
    expect(eventLog[16]).toContain("  Own Goals: 1");
    expect(eventLog[17]).toContain("Contestant: 2255");
    expect(eventLog[18]).toContain("  Goals: 1");
    expect(eventLog[19]).toContain("  Penalties: 0");
    expect(eventLog[20]).toContain("  Own Goals: 0");
    expect(eventLog[21]).toContain("Final score: 4:2");
  });
});
