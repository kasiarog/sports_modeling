import { Contestant } from "./Contestant";
import { Match } from "./Match";
import { Result } from "./Result/Result";

interface PlayedMatchInfo {
  matchId: string;
  opponent: Contestant;
  result: Result;
  date: Date;
}

export class ContestantTournamentPanel {
  private contestant: Contestant;
  private matchHistory: PlayedMatchInfo[];
  private totalPoints: number;
  private wins: number;
  private losses: number;
  private draws: number;

  constructor(contestant: Contestant) {
    this.contestant = contestant;
    this.matchHistory = [];
    this.totalPoints = 0;
    this.wins = 0;
    this.losses = 0;
    this.draws = 0;
  }

  public getContestantId(): string {
    return this.contestant.getId();
  }

  public getContestant(): Contestant {
    return this.contestant;
  }

  public logMatch(match: Match, rawResult: Result): void {
    if (match.status !== "Finished" || !rawResult) {
      // console.warn(`Match ${match.id} cannot be logged: it's not finished or has no result.`);
      return;
    }

    const opponent =
      match.contestantA.getId() === this.contestant.getId()
        ? match.contestantB
        : match.contestantA;

    this.matchHistory.push({
      matchId: match.id,
      opponent: opponent,
      result: rawResult,
      date: match.scheduledTime || new Date(),
    });
  }

  public getMatchHistory(): PlayedMatchInfo[] {
    return [...this.matchHistory];
  }

  public getTournamentStats(): {
    points: number;
    wins: number;
    losses: number;
    draws: number;
    matchesPlayed: number;
  } {
    return {
      points: this.totalPoints,
      wins: this.wins,
      losses: this.losses,
      draws: this.draws,
      matchesPlayed: this.matchHistory.length,
    };
  }

  public updatePoints(points: number): void {
    this.totalPoints += points;
  }

  public recordOutcome(outcome: "win" | "loss" | "draw"): void {
    switch (outcome) {
      case "win":
        this.wins++;
        break;
      case "loss":
        this.losses++;
        break;
      case "draw":
        this.draws++;
        break;
    }
  }
}
