import { Contestant } from "../Contestant";
import { Match } from "../Match";
import { Tournament } from "../Tournament";
import { Result } from "../Result/Result";

export interface Phase {
  // Gets the name of the current phase
  getName(): string;

  // Sets up the phase with the relevant contestants. This is called when the tournament transitions into this phase.
  setupPhase(contestants: Contestant[], tournamentContext: Tournament): void;

  // Generates the matches that should be played in the current state of this phase. The Tournament class will be responsible for actually scheduling these.
  generateMatches(tournamentContext: Tournament): Match[];

  //Processes a match result according to the rules of this phase and update ContestantTournamentResult
  processMatchResult(
    match: Match,
    result: Result,
    tournamentContext: Tournament
  ): void;

  // Gets the current standings or state of this phase
  getPhaseStandings(): any;

  // Checks if this phase has concluded
  isComplete(tournamentContext: Tournament): boolean;

  // Gets the contestants who have qualified from this phase or who have achieved final tournament placings
  getAdvancingContestants(): Contestant[];

  // Determines and returns the next phase of the tournament. It can return a new Phase  or null if this is the final phase.
  transitionToNextPhase(tournamentContext: Tournament): Phase | null;
}
