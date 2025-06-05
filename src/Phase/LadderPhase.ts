import { Contestant } from "../Contestant";
import { Match } from "../Match";
import { Result } from "../interfaces/Result";
import { ScoringStrategy } from "../patternsInterface/ScoringStrategy";
import { Tournament, ManagedMatch } from "../Tournament";
import { Phase } from "./Phase";
import { GroupPhase } from "./GroupPhase";

interface LadderPosition {
  contestant: Contestant;
  isEliminated: boolean;
  finalRank?: number;
}

export class LadderPhase implements Phase {
  private activeContestants: Contestant[] = [];
  private ladderBrackets = new Map<string, LadderPosition>();
  private currentRoundMatchObjects: Match[] = []; // Raw Match objects for the current round
  private winner: Contestant | null = null;
  private runnerUp: Contestant | null = null;
  private thirdPlaceContestant: Contestant | null = null;
  private thirdPlaceMatchData: {
    cA: Contestant;
    cB: Contestant;
    matchObj?: Match;
  } | null = null;
  private matchesGeneratedForCurrentActiveSet: boolean = false;

  getName(): string {
    return "Knockout Ladder Stage";
  }

  setupPhase(contestants: Contestant[], tournamentContext: Tournament): void {
    this.activeContestants = [...contestants].sort(() => Math.random() - 0.5); // Shuffle
    this.ladderBrackets.clear();
    this.activeContestants.forEach((c) =>
      this.ladderBrackets.set(c.getId(), { contestant: c, isEliminated: false })
    );
    this.currentRoundMatchObjects = [];
    this.winner = null;
    this.runnerUp = null;
    this.thirdPlaceContestant = null;
    this.thirdPlaceMatchData = null;
    this.matchesGeneratedForCurrentActiveSet = false;

    if (this.activeContestants.length === 1) {
      this.winner = this.activeContestants[0];
      this.ladderBrackets.get(this.winner.getId())!.finalRank = 1;
    }
    // console.log(
    //   `LadderPhase: Setup complete with ${this.activeContestants.length} contestants.`
    // );
  }

  private getCurrentlyActiveContestants(): Contestant[] {
    return this.activeContestants.filter(
      (c) => !this.ladderBrackets.get(c.getId())?.isEliminated
    );
  }

  generateMatches(tournamentContext: Tournament): Match[] {
    if (this.winner) return [];

    if (
      this.matchesGeneratedForCurrentActiveSet &&
      !this.currentRoundAllPlayed(tournamentContext)
    ) {
      return this.currentRoundMatchObjects.filter((matchObj) => {
        const mm = tournamentContext
          .getAllManagedMatches()
          .find((m) => m.matchObject === matchObj);
        return mm && mm.status === "Scheduled";
      });
    }
    this.matchesGeneratedForCurrentActiveSet = false;
    this.currentRoundMatchObjects = [];

    const newMatchObjects: Match[] = [];
    const stillActive = this.getCurrentlyActiveContestants();

    if (stillActive.length < 2) {
      if (stillActive.length === 1 && !this.winner) {
        this.winner = stillActive[0];
        this.ladderBrackets.get(this.winner.getId())!.finalRank = 1;
      }
      // Check for 3rd place match
      if (this.thirdPlaceMatchData && !this.thirdPlaceMatchData.matchObj) {
        const tpmObserver = tournamentContext.createNewMatchObserver();
        const tpm = new Match(
          new Date(),
          this.thirdPlaceMatchData.cA,
          this.thirdPlaceMatchData.cB,
          tpmObserver
        );
        this.thirdPlaceMatchData.matchObj = tpm;
        newMatchObjects.push(tpm);
      }
      return newMatchObjects;
    }

    for (let i = 0; i < stillActive.length; i += 2) {
      if (i + 1 < stillActive.length) {
        const matchObserver = tournamentContext.createNewMatchObserver();
        const matchObj = new Match(
          new Date(),
          stillActive[i],
          stillActive[i + 1],
          matchObserver
        );
        this.currentRoundMatchObjects.push(matchObj);
        newMatchObjects.push(matchObj);
      }
    }
    if (this.currentRoundMatchObjects.length > 0)
      this.matchesGeneratedForCurrentActiveSet = true;

    // If this round had 4 participants (2 matches), the losers are semi-final losers.
    // We can't schedule 3rd place match until these matches are played and losers identified.
    if (
      stillActive.length === 4 &&
      this.currentRoundMatchObjects.length === 2
    ) {
      console.log(
        "LadderPhase: Semi-final matches generated. Awaiting results to determine 3rd place match contestants."
      );
    }
    console.log(
      `LadderPhase: Generated ${newMatchObjects.length} match instances.`
    );
    return newMatchObjects;
  }

  private currentRoundAllPlayed(tournamentContext: Tournament): boolean {
    if (
      this.currentRoundMatchObjects.length === 0 &&
      this.matchesGeneratedForCurrentActiveSet
    )
      return true; // if only one contestant left, no matches to play
    if (
      this.currentRoundMatchObjects.length === 0 &&
      !this.matchesGeneratedForCurrentActiveSet
    )
      return false; // Not generated yet
    return this.currentRoundMatchObjects.every((matchObj) => {
      const mm = tournamentContext
        .getAllManagedMatches()
        .find((m) => m.matchObject === matchObj);
      return mm && mm.status === "Finished";
    });
  }

  processMatchResult(
    matchObject: Match,
    finalResultObserver: Result,
    tournamentContext: Tournament
  ): void {
    const cA = matchObject.getContestantA();
    const cB = matchObject.getContestantB();
    const strategy = (finalResultObserver as any).strategy as ScoringStrategy;

    if (!strategy.isMatchOver()) {
      console.warn(
        `LadderPhase: Match result for ${cA.getTeamName()} vs ${cB.getTeamName()} processed, but strategy indicates match is not over!`
      );
      // This could lead to issues if not handled. Forcing it as over for phase logic.
    }
    const winnerId = strategy.getWinnerId(cA.getId(), cB.getId());

    const isThirdPlaceMatch =
      this.thirdPlaceMatchData?.matchObj === matchObject;

    if (!winnerId && !isThirdPlaceMatch) {
      console.warn(
        `LadderPhase: Knockout match ${cA.getTeamName()} vs ${cB.getTeamName()} requires a winner. Both marked eliminated.`
      );
      this.ladderBrackets.get(cA.getId())!.isEliminated = true;
      this.ladderBrackets.get(cB.getId())!.isEliminated = true;
      tournamentContext.getContestantPanel(cA.getId())?.recordOutcome("loss");
      tournamentContext.getContestantPanel(cB.getId())?.recordOutcome("loss");
      return;
    }

    const winner = winnerId === cA.getId() ? cA : cB;
    const loser = winnerId === cA.getId() ? cB : cA;

    if (winner && loser) {
      tournamentContext
        .getContestantPanel(winner.getId())
        ?.recordOutcome("win");
      tournamentContext
        .getContestantPanel(loser.getId())
        ?.recordOutcome("loss");
      this.ladderBrackets.get(loser.getId())!.isEliminated = true;
    }

    // Check if this was a semi-final match by looking at the number of active players *before* this round's matches resolved.
    // If currentRoundMatchObjects contains this match and had 2 matches total, it was semis.
    if (
      this.currentRoundMatchObjects.length === 2 &&
      this.currentRoundMatchObjects.includes(matchObject) &&
      loser
    ) {
      const currentSemiFinalLosers = this.currentRoundMatchObjects
        .map((m) => {
          const resObs = tournamentContext
            .getAllManagedMatches()
            .find((mm) => mm.matchObject === m)?.finalResultObserver;
          if (!resObs) return null; // Should not happen if match is processed
          const strat = (resObs as any).strategy as ScoringStrategy;
          if (!strat.isMatchOver()) return null;
          const wId = strat.getWinnerId(
            m.getContestantA().getId(),
            m.getContestantB().getId()
          );
          if (!wId) return null;
          return wId === m.getContestantA().getId()
            ? m.getContestantB()
            : m.getContestantA();
        })
        .filter(Boolean) as Contestant[];

      // If both semi-finals are now finished (current match was one of them)
      const allSemisPlayed = this.currentRoundMatchObjects.every(
        (mObj) =>
          tournamentContext
            .getAllManagedMatches()
            .find((mm) => mm.matchObject === mObj)?.status === "Finished"
      );

      if (
        allSemisPlayed &&
        currentSemiFinalLosers.length === 2 &&
        !this.thirdPlaceMatchData
      ) {
        this.thirdPlaceMatchData = {
          cA: currentSemiFinalLosers[0],
          cB: currentSemiFinalLosers[1],
        };
        console.log(
          `LadderPhase: Third place match to be scheduled between ${this.thirdPlaceMatchData.cA.getTeamName()} and ${this.thirdPlaceMatchData.cB.getTeamName()}`
        );
      }
    }

    if (isThirdPlaceMatch && winner) {
      this.thirdPlaceContestant = winner;
      this.ladderBrackets.get(winner.getId())!.finalRank = 3;
      if (loser) this.ladderBrackets.get(loser.getId())!.finalRank = 4;
      console.log(`LadderPhase: ${winner.getTeamName()} is 3rd place.`);
    } else if (winner) {
      // Not third place match, but a winner exists
      const stillActive = this.getCurrentlyActiveContestants();
      if (stillActive.length === 1 && !this.winner) {
        // This match was the final
        this.winner = stillActive[0]; // The one remaining active is the winner
        this.runnerUp = loser; // The loser of the match that produced the single winner
        this.ladderBrackets.get(this.winner.getId())!.finalRank = 1;
        if (this.runnerUp)
          this.ladderBrackets.get(this.runnerUp.getId())!.finalRank = 2;
        console.log(
          `LadderPhase: Final determined. Winner: ${this.winner.getTeamName()}, Runner-up: ${this.runnerUp?.getTeamName()}.`
        );
      }
    }
  }

  getPhaseStandings(): any {
    return {
      winner: this.winner?.getTeamName(),
      runnerUp: this.runnerUp?.getTeamName(),
      thirdPlace: this.thirdPlaceContestant?.getTeamName(),
      active: this.getCurrentlyActiveContestants().map((c) => c.getTeamName()),
    };
  }

  isComplete(tournamentContext: Tournament): boolean {
    if (this.winner) {
      if (!this.thirdPlaceMatchData) return true; // No 3rd place match needed/generated
      if (this.thirdPlaceMatchData && this.thirdPlaceMatchData.matchObj) {
        const mm = tournamentContext
          .getAllManagedMatches()
          .find((m) => m.matchObject === this.thirdPlaceMatchData!.matchObj);
        return !!(mm && mm.status === "Finished");
      }
      return false; // 3rd place match data exists but match not yet played/found in tournament
    }
    if (this.activeContestants.length <= 1 && this.winner) return true;
    return false;
  }

  getAdvancingContestants(): Contestant[] {
    const finishers: Contestant[] = [];
    const rankMap = new Map<number, Contestant>();
    this.ladderBrackets.forEach((pos) => {
      if (pos.finalRank) rankMap.set(pos.finalRank, pos.contestant);
    });
    if (this.winner && !Array.from(rankMap.values()).includes(this.winner))
      rankMap.set(1, this.winner);
    if (this.runnerUp && !Array.from(rankMap.values()).includes(this.runnerUp))
      rankMap.set(2, this.runnerUp);
    if (
      this.thirdPlaceContestant &&
      !Array.from(rankMap.values()).includes(this.thirdPlaceContestant)
    )
      rankMap.set(3, this.thirdPlaceContestant);

    return Array.from(rankMap.keys())
      .sort((a, b) => a - b)
      .map((rank) => rankMap.get(rank)!);
  }

  transitionToNextPhase(tournamentContext: Tournament): Phase | null {
    return null; // Final phase
  }
}
