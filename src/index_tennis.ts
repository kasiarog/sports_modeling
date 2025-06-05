import { Player } from "./Player";
import { Contestant } from "./Contestant";
import { Tournament } from "./Tournament";
import { GroupPhase } from "./Phase/GroupPhase";
import { Result } from "./interfaces/Result";
import { TennisResult } from "./Result/TennisResult";
import { Match } from "./Match";

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

  // Counter preventing infinite loops
  let safetyCount = 0;
  while (!strategy.isMatchOver() && safetyCount < 200) {
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

  let matchLoopSafety = 0;
  while (tournament.getStatus() === "InProgress" && matchLoopSafety < 10) {
    console.log(`\nTennis Tournament Match ${matchLoopSafety + 1}`);
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

    simulateTennisWin(matchObject, cA_match, cB_match);

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
