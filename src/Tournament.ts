import { Contestant } from "./Contestant";
import { Match } from "./Match";
import { Result } from "./interfaces/Result";
import { ContestantTournamentPanel } from "./ContestantTournamentPanel";
import { Phase } from "./Phase/Phase";
import { ScoringStrategy } from "./patternsInterface/ScoringStrategy";

export type TournamentStatus =
  | "NotStarted"
  | "RegistrationOpen"
  | "InProgress"
  | "Finished"
  | "Cancelled";

export interface RankingEntry {
  contestantId: string;
  teamName: string;
  rank: number;
  points: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  [key: string]: any;
}

export type MatchStatus = "Scheduled" | "Finished" | "Cancelled";

export interface ManagedMatch {
  id: string;
  matchObject: Match; // The original Match instance
  status: MatchStatus;
  finalResultObserver?: Result; // Result instance for the end of the match
}

export class Tournament {
  private static instance: Tournament;

  private currentScoringStrategy: Result | null = null;
  private tournamentName: string;
  private contestants: Contestant[];

  private managedMatches: ManagedMatch[];
  private contestantPanels: Map<string, ContestantTournamentPanel>;
  public status: TournamentStatus;
  private nextMatchIdCounter: number;

  private currentPhase: Phase | null = null;
  private phaseHistory: Phase[] = [];

  private scoringStrategyType: (new () => ScoringStrategy) | null = null;
  private disciplineName: string = "unknown";

  private constructor(name: string = "Tournament", scoringStrategy: Result) {
    this.tournamentName = name;
    this.contestants = [];
    this.managedMatches = [];
    this.contestantPanels = new Map();
    this.status = "NotStarted";
    this.nextMatchIdCounter = 1;
    this.currentScoringStrategy = scoringStrategy;
    console.log(`Tournament "${this.tournamentName}" initialized.`);
  }

  public static getInstance(
    scoringStrategy: Result,
    name?: string
  ): Tournament {
    if (!Tournament.instance) {
      Tournament.instance = new Tournament(name, scoringStrategy);
    }
    if (
      name &&
      Tournament.instance.tournamentName === "Tournament" &&
      Tournament.instance.status === "NotStarted" &&
      Tournament.instance.contestants.length === 0
    ) {
      Tournament.instance.tournamentName = name;
    }
    return Tournament.instance;
  }

  public setScoringStrategyType(
    strategyType: new () => ScoringStrategy,
    disciplineName: string
  ): void {
    if (this.status === "NotStarted") {
      this.scoringStrategyType = strategyType;
      this.disciplineName = disciplineName;
      console.log(
        `Tournament "${this.tournamentName}" scoring strategy type set to: ${disciplineName}`
      );
    } else {
      console.warn(
        "Scoring strategy can only be set before the tournament starts or registration opens."
      );
    }
  }

  public getCurrentScoringStrategy(): Result {
    if (!this.currentScoringStrategy) {
      console.error(
        `CRITICAL: Tournament "${this.tournamentName}" does not have a current scoring strategy set!`
      );
      throw new Error(
        "Scoring strategy not set in Tournament. Use tournament.setScoringStrategy()."
      );
    }
    return this.currentScoringStrategy;
  }

  public createNewMatchObserver(): Result {
    if (!this.scoringStrategyType) {
      throw new Error(
        "Scoring strategy type not set in Tournament. Use tournament.setScoringStrategyType()."
      );
    }
    const strategyInstance = new this.scoringStrategyType();
    //strategyInstance.reset(); // Ensure it's fresh
    return new Result(
      `${this.disciplineName} Match Observer`,
      strategyInstance
    );
  }

  public generateNewMatchId(): string {
    return `M${this.nextMatchIdCounter++}`;
  }

  public getTournamentName(): string {
    return this.tournamentName;
  }

  public getStatus(): TournamentStatus {
    return this.status;
  }

  public addContestant(c: Contestant): boolean {
    if (this.status !== "NotStarted" && this.status !== "RegistrationOpen") {
      console.warn(
        `Cannot add contestants to "${this.tournamentName}". Status: ${this.status}.`
      );
      return false;
    }

    // Check if contestant is already in the tournament
    if (!this.contestants.find((ct) => ct.getId() === c.getId())) {
      this.contestants.push(c);
      this.contestantPanels.set(c.getId(), new ContestantTournamentPanel(c));
      console.log(
        `Contestant ${c.getTeamName()} added to "${this.tournamentName}".`
      );
      return true;
    }
    console.warn(
      `Contestant ${c.getTeamName()} already in "${this.tournamentName}".`
    );
    return false;
  }

  public getContestant(id: string): Contestant | undefined {
    return this.contestants.find((c) => c.getId() === id);
  }

  public getAllContestants(): Contestant[] {
    return [...this.contestants];
  }

  public getContestantPanel(id: string): ContestantTournamentPanel | undefined {
    return this.contestantPanels.get(id);
  }

  public openRegistration(): void {
    if (this.status === "NotStarted") this.status = "RegistrationOpen";
  }

  public closeRegistration(): void {
    if (this.status === "RegistrationOpen" || this.status === "NotStarted")
      this.status = "NotStarted";
  }

  public setInitialPhase(phase: Phase): void {
    if (this.status === "NotStarted" || this.status === "RegistrationOpen") {
      this.currentPhase = phase;
      console.log(
        `Initial phase for "${this.tournamentName}" set to: ${phase.getName()}`
      );
    } else {
      console.warn(
        `Cannot set initial phase for "${this.tournamentName}", status: ${this.status}`
      );
    }
  }

  private setupCurrentPhase(): void {
    if (!this.currentPhase) {
      console.warn("No current phase is set.");
      return;
    }

    let contestantsForPhase: Contestant[] = [];
    if (
      this.phaseHistory.length === 0 ||
      this.phaseHistory[this.phaseHistory.length - 1] !== this.currentPhase
    ) {
      if (this.phaseHistory.length > 0) {
        const previousPhase = this.phaseHistory[this.phaseHistory.length - 1];
        contestantsForPhase = previousPhase.getAdvancingContestants(this);
      } else {
        contestantsForPhase = [...this.getAllContestants()];
      }
    } else {
      contestantsForPhase =
        this.currentPhase.getAdvancingContestants(this).length > 0
          ? this.currentPhase.getAdvancingContestants(this)
          : [...this.getAllContestants()];
    }

    this.currentPhase.setupPhase(contestantsForPhase, this);
    const phaseMatches = this.currentPhase.generateMatches(this);
    this.addMatchesToTournamentSchedule(phaseMatches);

    if (phaseMatches.length === 0 && contestantsForPhase.length > 0) {
      // Check if phase is complete from setup
      this.checkPhaseCompletionAndTransition();
    }
  }

  private addMatchesToTournamentSchedule(newMatchObjects: Match[]): void {
    newMatchObjects.forEach((matchObject) => {
      // Check if a match (with same contestants) is already scheduled
      const existing = this.managedMatches.find(
        (mm) =>
          mm.status === "Scheduled" &&
          ((mm.matchObject.getContestantA().getId() ===
            matchObject.getContestantA().getId() &&
            mm.matchObject.getContestantB().getId() ===
              matchObject.getContestantB().getId()) ||
            (mm.matchObject.getContestantA().getId() ===
              matchObject.getContestantB().getId() &&
              mm.matchObject.getContestantB().getId() ===
                matchObject.getContestantA().getId()))
      );

      if (!existing) {
        const newManagedMatch: ManagedMatch = {
          id: this.generateNewMatchId(),
          matchObject: matchObject,
          status: "Scheduled",
        };
        this.managedMatches.push(newManagedMatch);
        console.log(
          `Match ${newManagedMatch.id} (${matchObject
            .getContestantA()
            .getTeamName()} vs ${matchObject
            .getContestantB()
            .getTeamName()}) added to schedule.`
        );
      }
    });
  }

  public startTournament(): void {
    if (this.status !== "NotStarted" && this.status !== "RegistrationOpen") {
      console.warn(
        `"${this.tournamentName}" cannot be started. Status: ${this.status}.`
      );
      return;
    }
    if (this.contestants.length < 1) {
      console.warn(
        `"${this.tournamentName}" cannot start with fewer than 1 contestant.`
      );
      return;
    }
    if (!this.currentScoringStrategy) {
      console.error(
        `Tournament "${this.tournamentName}" cannot start: Scoring strategy not set. Use setScoringStrategy().`
      );
      return;
    }
    if (!this.currentPhase) {
      console.error(
        `"${this.tournamentName}" cannot start: No initial phase set.`
      );
      return;
    }
    this.status = "InProgress";
    console.log(
      `Tournament "${
        this.tournamentName
      }" has begun with phase: ${this.currentPhase.getName()}!`
    );
    if (!this.phaseHistory.includes(this.currentPhase)) {
      this.phaseHistory.push(this.currentPhase);
    }
    this.setupCurrentPhase();
  }

  public assignNextMatches(): ManagedMatch[] {
    if (this.status !== "InProgress" || !this.currentPhase) {
      return [];
    }
    const phaseGeneratedMatchObjects = this.currentPhase.generateMatches(this);
    this.addMatchesToTournamentSchedule(phaseGeneratedMatchObjects);
    // Return newly added scheduled matches
    return this.managedMatches.filter(
      (mm) =>
        mm.status === "Scheduled" &&
        phaseGeneratedMatchObjects.includes(mm.matchObject)
    );
  }

  public recordMatchResult(matchId: string, finalResultObserver: Result): void {
    const managedMatch = this.managedMatches.find((mm) => mm.id === matchId);
    if (!managedMatch) {
      console.error(
        `ManagedMatch ${matchId} not found in "${this.tournamentName}".`
      );
      return;
    }
    if (managedMatch.status === "Finished") {
      console.warn(`Match ${matchId} already finished.`);
      return;
    }
    if (managedMatch.status === "Cancelled") {
      console.warn(`Match ${matchId} is cancelled.`);
      return;
    }

    managedMatch.status = "Finished";
    managedMatch.finalResultObserver = finalResultObserver; // Store the observer with final state

    // Log to ContestantTournamentPanel using original Match object and Result observer
    const panelA = this.getContestantPanel(
      managedMatch.matchObject.getContestantA().getId()
    );
    const panelB = this.getContestantPanel(
      managedMatch.matchObject.getContestantB().getId()
    );

    const tempMatchForPanelLog = new Match(
      managedMatch.matchObject.getDate(),
      managedMatch.matchObject.getContestantA(),
      managedMatch.matchObject.getContestantB(),
      finalResultObserver // finalResultObserver as the observer for the Match instance
    );

    // adding all the events from the original Match object
    managedMatch.matchObject.getEvents().forEach((event) => {
      tempMatchForPanelLog.addEvent(event);
    });
    panelA?.logMatch(tempMatchForPanelLog as Match, finalResultObserver);
    panelB?.logMatch(tempMatchForPanelLog as Match, finalResultObserver);

    if (this.currentPhase) {
      // Pass the original Match object and its final Result observer to the phase
      this.currentPhase.processMatchResult(
        managedMatch.matchObject,
        finalResultObserver,
        this
      );
      this.checkPhaseCompletionAndTransition();
    }
    this.updateRankingDisplay();
  }

  private checkPhaseCompletionAndTransition(): void {
    if (this.currentPhase && this.currentPhase.isComplete(this)) {
      const advancingContestants =
        this.currentPhase.getAdvancingContestants(this);
      const nextPhaseInstance = this.currentPhase.transitionToNextPhase(this);
      this.currentPhase = nextPhaseInstance;

      if (this.currentPhase) {
        this.phaseHistory.push(this.currentPhase);
        this.currentPhase.setupPhase(advancingContestants, this); // Setup with advancers
        const newRawMatches = this.currentPhase.generateMatches(this); // Get raw Match objects
        this.addMatchesToTournamentSchedule(newRawMatches); // Tournament wraps and schedules them

        if (newRawMatches.length === 0 && advancingContestants.length > 0) {
          this.checkPhaseCompletionAndTransition();
        } else if (
          advancingContestants.length === 0 &&
          this.currentPhase.getName()
        ) {
          this.checkPhaseCompletionAndTransition();
        }
      } else {
        this.finishTournament();
      }
    }
  }

  public getManagedMatch(matchId: string): ManagedMatch | undefined {
    return this.managedMatches.find((mm) => mm.id === matchId);
  }

  public getAllManagedMatches(): ManagedMatch[] {
    return [...this.managedMatches];
  }

  private updateRankingDisplay(): void {}

  public getRanking(): RankingEntry[] {
    const ranking: RankingEntry[] = [];
    this.contestantPanels.forEach((panel) => {
      const stats = panel.getTournamentStats();
      ranking.push({
        contestantId: panel.getContestantId(),
        teamName: panel.getContestant().getTeamName(),
        rank: 0,
        points: stats.points,
        matchesPlayed: stats.matchesPlayed,
        wins: stats.wins,
        losses: stats.losses,
        draws: stats.draws,
      });
    });
    ranking.sort(
      (a, b) =>
        b.points - a.points ||
        b.wins - a.wins ||
        a.teamName.localeCompare(b.teamName)
    );
    ranking.forEach((entry, index, arr) => {
      entry.rank =
        index > 0 &&
        entry.points === arr[index - 1].points &&
        entry.wins === arr[index - 1].wins
          ? arr[index - 1].rank
          : index + 1;
    });
    return ranking;
  }

  public finishTournament(): void {
    if (this.status === "Finished") {
      console.log(`"${this.tournamentName}" is already finished.`);
      return;
    }

    this.status = "Finished";
    console.log(`Tournament "${this.tournamentName}" has officially finished.`);
    let finalMessage = `Final standings for "${this.tournamentName}":`;

    if (this.phaseHistory.length > 0) {
      const lastCompletedPhase =
        this.phaseHistory[this.phaseHistory.length - 1];
      const finishers = lastCompletedPhase.getAdvancingContestants(this);
      if (finishers.length > 0) {
        finalMessage += `\nTop finishers from ${lastCompletedPhase.getName()}:`;
        finishers.forEach(
          (c, i) => (finalMessage += `\n  ${i + 1}. ${c.getTeamName()}`)
        );
      }
    }
    console.log(finalMessage);
    const overallRanking = this.getRanking();
    if (
      overallRanking.length > 0 &&
      (this.phaseHistory.length === 0 ||
        this.phaseHistory[this.phaseHistory.length - 1].getAdvancingContestants(
          this
        ).length === 0)
    ) {
      console.log("Overall ranking based on accumulated stats:");
      overallRanking.forEach((r) =>
        console.log(
          `#${r.rank} ${r.teamName} - Pts: ${r.points}, WLD: ${r.wins}/${r.losses}/${r.draws}`
        )
      );
    } else if (overallRanking.length === 0) {
      console.log("No ranking data available.");
    }
  }

  public resetTournamentForTesting(newName?: string): void {
    console.warn(`Resetting routnament`);
    this.tournamentName = newName || "Tournament Reset";
    this.contestants = [];
    this.managedMatches = [];
    this.contestantPanels.clear();
    this.status = "NotStarted";
    this.nextMatchIdCounter = 1;
    this.currentPhase = null;
    this.phaseHistory = [];
    console.log(`Tournament instance reset to "${this.tournamentName}".`);
  }
}
