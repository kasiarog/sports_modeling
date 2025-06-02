import { Contestant } from "./Contestant";
import { Match } from "./Match";
import { Result } from "./Result/Result";
import { ContestantTournamentPanel } from "./ContestantTournamentPanel";
import { Phase } from "./Phase/Phase";

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

export class Tournament {
  private static instance: Tournament;

  private tournamentName: string;
  private contestants: Contestant[];
  private matches: Match[];
  private contestantPanels: Map<string, ContestantTournamentPanel>;
  public status: TournamentStatus;
  private nextMatchIdCounter: number;

  private currentPhase: Phase | null = null;
  private phaseHistory: Phase[] = [];

  private constructor(name: string = "Tournament") {
    this.tournamentName = name;
    this.contestants = [];
    this.matches = [];
    this.contestantPanels = new Map();
    this.status = "NotStarted";
    this.nextMatchIdCounter = 1;
    //console.log(`Tournament "${this.tournamentName}" initialized.`);
  }

  public static getInstance(name?: string): Tournament {
    if (!Tournament.instance) {
      Tournament.instance = new Tournament(name);
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

    if (!this.contestants.find((ct) => ct.getId() === c.getId())) {
      // Check if contestant is already in the tournament
      this.contestants.push(c);
      this.contestantPanels.set(c.getId(), new ContestantTournamentPanel(c));
      //   console.log(
      //     `Contestant ${c.getTeamName()} added to "${this.tournamentName}".`
      //   );
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
        contestantsForPhase = previousPhase.getAdvancingContestants();
      } else {
        contestantsForPhase = [...this.getAllContestants()];
      }
    } else {
      // Re-setting up the same phase instance?
    }

    this.currentPhase.setupPhase(contestantsForPhase, this);
    const phaseMatches = this.currentPhase.generateMatches(this);

    this.addMatchesToTournamentSchedule(
      phaseMatches,
      this.currentPhase.getName()
    );

    if (phaseMatches.length === 0 && contestantsForPhase.length > 0) {
      // Check if phase is complete from setup
      this.checkPhaseCompletionAndTransition();
    }
  }

  private addMatchesToTournamentSchedule(newMatches: Match[]): void {
    newMatches.forEach((match) => {
      if (!this.matches.find((m) => m.id === match.id)) {
        this.matches.push(match);
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

  public assignNextMatches(): Match[] {
    if (this.status !== "InProgress" || !this.currentPhase) {
      return [];
    }
    const phaseMatches = this.currentPhase.generateMatches(this);
    this.addMatchesToTournamentSchedule(phaseMatches);
    return phaseMatches;
  }

  public recordMatchResult(matchId: string, result: Result): void {
    const match = this.matches.find((m) => m.id === matchId);
    if (!match) {
      console.error(`Match ${matchId} not found in "${this.tournamentName}".`);
      return;
    }
    if (match.status === "Finished") {
      console.warn(`Match ${matchId} already finished.`);
      return;
    }
    if (match.status === "Cancelled") {
      console.warn(`Match ${matchId} is cancelled.`);
      return;
    }

    match.result = result;
    match.status = "Finished";

    this.getContestantPanel(match.contestantA.getId())?.logMatch(match, result);
    this.getContestantPanel(match.contestantB.getId())?.logMatch(match, result);

    if (this.currentPhase) {
      this.currentPhase.processMatchResult(match, result, this);
      this.checkPhaseCompletionAndTransition();
    }

    this.updateRankingDisplay();
  }

  private checkPhaseCompletionAndTransition(): void {
    if (this.currentPhase && this.currentPhase.isComplete(this)) {
      const advancingContestants = this.currentPhase.getAdvancingContestants();
      const nextPhaseInstance = this.currentPhase.transitionToNextPhase(this);

      this.currentPhase = nextPhaseInstance;

      if (this.currentPhase) {
        this.phaseHistory.push(this.currentPhase);
        this.currentPhase.setupPhase(advancingContestants, this);
        const newPhaseMatches = this.currentPhase.generateMatches(this);
        this.addMatchesToTournamentSchedule(newPhaseMatches);

        if (newPhaseMatches.length === 0 && advancingContestants.length > 0) {
          this.checkPhaseCompletionAndTransition(); // Recursive check for intant completion
        } else if (
          advancingContestants.length === 0 &&
          this.currentPhase.getName()
        ) {
          // No one advanced to this new phase
          console.log(
            `New phase ${this.currentPhase.getName()} has no contestants`
          );
          this.checkPhaseCompletionAndTransition();
        }
      } else {
        console.log(`All phases of tournament complete.`);
        this.finishTournament();
      }
    }
  }

  public getMatch(matchId: string): Match | undefined {
    return this.matches.find((m) => m.id === matchId);
  }

  public getAllMatches(): Match[] {
    return [...this.matches];
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
      //console.log(`"${this.tournamentName}" is already finished.`);
      return;
    }

    this.status = "Finished";
    console.log(`Tournament "${this.tournamentName}" has officially finished.`);
    let finalMessage = `Final standings for "${this.tournamentName}":`;

    if (this.phaseHistory.length > 0) {
      const lastCompletedPhase =
        this.phaseHistory[this.phaseHistory.length - 1];
      const finishers = lastCompletedPhase.getAdvancingContestants();
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
        this.phaseHistory[
          this.phaseHistory.length - 1
        ].getAdvancingContestants().length === 0)
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
    this.matches = [];
    this.contestantPanels.clear();
    this.status = "NotStarted";
    this.nextMatchIdCounter = 1;
    this.currentPhase = null;
    this.phaseHistory = [];
    console.log(`Tournament instance reset to "${this.tournamentName}".`);
  }
}
