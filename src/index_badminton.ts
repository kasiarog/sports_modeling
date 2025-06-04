import { Player } from "./Player";
import { Contestant } from "./Contestant";
import { Tournament, ManagedMatch } from "./Tournament";
import { GroupPhase } from "./Phase/GroupPhase";
import { LadderPhase } from "./Phase/LadderPhase";
import { Result } from "./interfaces/Result";
import { BadmintonResult } from "./Result/BadmintonResult";
import { SoccerResult } from "./Result/SoccerResult";
import { TennisResult } from "./Result/TennisResult";
import { EventFactory } from "./Event/EventFactory";
import { Match } from "./Match";
import { ScoringStrategy } from "./patternsInterface/ScoringStrategy";

// Simplified win simulation helper for this file
function declareWinnerForBadmintonMatch(
  match: Match,
  winner: Contestant,
  loser: Contestant
) {
  const observer = match.getObserver() as Result;
  const strategy = (observer as any).strategy as BadmintonResult; // Cast to actual type

  strategy.reset();
  // Simulate winner getting 2 sets
  (strategy as any).score[winner.getId()] = { sets: 2, points: 0 };
  (strategy as any).score[loser.getId()] = { sets: 0, points: 0 };
  (strategy as any).matchEnded = true;
  (strategy as any).winnerIdInternal = winner.getId(); // Directly set internal winner for test
  // console.log(`Helper: Declared ${winner.getTeamName()} winner of badminton match.`);
}

async function runBadmintonTournament() {
  console.log("--- STARTING BADMINTON TOURNAMENT SIMULATION ---");
  const p1 = new Player(1, "Lin", "Dan");
  const p2 = new Player(2, "Lee C", "Wei");
  const p3 = new Player(3, "Kento", "Momota");
  const p4 = new Player(4, "Viktor", "Axelsen");

  const teamA = new Contestant("BDA", "Dragons", [p1]);
  const teamB = new Contestant("BDB", "Tigers", [p2]);
  const teamC = new Contestant("BDC", "Eagles", [p3]);
  const teamD = new Contestant("BDD", "Sharks", [p4]);

  const tournament = Tournament.getInstance("All England Open");
  tournament.resetTournamentForTesting();
  tournament.setScoringStrategyType(BadmintonResult, "Badminton");

  tournament.openRegistration();
  [teamA, teamB, teamC, teamD].forEach((t) => tournament.addContestant(t));
  tournament.closeRegistration();

  const initialPhase = new GroupPhase(2, 1); // 2 groups, 1 advances per group
  tournament.setInitialPhase(initialPhase);
  tournament.startTournament();

  let safetyBreak = 0;
  while (tournament.getStatus() === "InProgress" && safetyBreak < 10) {
    // console.log(`\nBadminton Loop Iteration ${safetyBreak + 1}`);
    const scheduledMatches = tournament
      .getAllManagedMatches()
      .filter((mm) => mm.status === "Scheduled");

    if (scheduledMatches.length === 0) {
      const newMatchesGenerated = tournament.assignNextMatches();
      if (newMatchesGenerated.length === 0) {
        const currentPhase = (tournament as any).currentPhase;
        if (currentPhase && currentPhase.isComplete(tournament)) {
          (tournament as any).checkPhaseCompletionAndTransition();
        } else if (currentPhase) {
          console.log(
            `Badminton: Phase ${currentPhase.getName()} not complete, no new matches. Might be waiting or an issue.`
          );
          break;
        }
        if (tournament.getStatus() !== "InProgress") break;
        if (
          tournament
            .getAllManagedMatches()
            .filter((mm) => mm.status === "Scheduled").length === 0
        ) {
          console.log(
            "Badminton: Still no scheduled matches. Ending simulation loop."
          );
          break;
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

    // Simulate a winner (e.g., cA_match wins)
    declareWinnerForBadmintonMatch(matchObject, cA_match, cB_match);
    tournament.recordMatchResult(matchId, matchObject.getObserver());
    safetyBreak++;
  }

  console.log(
    `\n--- Badminton Tournament Final Status: ${tournament.getStatus()} ---`
  );
  tournament
    .getRanking()
    .forEach((r) => console.log(`#${r.rank} ${r.teamName} - Pts: ${r.points}`));
  const lastPhase = (tournament as any).phaseHistory.pop();
  if (lastPhase)
    console.log(
      `Last phase finishers: ${lastPhase
        .getAdvancingContestants()
        .map((c: Contestant) => c.getTeamName())
        .join(", ")}`
    );
}

runBadmintonTournament().catch(console.error);
