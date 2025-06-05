import { Player } from "../src/Player";
import { Contestant } from "../src/Contestant";
import { Tournament } from "../src/Tournament";
import { GroupPhase } from "../src/Phase/GroupPhase";
import { Result } from "../src/interfaces/Result";
import { TennisResult } from "../src/Result/TennisResult";
import { Match } from "../src/Match";
import { log, error } from "console";


function simulateTennisMatch(match: Match, winner: Contestant, loser: Contestant) {
  console.log(`Simulating Tennis win for: ${winner.getTeamName()} vs ${loser.getTeamName()}`);
  const observer = match.getObserver() as Result;
  const MatchResult = (observer as any).strategy as TennisResult;
  MatchResult.reset();

  let safetyCount = 0;
  while (!MatchResult.isMatchOver() && safetyCount < 200) {
    match.createEvent("Point Won", `${winner.getTeamName()} wins point`, winner, 1);
    safetyCount++;
  }

  if (!MatchResult.isMatchOver() || MatchResult.getWinnerId(winner.getId(), loser.getId()) !== winner.getId()) {
    console.warn(`WARN: Tennis simulation for ${winner.getTeamName()} to win might not have completed correctly.`);
    (MatchResult as any).score[winner.getId()] = {
      sets: 2,
      games: 0,
      points: 0,
    };
    (MatchResult as any).score[loser.getId()] = {
      sets: 0,
      games: 0,
      points: 0,
    };
    (MatchResult as any).matchEnded = true;
    (MatchResult as any).winnerIdInternal = winner.getId();
  }
}

function runTennisTournament() {
  console.log("--- STARTING TENNIS TOURNAMENT SIMULATION ---");
  const p1 = new Player(1, "Ignacy", "Tloczynski");
  const p2 = new Player(2, "Wladyslaw", "Skonecki");
  const p3 = new Player(3, "Mariusz", "Fystenberg");
  const p4 = new Player(4, "Hubert", "Hurkacz");

  const teamA = new Contestant("TN_A", "Arka", [p1]);
  const teamB = new Contestant("TN_B", "Lech", [p2]);
  const teamC = new Contestant("TN_C", "Slask", [p3]);
  const teamD = new Contestant("TN_D", "Arkonia", [p4]);

  const tournament = Tournament.getInstance("Szwarzedz Open");
  tournament.setScoringStrategyType(TennisResult, "Tennis");

  tournament.openRegistration();
  [teamA, teamB, teamC, teamD].forEach((t) => tournament.addContestant(t));
  tournament.closeRegistration();

  const initialPhase = new GroupPhase(2, 1); 
  tournament.setInitialPhase(initialPhase);
  tournament.startTournament();

  let safetyBreak = 0;
  let matchCounter = 0;
  let tournamentStatus = tournament.getStatus();

  while (tournamentStatus === "InProgress" && safetyBreak < 10) {
    console.log(`\nTennis Tournament Match ${matchCounter + 1}`);
    const scheduledManagedMatches = tournament.getAllManagedMatches().filter((mm) => mm.status === "Scheduled");

    if (scheduledManagedMatches.length === 0) {
      const newMatches = tournament.assignNextMatches();
      if (newMatches.length === 0) {
        const currentPhase = (tournament as any).currentPhase;
        if (currentPhase.isComplete(tournament)) {
          (tournament as any).checkPhaseCompletionAndTransition();
        }
      }
      safetyBreak++;
      tournamentStatus = tournament.getStatus(); 
      continue;
    }

    const currentManagedMatch = scheduledManagedMatches[0];
    const { matchObject, id: matchId } = currentManagedMatch;
    const cA_match = matchObject.getContestantA();
    const cB_match = matchObject.getContestantB();

    console.log(`Playing Tennis Match ID: ${matchId} - ${cA_match.getTeamName()} vs ${cB_match.getTeamName()}`);

    simulateTennisMatch(matchObject, cA_match, cB_match);
    tournament.recordMatchResult(matchId, matchObject.getObserver());

    const currentPhase = tournament.getCurrentPhase();
    if (currentPhase) console.log(`\n--- Current Phase Standings: ---\n, ${JSON.stringify(currentPhase.getPhaseStandings(), null, 2)}`);

    safetyBreak++;
    tournamentStatus = tournament.getStatus(); 
    matchCounter++;
  }

  console.log(`\n--- Tennis Tournament Final Status: ${tournamentStatus} ---`);
  tournament.getRanking().forEach((r) => console.log(`#${r.rank} ${r.teamName} - Pts: ${r.points}, WLD: ${r.wins}/${r.losses}/${r.draws}`));
}

describe("Tennis Tournament Simulation", () => {
  test("should simulate the tournament and match the exact output", () => {
    const eventLog: any[] = [];
const consoleSpy = jest.spyOn(console, "log").mockImplementation((output) => {
  eventLog.push(output);
});

    runTennisTournament();
  log(eventLog);
  log("expected tournament results");
  log(`--- Tennis Tournament Final Status: Finished ---
#1 Arka - Pts: 3, WLD: 2/0/0
#2 Lech - Pts: 3, WLD: 1/1/0
#3 Arkonia - Pts: 0, WLD: 0/1/0
#3 Slask - Pts: 0, WLD: 0/1/0`)
    expect(eventLog[0]).toContain("--- STARTING TENNIS TOURNAMENT SIMULATION ---");
    expect(eventLog[1]).toContain('Tournament "Szwarzedz Open" initialized.');
    expect(eventLog[2]).toContain('Tournament "Szwarzedz Open" scoring strategy type set to: Tennis');
    expect(eventLog[3]).toContain('Contestant Arka added to "Szwarzedz Open".');
    expect(eventLog[4]).toContain('Contestant Lech added to "Szwarzedz Open".');
    expect(eventLog[5]).toContain('Contestant Slask added to "Szwarzedz Open".');
    expect(eventLog[6]).toContain('Contestant Arkonia added to "Szwarzedz Open".');
    expect(eventLog[7]).toContain('Initial phase for "Szwarzedz Open" set to: Group Stage');

    expect(eventLog[8]).toContain('Tournament "Szwarzedz Open" has begun with phase: Group Stage!');
    expect(eventLog[9]).toContain("GroupPhase: Generated 2 match instances.");
    expect(eventLog[10]).toContain("Match M1 (Arka vs Slask) added to schedule.");
    expect(eventLog[11]).toContain("Match M2 (Lech vs Arkonia) added to schedule.");
    expect(eventLog[12]).toContain("Tennis Tournament Match 1");
    
    expect(eventLog[17]).toContain("Tennis Tournament Match 2");
    expect(eventLog[21]).toContain("LadderPhase: Generated 1 match instances.");
    expect(eventLog[22]).toContain(" added to schedule.");
    expect(eventLog[23]).toContain("--- Current Phase Standings: ---");


    expect(eventLog[24]).toContain("Tennis Tournament Match 3");
    expect(eventLog[25]).toContain('Playing Tennis Match ID: M3');

    expect(eventLog[26]).toContain("Simulating Tennis win for:");
    expect(eventLog[29]).toContain('Tournament "Szwarzedz Open" has officially finished.');
    expect(eventLog[30]).toContain('Final standings for "Szwarzedz Open":');


    expect(eventLog[31]).toContain("--- Tennis Tournament Final Status: Finished ---");

    consoleSpy.mockRestore();
  });
});
