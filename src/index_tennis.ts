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

function simulateTennisWin(
  match: Match,
  winner: Contestant,
  loser: Contestant
) {
  console.log(
    `Simulating Tennis win for: ${winner.getTeamName()} vs ${loser.getTeamName()}`
  );
  const observer = match.getObserver() as Result;
  const strategy = (observer as any).strategy as TennisResult;

  strategy.reset();

  let safetyCount = 0;
  // TennisResult's update takes points and internally processes games/sets.
  // We need to call it enough times for 'winner' to win 2 sets.
  // Each call to EventFactory for "Point Won" with 1 point will advance tennis score.
  while (!strategy.isMatchOver() && safetyCount < 200) {
    // Tennis can take many points
    match.createEvent(
      "Point Won",
      `${winner.getTeamName()} wins point`,
      winner,
      1
    );
    safetyCount++;
  }

  if (
    !strategy.isMatchOver() ||
    strategy.getWinnerId(winner.getId(), loser.getId()) !== winner.getId()
  ) {
    console.warn(
      `WARN: Tennis simulation for ${winner.getTeamName()} to win might not have completed correctly.`
    );
    // Fallback to ensure win state
    (strategy as any).score[winner.getId()] = { sets: 2, games: 0, points: 0 }; // Tennis point values are 0,1,2,3 (for 0,15,30,40)
    (strategy as any).score[loser.getId()] = { sets: 0, games: 0, points: 0 };
    (strategy as any).matchEnded = true;
    (strategy as any).winnerIdInternal = winner.getId(); // Assuming TennisResult will have this if you implement it
  }
  // match.printScoreboard();
}

async function runTennisTournament() {
  console.log("--- STARTING TENNIS TOURNAMENT SIMULATION (Event-Driven) ---");
  const p1 = new Player(1, "R.", "Federer");
  const p2 = new Player(2, "R.", "Nadal");
  const p3 = new Player(3, "N.", "Djokovic");
  const p4 = new Player(4, "A.", "Murray");

  const teamA = new Contestant("TNA", "Swiss Maestro", [p1]);
  const teamB = new Contestant("TNB", "King of Clay", [p2]);
  const teamC = new Contestant("TNC", "Serbinator", [p3]);
  const teamD = new Contestant("TND", "Muzza", [p4]);

  const tournament = Tournament.getInstance("Wimbledon");
  tournament.resetTournamentForTesting();
  tournament.setScoringStrategyType(TennisResult, "Tennis");

  tournament.openRegistration();
  [teamA, teamB, teamC, teamD].forEach((t) => tournament.addContestant(t));
  tournament.closeRegistration();

  const initialPhase = new GroupPhase(2, 1);
  tournament.setInitialPhase(initialPhase);
  tournament.startTournament();

  let matchLoopSafety = 0;
  while (tournament.getStatus() === "InProgress" && matchLoopSafety < 10) {
    console.log(`\nTennis Main Loop Iteration ${matchLoopSafety + 1}`);
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
            `Tennis: Phase ${currentPhase.getName()} not complete, no new matches.`
          );
        }
        if (
          tournament.getStatus() !== "InProgress" ||
          tournament
            .getAllManagedMatches()
            .filter((mm) => mm.status === "Scheduled").length === 0
        ) {
          console.log(
            "Tennis: No more progression possible or tournament ended."
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
      `Playing Tennis Match ID: ${matchId} - ${cA_match.getTeamName()} vs ${cB_match.getTeamName()}`
    );

    simulateTennisWin(matchObject, cA_match, cB_match); // cA_match wins

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
    `\n--- Tennis Tournament Final Status: ${tournament.getStatus()} ---`
  );
  tournament
    .getRanking()
    .forEach((r) =>
      console.log(
        `#${r.rank} ${r.teamName} - Pts: ${r.points}, WLD: ${r.wins}/${r.losses}/${r.draws}`
      )
    );
  const finalPhaseHistoryT = (tournament as any).phaseHistory;
  if (finalPhaseHistoryT.length > 0) {
    const lastPhaseT = finalPhaseHistoryT[finalPhaseHistoryT.length - 1];
    if (lastPhaseT) {
      const finishersT = lastPhaseT.getAdvancingContestants();
      if (finishersT.length > 0) {
        console.log(
          `Last phase (${lastPhaseT.getName()}) finishers: ${finishersT
            .map((c: Contestant) => c.getTeamName())
            .join(", ")}`
        );
      } else {
        console.log(
          `Last phase (${lastPhaseT.getName()}) reported no specific finishers.`
        );
      }
    }
  }
}

runTennisTournament().catch(console.error);
