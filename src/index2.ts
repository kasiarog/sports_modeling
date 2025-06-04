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

function simulateBadmintonMatchEvents(
  matchObject: Match,
  cA: Contestant,
  cB: Contestant
) {
  console.log(
    `\n--- Simulating Badminton Events for match between ${cA.getTeamName()} and ${cB.getTeamName()} ---`
  );
  EventFactory.createEvent(
    matchObject,
    "Point Won",
    `${cA.getTeamName()} team wins a point`,
    cA,
    1
  );
  EventFactory.createEvent(
    matchObject,
    "Faul",
    `${cB.getTeamName()} team commits a faul`,
    cB
  ); // No points
  EventFactory.createEvent(
    matchObject,
    "Point Won",
    `${cB.getTeamName()} team wins 20 points`,
    cB,
    20
  );
  EventFactory.createEvent(
    matchObject,
    "Point Won",
    `${cA.getTeamName()} team wins 19 points`,
    cA,
    19
  );
  EventFactory.createEvent(matchObject, "Break", "Short break between sets"); // No points
  EventFactory.createEvent(
    matchObject,
    "Point Won",
    `${cB.getTeamName()} team wins a point`,
    cB,
    1
  );
  EventFactory.createEvent(
    matchObject,
    "Smash",
    `${cA.getTeamName()} smashes and wins a point`,
    cA,
    1
  );
  EventFactory.createEvent(
    matchObject,
    "Faul",
    `${cA.getTeamName()} team hits the net`,
    cA
  ); // No points
  EventFactory.createEvent(
    matchObject,
    "Point Won",
    `${cA.getTeamName()} wins a point`,
    cA,
    1
  );
  EventFactory.createEvent(
    matchObject,
    "Smash Winner",
    `${cA.getTeamName()} smashes and wins a set`,
    cA,
    1
  ); // This point wins the set
  EventFactory.createEvent(
    matchObject,
    "Point Won",
    `${cB.getTeamName()} wins a point`,
    cB,
    1
  ); // Point in the new set

  // Simulate more events to ensure a match winner (e.g., cA wins another set)
  console.log(
    `--- Simulating more events for ${cA.getTeamName()} to win the match ---`
  );
  for (let i = 0; i < 21; i++) {
    // cA scores 21 points in the second set
    if (!(matchObject.getObserver() as any).strategy.isMatchOver()) {
      EventFactory.createEvent(
        matchObject,
        "Point Won",
        `${cA.getTeamName()} wins point in 2nd set`,
        cA,
        1
      );
    } else break;
  }
  matchObject.printScoreboard(); // See final state of this match
}

// --- Main Simulation ---
async function runTournamentSimulation() {
  // --- Create Players and Contestants ---
  const p1 = new Player(1, "P1", "Alpha");
  const p2 = new Player(2, "P2", "Alpha");
  const p3 = new Player(3, "P3", "Bravo");
  const p4 = new Player(4, "P4", "Bravo");
  const p5 = new Player(5, "P5", "Charlie");
  const p6 = new Player(6, "P6", "Charlie");
  const p7 = new Player(7, "P7", "Delta");
  const p8 = new Player(8, "P8", "Delta");

  const teamA = new Contestant("TA", "Team Alpha", [p1, p2]);
  const teamB = new Contestant("TB", "Team Bravo", [p3, p4]);
  const teamC = new Contestant("TC", "Team Charlie", [p5, p6]);
  const teamD = new Contestant("TD", "Team Delta", [p7, p8]);

  // --- Initialize Tournament ---
  const tournament = Tournament.getInstance("Grand Badminton Championship");

  // --- Set Scoring Strategy for the Tournament ---
  // Tournament will use this type to create new observers for each match
  tournament.setScoringStrategyType(BadmintonResult, "Badminton");

  // --- Register Contestants ---
  tournament.openRegistration();
  [teamA, teamB, teamC, teamD].forEach((t) => tournament.addContestant(t));
  tournament.closeRegistration();

  // --- Set Initial Phase ---
  // 2 groups, top 1 from each advances to a 2-team ladder (final)
  const initialPhase = new GroupPhase(2, 1);
  tournament.setInitialPhase(initialPhase);

  // --- Start Tournament ---
  tournament.startTournament();
  console.log("Tournament started. Initial matches scheduled by Group Phase.");

  // --- Gameplay Loop ---
  let safetyBreak = 0;
  while (tournament.getStatus() === "InProgress" && safetyBreak < 10) {
    console.log(`\n--- Main Loop Iteration ${safetyBreak + 1} ---`);
    const scheduledManagedMatches = tournament
      .getAllManagedMatches()
      .filter((mm) => mm.status === "Scheduled");

    if (scheduledManagedMatches.length === 0) {
      console.log(
        "No scheduled matches. Attempting to generate from current phase or transition..."
      );
      const newMatches = tournament.assignNextMatches(); // Ask phase to generate more
      if (newMatches.length === 0) {
        // If still no new matches
        const currentPhase = (tournament as any).currentPhase; // Access private for debug
        if (currentPhase && currentPhase.isComplete(tournament)) {
          console.log(
            `Phase ${currentPhase.getName()} reported complete. Attempting transition.`
          );
          (tournament as any).checkPhaseCompletionAndTransition(); // Manually trigger if needed
        } else if (currentPhase) {
          console.log(
            `Phase ${currentPhase.getName()} not complete, but no matches scheduled. Waiting or issue.`
          );
        }
        if (tournament.getStatus() !== "InProgress") {
          console.log("Tournament no longer InProgress. Exiting loop.");
          break;
        }
        if (
          tournament
            .getAllManagedMatches()
            .filter((mm) => mm.status === "Scheduled").length === 0
        ) {
          console.log(
            "Still no scheduled matches after trying to generate. Ending simulation loop."
          );
          break;
        }
      }
      safetyBreak++;
      continue;
    }

    const currentManagedMatch = scheduledManagedMatches[0];
    const matchObjectToPlay = currentManagedMatch.matchObject;
    const cA_match = matchObjectToPlay.getContestantA();
    const cB_match = matchObjectToPlay.getContestantB();

    console.log(
      `Playing Match ID: ${
        currentManagedMatch.id
      } - ${cA_match.getTeamName()} vs ${cB_match.getTeamName()}`
    );

    // Simulate the specific Badminton event sequence for THIS match
    // For this example, let's say Team Alpha (cA_match) wins if it's teamA
    // This is a simplification; you'd have different outcomes for different matches.
    if (
      cA_match.getId() === teamA.getId() ||
      cB_match.getId() === teamA.getId()
    ) {
      simulateBadmintonMatchEvents(matchObjectToPlay, cA_match, cB_match); // Simulates cA_match winning
    } else {
      // For other matches, simulate a different winner or use a simpler win condition
      console.log(
        `Simulating win events for ${cA_match.getTeamName()} in match ${
          currentManagedMatch.id
        }`
      );
      const strategy = (matchObjectToPlay.getObserver() as any)
        .strategy as ScoringStrategy;
      //if (typeof strategy.reset === "function") strategy.reset();
      // Manually make cA_match win 2 sets to 0 for simplicity
      if (strategy.constructor.name === "BadmintonResult") {
        (strategy as any).score[cA_match.getId()] = { sets: 2, points: 0 };
        (strategy as any).score[cB_match.getId()] = { sets: 0, points: 0 };
        (strategy as any).matchEnded = true;
        (strategy as any).winnerId = cA_match.getId();
      }
    }

    // Record the result using the match's own observer (which holds the final state)
    tournament.recordMatchResult(
      currentManagedMatch.id,
      matchObjectToPlay.getObserver()
    );

    console.log(
      "Current Phase Standings:",
      JSON.stringify(
        (tournament as any).currentPhase?.getPhaseStandings(),
        null,
        2
      )
    );
    safetyBreak++;
  }

  // --- Final Output ---
  console.log(
    `\n--- ${tournament.getTournamentName()} Final Status: ${tournament.getStatus()} ---`
  );
  const finalRanking = tournament.getRanking();
  if (finalRanking.length > 0) {
    console.log("Overall Tournament Ranking:");
    finalRanking.forEach((r) => {
      console.log(
        `#${r.rank} ${r.teamName} - Points: ${r.points}, WLD: ${r.wins}/${r.losses}/${r.draws}`
      );
    });
  }

  const lastPhase = (tournament as any).phaseHistory[
    (tournament as any).phaseHistory.length - 1
  ];
  if (lastPhase) {
    console.log(`\nFinishers from Last Phase (${lastPhase.getName()}):`);
    const finishers = lastPhase.getAdvancingContestants();
    if (finishers.length > 0) {
      finishers.forEach((c: Contestant, i: number) =>
        console.log(`  ${i + 1}. ${c.getTeamName()}`)
      );
    } else {
      console.log("  No specific finishers reported by the last phase.");
    }
  } else {
    console.log("No phases were run or recorded.");
  }
}

runTournamentSimulation().catch((error) =>
  console.error("Simulation Error:", error)
);

// // --- Create Players and Contestants ---
// const p1 = new Player(1, "P1", "Alpha");
// const p2 = new Player(2, "P2", "Alpha");
// const p3 = new Player(3, "P3", "Bravo");
// const p4 = new Player(4, "P4", "Bravo");
// const p5 = new Player(5, "P5", "Charlie");
// const p6 = new Player(6, "P6", "Charlie");
// const p7 = new Player(7, "P7", "Delta");
// const p8 = new Player(8, "P8", "Delta");

// const teamA = new Contestant("TA", "Team Alpha", [p1, p2]);
// const teamB = new Contestant("TB", "Team Bravo", [p3, p4]);
// const teamC = new Contestant("TC", "Team Charlie", [p5, p6]);
// const teamD = new Contestant("TD", "Team Delta", [p7, p8]);

// // --- Choose Discipline and Scoring Strategy ---
// var discipline = "badminton";
// let scoringStrategy;

// switch (discipline) {
//   case "badminton":
//     scoringStrategy = new BadmintonResult();
//     break;
//   case "soccer":
//     scoringStrategy = new SoccerResult();
//     break;
//   case "tennis":
//     scoringStrategy = new TennisResult();
//     break;
//   default:
//     throw new Error("Unsupported discipline");
// }

// const resultObserver = new Result("Match Observer", scoringStrategy);

// // --- Initialize Tournament ---
// const tournament = Tournament.getInstance(resultObserver, "Sigma tournament");

// // --- Register Contestants ---
// tournament.openRegistration();
// [teamA, teamB, teamC, teamD].forEach((t) => tournament.addContestant(t));
// tournament.closeRegistration();

// // --- Set Initial Phase ---
// // 2 groups, top 1 from each advances to a 2-team ladder (final)
// const initialPhase = new GroupPhase(2, 1);
// tournament.setInitialPhase(initialPhase);

// // --- Start Tournament ---
// tournament.startTournament();
// console.log(
//   "Tournament started. Initial matches should be scheduled by the Group Phase."
// );
