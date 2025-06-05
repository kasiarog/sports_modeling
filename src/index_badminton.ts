import { Player } from "./Player";
import { Contestant } from "./Contestant";
import { Tournament } from "./Tournament";
import { GroupPhase } from "./Phase/GroupPhase";
import { Result } from "./interfaces/Result";
import { BadmintonResult } from "./Result/BadmintonResult";
import { Match } from "./Match";

// Hlper for simulating a badminton match
function simulateBadmintonMatch(
  match: Match,
  winner: Contestant,
  loser: Contestant
) {
  const observer = match.getObserver() as Result;
  const strategy = (observer as any).strategy as BadmintonResult;

  // Reset strategy to ensure clean match state
  strategy.reset();

  // Simulate winner getting 2 sets
  (strategy as any).score[winner.getId()] = { sets: 2, points: 0 };
  (strategy as any).score[loser.getId()] = { sets: 0, points: 0 };
  (strategy as any).matchEnded = true;
  (strategy as any).winnerIdInternal = winner.getId();
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

    const currentPhase = (tournament as any).currentPhase;
    if (currentPhase)
      console.log(
        "Current Phase Standings:",
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

runBadmintonTournament().catch(console.error);
