import { ResultDependentEvent } from "../Event/ResultDependentEvent";
import { ScoringStrategy } from "../patternsInterface/ScoringStrategy";

export class BadmintonResult implements ScoringStrategy {
  private resultEvents: ResultDependentEvent<any>[] = [];
  private score: { [contestant: string]: { sets: number; points: number } } =
    {};
  private matchEnded: boolean = false;

  update<T>(subject: ResultDependentEvent<T>): void {
    if (this.matchEnded) return;

    this.resultEvents.push(subject);
    const contestant = subject.getContestant().getId();
    const opponent = subject.getOpponent().getId();

    if (!this.score[contestant]) {
      this.score[contestant] = { sets: 0, points: 0 };
    }
    if (!this.score[opponent]) {
      this.score[opponent] = { sets: 0, points: 0 };
    }

    this.score[contestant]["points"] += subject.getPoint();

    const contestantPoints = this.score[contestant]["points"];
    const opponentPoints = this.score[opponent]["points"];

    const reachedMax = contestantPoints >= 21;
    const leadEnough = contestantPoints - opponentPoints >= 2;
    const deuceMax = contestantPoints === 30;

    if ((reachedMax && leadEnough) || deuceMax) {
      this.score[contestant]["sets"] += 1;
      this.score[contestant]["points"] = 0;
      this.score[opponent]["points"] = 0;

      if (this.score[contestant]["sets"] === 2) {
        console.log(`Match won by ${contestant}`);
        this.matchEnded = true;
      }
    }
  }

  getCurrentScore(): any {
    return this.score;
  }

  getResultEvents(): ResultDependentEvent<any>[] {
    return this.resultEvents;
  }

  getCurrentResult(): void {
    for (const contestant in this.score) {
      console.log(
        `Contestant: ${contestant} - Sets: ${this.score[contestant].sets}, Points: ${this.score[contestant].points}`
      );
    }
  }

  isMatchOver(): boolean {
    return this.matchEnded;
  }

  getWinnerId(contestantAId: string, contestantBId: string): string | null {
    if (!this.matchEnded) return null;

    const contestantAScore = this.score[contestantAId];
    const contestantBScore = this.score[contestantBId];

    if (contestantAScore.sets === 2) {
      return contestantAId;
    } else if (contestantBScore.sets === 2) {
      return contestantBId;
    }
    return null;
  }
}
