import { Player } from "../src/Player";
import { Contestant } from "../src/Contestant";
import { Tournament } from "../src/Tournament";
import { GroupPhase } from "../src/Phase/GroupPhase";
import { Result } from "../src/interfaces/Result";
import { BadmintonResult } from "../src/Result/BadmintonResult";
import { Match } from "../src/Match";
import { log, error } from "console";
function simulateBadmintonMatch(
  match: Match,
  winner: Contestant,
  loser: Contestant
) {
  const observer = match.getObserver() as Result;
  const MatchResult = (observer as any).strategy as BadmintonResult;

  MatchResult.reset();

  // Simulate winner getting 2 sets
  (MatchResult as any).score[winner.getId()] = { sets: 2, points: 0 };
  (MatchResult as any).score[loser.getId()] = { sets: 0, points: 0 };
  (MatchResult as any).matchEnded = true;
  (MatchResult as any).winnerIdInternal = winner.getId();
}

async function runBadmintonTournament() {
  console.log("--- STARTING BADMINTON TOURNAMENT ---");
  const p1 = new Player(1, "Iga", "Swiatek");
  const p2 = new Player(2, "Wojciech", "Kowalski");
  const p3 = new Player(3, "Michal", "Przysiezny");
  const p4 = new Player(4, "Kamil", "Majchrzak");

  const teamA = new Contestant("BD_A", "Ruch", [p1]);
  const teamB = new Contestant("BD_B", "Pogon", [p2]);
  const teamC = new Contestant("BD_C", "Legia", [p3]);
  const teamD = new Contestant("BD_D", "Chemik", [p4]);

  const tournament = Tournament.getInstance("Konin Open");
  tournament.setScoringStrategyType(BadmintonResult, "Badminton");

  tournament.openRegistration();
  [teamA, teamB, teamC, teamD].forEach((t) => tournament.addContestant(t));
  tournament.closeRegistration();

  const initialPhase = new GroupPhase(2, 1); // 2 groups, 1 advances per group
  tournament.setInitialPhase(initialPhase);
  tournament.startTournament();

  let safetyBreak = 0;
  while (tournament.getStatus() === "InProgress" && safetyBreak < 10) {
    console.log(`\nBadminton Tournament Match ${safetyBreak + 1}`);
    const scheduledMatches = tournament
      .getAllManagedMatches()
      .filter((mm) => mm.status === "Scheduled");

    if (scheduledMatches.length === 0) {
      const newMatchesGenerated = tournament.assignNextMatches();
      if (newMatchesGenerated.length === 0) {
        const currentPhase = (tournament as any).currentPhase;
        if (currentPhase && currentPhase.isComplete(tournament)) {
          (tournament as any).checkPhaseCompletionAndTransition();
        }
      }
      safetyBreak++;
      continue;
    }

    const currentManagedMatch = scheduledMatches[0];
    const { matchObject, id: matchId } = currentManagedMatch;
    const cA_match = matchObject.getContestantA();
    const cB_match = matchObject.getContestantB();

    console.log(
      `Playing Badminton Match ID: ${matchId} - ${cA_match.getTeamName()} vs ${cB_match.getTeamName()}`
    );

    simulateBadmintonMatch(matchObject, cA_match, cB_match);
    tournament.recordMatchResult(matchId, matchObject.getObserver());

    // Print current phase standings
    const currentPhase = tournament.getCurrentPhase();
    if (currentPhase)
      console.log(
        "\n--- Current Phase Standings: ---\n",
        JSON.stringify(currentPhase.getPhaseStandings(), null, 2)
      );
    safetyBreak++;
  }

  console.log(
    `\n--- Badminton Tournament Final Status: ${tournament.getStatus()} ---`
  );
  tournament
    .getRanking()
    .forEach((r) =>
      console.log(
        `#${r.rank} ${r.teamName} - Pts: ${r.points}, WLD: ${r.wins}/${r.losses}/${r.draws}`
      )
    );
}

describe("Badminton Tournament Simulation", () => {
  test("should simulate the tournament and match the exact output", async () => {
    const eventLog: any[] = [];
    const consoleSpy = jest.spyOn(console, "log").mockImplementation((output) => {
      eventLog.push(output);
    });

    await runBadmintonTournament();
  log(eventLog);
  log("expected tournament results");
  log(`--- Badminton Tournament Final Status: Finished ---
#1 Ruch - Pts: 3, WLD: 2/0/0
#2 Pogon - Pts: 3, WLD: 1/1/0
#3 Chemik - Pts: 0, WLD: 0/1/0
#3 Legia - Pts: 0, WLD: 0/1/0`)
    expect(eventLog[0]).toContain("--- STARTING BADMINTON TOURNAMENT ---");
    expect(eventLog[1]).toContain('Tournament "Konin Open" initialized.');
    expect(eventLog[2]).toContain('Tournament "Konin Open" scoring strategy type set to: Badminton');
    expect(eventLog[3]).toContain('Contestant Ruch added to "Konin Open".');
    expect(eventLog[4]).toContain('Contestant Pogon added to "Konin Open".');
    expect(eventLog[5]).toContain('Contestant Legia added to "Konin Open".');
    expect(eventLog[6]).toContain('Contestant Chemik added to "Konin Open".');
    expect(eventLog[7]).toContain('Initial phase for "Konin Open" set to: Group Stage');

    expect(eventLog[8]).toContain('Tournament "Konin Open" has begun with phase: Group Stage!');
    expect(eventLog[9]).toContain("GroupPhase: Generated 2 match instances.");
    expect(eventLog[10]).toContain("Match M1 (Ruch vs Legia) added to schedule.");
    expect(eventLog[11]).toContain("Match M2 (Pogon vs Chemik) added to schedule.");
    expect(eventLog[12]).toContain("Badminton Tournament Match 1");
    expect(eventLog[13]).toContain("Playing Badminton Match ID: M1 - Ruch vs Legia");
    

   
   


    expect(eventLog[19]).toContain("--- Current Phase Standings: ---");

    expect(eventLog[20]).toContain("Badminton Tournament Match 3");
    expect(eventLog[22]).toContain("LadderPhase: Final determined");

    expect(eventLog[25]).toContain('--- Badminton Tournament Final Status: Finished ---');

    consoleSpy.mockRestore();
  });
});
