import { Player } from "../src/Player";
import { Contestant } from "../src/Contestant";
import { Tournament } from "../src/Tournament";
import { GroupPhase } from "../src/Phase/GroupPhase";
import { Result } from "../src/interfaces/Result";
import { SoccerResult } from "../src/Result/SoccerResult";
import { Match } from "../src/Match";
import { log, error } from "console";
function simulateSoccerGame(
  match: Match,
  cA: Contestant,
  cB: Contestant,
  scoreA: number,
  scoreB: number
) {
  console.log(
    `Simulating Soccer game for: ${cA.getTeamName()} (${scoreA}) vs ${cB.getTeamName()} (${scoreB})`
  );

  const observer = match.getObserver() as Result;
  const MatchResult = (observer as any).strategy as SoccerResult;
  MatchResult.reset();

  // Simulate the game by creating goal events
  for (let i = 0; i < scoreA; i++) {
    match.createEvent("Goal", `${cA.getTeamName()} scores`, cA, 1);
  }
  for (let i = 0; i < scoreB; i++) {
    match.createEvent("Goal", `${cB.getTeamName()} scores`, cB, 1);
  }
  match.createEvent("Match ended by referee with gwizdek", "gwizdek", cA, 0);

  const winnerId = MatchResult.getWinnerId(cA.getId(), cB.getId());
  if (winnerId === cA.getId()) {
    console.log(`${cA.getTeamName()} wins the match!`);
  } else if (winnerId === cB.getId()) {
    console.log(`${cB.getTeamName()} wins the match!`);
  } else {
    console.log("\nThe match ended in a draw!");
  }

  match.printScoreboard();
}

async function runSoccerTournament() {
  console.log("--- STARTING SOCCER TOURNAMENT SIMULATION ---");

  // Define teams and players
  const barcelonaSquad = [
    new Player(10, "Lionel", "Messi"),
    new Player(1, "Marc-André", "ter Stegen"),
    new Player(3, "Gerard", "Piqué"),
    new Player(5, "Sergio", "Busquets"),
    new Player(8, "Andrés", "Iniesta"),
    new Player(6, "Xavi", "Hernandez"),
    new Player(2, "Dani", "Alves"),
    new Player(4, "Ronald", "Araujo"),
    new Player(17, "Pedri", "Gonzalez"),
    new Player(22, "Raphinha", "Belloli"),
    new Player(9, "Robert", "Lewandowski"),
  ];

  const madridSquad = [
    new Player(7, "Cristiano", "Ronaldo"),
    new Player(1, "Thibaut", "Courtois"),
    new Player(4, "Sergio", "Ramos"),
    new Player(8, "Toni", "Kroos"),
    new Player(10, "Luka", "Modric"),
    new Player(20, "Vinicius", "Junior"),
    new Player(11, "Marco", "Asensio"),
    new Player(14, "Casemiro", "Henrique"),
    new Player(5, "Raphael", "Varane"),
    new Player(6, "Nacho", "Fernandez"),
    new Player(18, "Aurelien", "Tchouameni"),
  ];

  const psgSquad = [
    new Player(11, "Neymar", "Junior"),
    new Player(1, "Gianluigi", "Donnarumma"),
    new Player(2, "Achraf", "Hakimi"),
    new Player(5, "Marquinhos", "Correa"),
    new Player(6, "Marco", "Verratti"),
    new Player(7, "Ousmane", "Dembele"),
    new Player(8, "Fabian", "Ruiz"),
    new Player(10, "Carlos", "Soler"),
    new Player(18, "Renato", "Sanches"),
    new Player(19, "Lee", "Kang-in"),
    new Player(20, "Nordi", "Mukiele"),
  ];

  const manChesthairSquad = [
    new Player(9, "Kylian", "Mbappe"),
    new Player(1, "David", "De Gea"),
    new Player(3, "Harry", "Maguire"),
    new Player(5, "Lisandro", "Martinez"),
    new Player(6, "Paul", "Pogba"),
    new Player(7, "Jadon", "Sancho"),
    new Player(8, "Bruno", "Fernandes"),
    new Player(10, "Marcus", "Rashford"),
    new Player(11, "Anthony", "Martial"),
    new Player(14, "Christian", "Eriksen"),
    new Player(17, "Fred", "Rodrigues"),
  ];

  // Create teams
  const teamA = new Contestant("SC_A", "FC Barcelona", barcelonaSquad);
  const teamB = new Contestant("SC_B", "Real Madrid", madridSquad);
  const teamC = new Contestant("SC_C", "Paris SG", psgSquad);
  const teamD = new Contestant("SC_D", "Man Chesthair", manChesthairSquad);

  // Tournament setup
  const tournament = Tournament.getInstance("Champions League");
  tournament.setScoringStrategyType(SoccerResult, "Soccer");

  tournament.openRegistration();
  [teamA, teamB, teamC, teamD].forEach((t) => tournament.addContestant(t));
  tournament.closeRegistration();

  const initialPhase = new GroupPhase(2, 1);
  tournament.setInitialPhase(initialPhase);
  tournament.startTournament();

  let safetyBreak = 0;
  while (tournament.getStatus() === "InProgress") {
    console.log(`\nSoccer Tournament Match ${safetyBreak + 1}`);

    const scheduledManagedMatches = tournament
      .getAllManagedMatches()
      .filter((mm) => mm.status === "Scheduled");

    if (scheduledManagedMatches.length === 0) {
      const newMatches = tournament.assignNextMatches();
      if (newMatches.length === 0) {
        const currentPhase = (tournament as any).currentPhase;
        if (currentPhase && currentPhase.isComplete(tournament)) {
          (tournament as any).checkPhaseCompletionAndTransition();
        }
      }
      safetyBreak++;
      continue;
    }

    const currentManagedMatch = scheduledManagedMatches[0];
    const { matchObject, id: matchId } = currentManagedMatch;
    const cA_match = matchObject.getContestantA();
    const cB_match = matchObject.getContestantB();

    console.log(
      `Playing Soccer Match ID: ${matchId} - ${cA_match.getTeamName()} vs ${cB_match.getTeamName()}`
    );

    const scoreA = Math.floor(Math.random() * 4);
    const scoreB = Math.floor(Math.random() * 4);
    simulateSoccerGame(matchObject, cA_match, cB_match, scoreA, scoreB);
    tournament.recordMatchResult(matchId, matchObject.getObserver());

    const currentPhase = tournament.getCurrentPhase();
    if (currentPhase)
      console.log(
        "\n--- Current Phase Standings: ---\n",
        JSON.stringify(currentPhase.getPhaseStandings(), null, 2)
      );
    safetyBreak++;
  }

  console.log(
    `\n--- Soccer Tournament Final Status: ${tournament.getStatus()} ---`
  );
  tournament
    .getRanking()
    .forEach((r) =>
      console.log(
        `#${r.rank} ${r.teamName} - Pts: ${r.points}, WLD: ${r.wins}/${r.losses}/${r.draws}`
      )
    );
}

describe("Soccer Tournament Simulation", () => {
  test("should simulate the tournament and match the exact output", async () => {
    const eventLog: any[] = [];
    const consoleSpy = jest.spyOn(console, "log").mockImplementation((output) => {
      eventLog.push(output);
    });

    await runSoccerTournament();
      log(eventLog);
  log("expected tournament results");
  log(`--- Soccer Tournament Final Status: Finished ---
#1 Real Madrid - Pts: 3, WLD: 2/0/0
#2 Paris SG - Pts: 3, WLD: 1/1/0
#3 FC Barcelona - Pts: 0, WLD: 0/1/0
#3 Man Chesthair - Pts: 0, WLD: 0/1/0`)

    expect(eventLog[0]).toContain("--- STARTING SOCCER TOURNAMENT SIMULATION ---");
    expect(eventLog[1]).toContain('Tournament "Champions League" initialized.');
    expect(eventLog[2]).toContain('Tournament "Champions League" scoring strategy type set to: Soccer');
    expect(eventLog[3]).toContain('Contestant FC Barcelona added to "Champions League".');
    expect(eventLog[4]).toContain('Contestant Real Madrid added to "Champions League".');
    expect(eventLog[5]).toContain('Contestant Paris SG added to "Champions League".');
    expect(eventLog[6]).toContain('Contestant Man Chesthair added to "Champions League".');
    expect(eventLog[7]).toContain('Initial phase for "Champions League" set to: Group Stage');

    expect(eventLog[8]).toContain('Tournament "Champions League" has begun with phase: Group Stage!');
    expect(eventLog[9]).toContain("GroupPhase: Generated 2 match instances.");
    expect(eventLog[10]).toContain("Match M1 (FC Barcelona vs Paris SG) added to schedule.");
    expect(eventLog[11]).toContain("Match M2 (Real Madrid vs Man Chesthair) added to schedule.");

   
    consoleSpy.mockRestore();
  });
});
