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
  const strategy = (observer as any).strategy as SoccerResult;

  strategy.reset();

  for (let i = 0; i < scoreA; i++) {
    match.createEvent(
      "Goal",
      `${cA.getTeamName()} scores`,
      cA,
      1
    );
  }
  for (let i = 0; i < scoreB; i++) {
    match.createEvent(
      "Goal",
      `${cB.getTeamName()} scores`,
      cB,
      1
    );
  }
  // SoccerResult.isMatchOver() should ideally return true after typical match duration simulation.
  // For this simulation, we assume the events above conclude the match for scoring purposes.
  // Manually flag if strategy doesn't do it based on limited events:
  if (!(strategy as any).isMatchOver || !(strategy as any).isMatchOver()) {
    // If method not there or returns false
    (strategy as any).matchEnded = true; // HACK: Force match end for simulation
    const currentScore = strategy.getCurrentScore().score; // Assuming structure {score: {idA:X, idB:Y}}
    if (currentScore[cA.getId()] > currentScore[cB.getId()])
      (strategy as any).winnerIdInternal = cA.getId();
    else if (currentScore[cB.getId()] > currentScore[cA.getId()])
      (strategy as any).winnerIdInternal = cB.getId();
    else (strategy as any).winnerIdInternal = null;
  }
  // match.printScoreboard();
}

async function runSoccerTournament() {
  console.log("--- STARTING SOCCER TOURNAMENT SIMULATION (Event-Driven) ---");
  const p1 = new Player(10, "L. Messi", "");
  const p2 = new Player(7, "C. Ronaldo", "");
  const p3 = new Player(11, "Neymar", "Jr.");
  const p4 = new Player(9, "K. Mbappe", "");

  const teamA = new Contestant("SCA", "FC Barcelona", [p1]);
  const teamB = new Contestant("SCB", "Real Madrid", [p2]);
  const teamC = new Contestant("SCC", "Paris SG", [p3]);
  const teamD = new Contestant("SCD", "Man Chesthair", [p4]);

  const tournament = Tournament.getInstance("Champions League");
  tournament.resetTournamentForTesting();
  tournament.setScoringStrategyType(SoccerResult, "Soccer");

  tournament.openRegistration();
  [teamA, teamB, teamC, teamD].forEach((t) => tournament.addContestant(t));
  tournament.closeRegistration();

  const initialPhase = new GroupPhase(2, 1); // 2 groups, 1 advances
  tournament.setInitialPhase(initialPhase);
  tournament.startTournament();

  let matchLoopSafety = 0;
  while (tournament.getStatus() === "InProgress" && matchLoopSafety < 10) {
    console.log(`\nSoccer Main Loop Iteration ${matchLoopSafety + 1}`);
    const scheduledManagedMatches = tournament
      .getAllManagedMatches()
      .filter((mm) => mm.status === "Scheduled");

    if (scheduledManagedMatches.length === 0) {
      const newMatches = tournament.assignNextMatches();
      if (newMatches.length === 0) {
        const currentPhase = (tournament as any).currentPhase;
        if (currentPhase && currentPhase.isComplete(tournament)) {
          (tournament as any).checkPhaseCompletionAndTransition();
        } else if (currentPhase) {
          console.log(
            `Soccer: Phase ${currentPhase.getName()} not complete, no new matches.`
          );
        }
        if (
          tournament.getStatus() !== "InProgress" ||
          tournament
            .getAllManagedMatches()
            .filter((mm) => mm.status === "Scheduled").length === 0
        ) {
          console.log(
            "Soccer: No more progression possible or tournament ended."
          );
          break;
        }
      }
      matchLoopSafety++;
      continue;
    }

    const currentManagedMatch = scheduledManagedMatches[0];
    const { matchObject, id: matchId } = currentManagedMatch;
    const cA_match = matchObject.getContestantA();
    const cB_match = matchObject.getContestantB();
    console.log(
      `Playing Soccer Match ID: ${matchId} - ${cA_match.getTeamName()} vs ${cB_match.getTeamName()}`
    );

    // Simulate a result (random for variety)
    const scoreA = Math.floor(Math.random() * 4); // 0-3 goals
    const scoreB = Math.floor(Math.random() * 4); // 0-3 goals
    simulateSoccerGame(matchObject, cA_match, cB_match, scoreA, scoreB);

    tournament.recordMatchResult(matchId, matchObject.getObserver());
    const currentPhase = (tournament as any).currentPhase;
    if (currentPhase)
      console.log(
        "Current Phase Standings:",
        JSON.stringify(currentPhase.getPhaseStandings(), null, 2)
      );
    matchLoopSafety++;
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
  const finalPhaseHistoryS = (tournament as any).phaseHistory;
  if (finalPhaseHistoryS.length > 0) {
    const lastPhaseS = finalPhaseHistoryS[finalPhaseHistoryS.length - 1];
    if (lastPhaseS) {
      const finishersS = lastPhaseS.getAdvancingContestants();
      if (finishersS.length > 0) {
        console.log(
          `Last phase (${lastPhaseS.getName()}) finishers: ${finishersS
            .map((c: Contestant) => c.getTeamName())
            .join(", ")}`
        );
      } else {
        console.log(
          `Last phase (${lastPhaseS.getName()}) reported no specific finishers.`
        );
      }
    }
  }
}
runSoccerTournament().catch(console.error);
