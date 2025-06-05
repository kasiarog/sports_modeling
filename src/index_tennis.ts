import { Player } from "./Player";
import { Contestant } from "./Contestant";
import { Tournament } from "./Tournament";
import { GroupPhase } from "./Phase/GroupPhase";
import { Result } from "./interfaces/Result";
import { TennisResult } from "./Result/TennisResult";
import { Match } from "./Match";

function simulateTennisMatch(
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

  // If match didnt finish by now input the score manually
  if (
    !strategy.isMatchOver() ||
    strategy.getWinnerId(winner.getId(), loser.getId()) !== winner.getId()
  ) {
    console.warn(
      `WARN: Tennis simulation for ${winner.getTeamName()} to win might not have completed correctly.`
    );
    (strategy as any).score[winner.getId()] = { sets: 2, games: 0, points: 0 };
    (strategy as any).score[loser.getId()] = { sets: 0, games: 0, points: 0 };
    (strategy as any).matchEnded = true;
    (strategy as any).winnerIdInternal = winner.getId();
  }
  //match.printScoreboard();
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

  const initialPhase = new GroupPhase(2, 1); // 2 groups, 1 advances per group
  tournament.setInitialPhase(initialPhase);
  tournament.startTournament();

  let safetyBreak = 0;
  while (tournament.getStatus() === "InProgress" && safetyBreak < 10) {
    console.log(`\nTennis Tournament Match ${safetyBreak + 1}`);
    const scheduledManagedMatches = tournament
      .getAllManagedMatches()
      .filter((mm) => mm.status === "Scheduled");

    if (scheduledManagedMatches.length === 0) {
      const newMatches = tournament.assignNextMatches();
      if (newMatches.length === 0) {
        const currentPhase = (tournament as any).currentPhase;
        if (currentPhase.isComplete(tournament)) {
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
      `Playing Tennis Match ID: ${matchId} - ${cA_match.getTeamName()} vs ${cB_match.getTeamName()}`
    );

    simulateTennisMatch(matchObject, cA_match, cB_match);
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
    `\n--- Tennis Tournament Final Status: ${tournament.getStatus()} ---`
  );
  tournament
    .getRanking()
    .forEach((r) =>
      console.log(
        `#${r.rank} ${r.teamName} - Pts: ${r.points}, WLD: ${r.wins}/${r.losses}/${r.draws}`
      )
    );
}
runTennisTournament().catch(console.error);
