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
  const MatchResult = (observer as any).strategy as TennisResult;
  MatchResult.reset();

  // Counter preventing infinite loops
  let safetyCount = 0;
  while (!MatchResult.isMatchOver() && safetyCount < 200) {
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
    !MatchResult.isMatchOver() ||
    MatchResult.getWinnerId(winner.getId(), loser.getId()) !== winner.getId()
  ) {
    console.warn(
      `WARN: Tennis simulation for ${winner.getTeamName()} to win might not have completed correctly.`
    );
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
  //match.printScoreboard();
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

  const initialPhase = new GroupPhase(2, 1); // 2 groups, 1 advances per group
  tournament.setInitialPhase(initialPhase);
  tournament.startTournament();

  let safetyBreak = 0;
  let matchCounter = 0;
  let tournamentStatus = tournament.getStatus();

  while (tournamentStatus === "InProgress" && safetyBreak < 10) {
    console.log(`\nTennis Tournament Match ${matchCounter + 1}`);
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
      tournamentStatus = tournament.getStatus(); // Update status
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

    // Print current phase standings
    const currentPhase = tournament.getCurrentPhase();
    if (currentPhase)
      console.log(
        "\n--- Current Phase Standings: ---\n",
        JSON.stringify(currentPhase.getPhaseStandings(), null, 2)
      );

    safetyBreak++;
    tournamentStatus = tournament.getStatus(); // Update status after match
    matchCounter++;
  }

  console.log(`\n--- Tennis Tournament Final Status: ${tournamentStatus} ---`);
  tournament
    .getRanking()
    .forEach((r) =>
      console.log(
        `#${r.rank} ${r.teamName} - Pts: ${r.points}, WLD: ${r.wins}/${r.losses}/${r.draws}`
      )
    );
}

runTennisTournament();
