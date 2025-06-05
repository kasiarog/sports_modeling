import { Player } from "./Player";
import { Contestant } from "./Contestant";
import { Tournament } from "./Tournament";
import { GroupPhase } from "./Phase/GroupPhase";
import { Result } from "./interfaces/Result";
import { SoccerResult } from "./Result/SoccerResult";
import { Match } from "./Match";

// Helper function for simulating a soccer game
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

  // Get match result instance to monitor the game
  const observer = match.getObserver() as Result;
  const MatchResult = (observer as any).strategy as SoccerResult;
  MatchResult.reset(); // Reset in case is not initial

  // Simulate the game by creating goal events
  for (let i = 0; i < scoreA; i++) {
    match.createEvent("Goal", `${cA.getTeamName()} scores`, cA, 1);
  }
  for (let i = 0; i < scoreB; i++) {
    match.createEvent("Goal", `${cB.getTeamName()} scores`, cB, 1);
  }
  // Simulate match end by referee
  match.createEvent("Match ended by referee with gwizdek", "gwizdek", cA, 0);

  // Print who won the match
  const winnerId = MatchResult.getWinnerId(cA.getId(), cB.getId());
  if (winnerId === cA.getId()) {
    console.log(`${cA.getTeamName()} wins the match!`);
  } else if (winnerId === cB.getId()) {
    console.log(`${cB.getTeamName()} wins the match!`);
  } else {
    console.log("\nThe match ended in a draw!");
  }

  // Print the matchscoreboard
  match.printScoreboard();
}

async function runSoccerTournament() {
  console.log("--- STARTING SOCCER TOURNAMENT SIMULATION ---");

  // Define players for each team
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

  // Create contestants for each team
  const teamA = new Contestant("SC_A", "FC Barcelona", barcelonaSquad);
  const teamB = new Contestant("SC_B", "Real Madrid", madridSquad);
  const teamC = new Contestant("SC_C", "Paris SG", psgSquad);
  const teamD = new Contestant("SC_D", "Man Chesthair", manChesthairSquad);

  // Create the tournament instance
  const tournament = Tournament.getInstance("Champions League");
  tournament.setScoringStrategyType(SoccerResult, "Soccer");

  // Open registration and add contestants
  tournament.openRegistration();
  [teamA, teamB, teamC, teamD].forEach((t) => tournament.addContestant(t));
  tournament.closeRegistration();

  // Set the initial phase of the tournament
  const initialPhase = new GroupPhase(2, 1); // 2 groups, 1 advances
  tournament.setInitialPhase(initialPhase);
  tournament.startTournament();

  // Tournament match loop
  let safetyBreak = 0;
  while (tournament.getStatus() === "InProgress") {
    console.log(`\nSoccer Tournament Match ${safetyBreak + 1}`);

    // Get scheduled matches
    const scheduledManagedMatches = tournament
      .getAllManagedMatches()
      .filter((mm) => mm.status === "Scheduled");

    // If no matches are left in schedule, assign new matches
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

    // Get the first scheduled match
    const currentManagedMatch = scheduledManagedMatches[0];
    const { matchObject, id: matchId } = currentManagedMatch;
    const cA_match = matchObject.getContestantA();
    const cB_match = matchObject.getContestantB();

    console.log(
      `Playing Soccer Match ID: ${matchId} - ${cA_match.getTeamName()} vs ${cB_match.getTeamName()}`
    );

    // Simulate a game with random result
    const scoreA = Math.floor(Math.random() * 4);
    const scoreB = Math.floor(Math.random() * 4);
    simulateSoccerGame(matchObject, cA_match, cB_match, scoreA, scoreB);
    tournament.recordMatchResult(matchId, matchObject.getObserver());

    // Print standings in the current phase
    const currentPhase = tournament.getCurrentPhase();
    if (currentPhase)
      console.log(
        "\n--- Current Phase Standings: ---\n",
        JSON.stringify(currentPhase.getPhaseStandings(), null, 2)
      );
    safetyBreak++;
  }

  // Final status of the tournament after all matches
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
runSoccerTournament().catch(console.error);
