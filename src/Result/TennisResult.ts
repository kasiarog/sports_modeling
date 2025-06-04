import { ResultDependentEvent } from "../Event/ResultDependentEvent";
import { ScoringStrategy } from "../patternsInterface/ScoringStrategy";

export class TennisResult implements ScoringStrategy {
  private resultEvents: ResultDependentEvent<any>[] = [];
  private score: {
    [contestant: string]: { sets: number; games: number; points: number };
  } = {};
  private matchEnded: boolean = false;

  private pointsMap = [0, 15, 30, 40];

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.resultEvents = [];
    this.score = {};
    this.matchEnded = false;
  }

  update<T>(subject: ResultDependentEvent<T>): void {
    if (this.matchEnded) return;

    const contestant = subject.getContestant().getId();
    const opponent = subject.getOpponent().getId();
    this.resultEvents.push(subject);

    for (const id of [contestant, opponent]) {
      if (!this.score[id]) {
        this.score[id] = { sets: 0, games: 0, points: 0 };
      }
    }

    const pointValue = subject.getPoint();
    for (let i = 0; i < pointValue; i++) {
      this.processSinglePoint(contestant, opponent);
      if (this.matchEnded) break;
    }
  }

  private processSinglePoint(contestant: string, opponent: string): void {
    let contestantPoints = this.score[contestant].points;
    let opponentPoints = this.score[opponent].points;

    if (contestantPoints >= 3 && opponentPoints >= 3) {
      if (contestantPoints === opponentPoints) {
        this.score[contestant].points++;
      } else if (contestantPoints === opponentPoints + 1) {
        this.winGame(contestant, opponent);
      } else {
        this.score[contestant].points = 3;
        this.score[opponent].points = 3;
      }
    } else if (contestantPoints === 3) {
      this.winGame(contestant, opponent);
    } else {
      this.score[contestant].points++;
    }
  }

  private winGame(contestant: string, opponent: string): void {
    this.score[contestant].games += 1;
    this.score[contestant].points = 0;
    this.score[opponent].points = 0;

    if (
      this.score[contestant].games >= 6 &&
      this.score[contestant].games - this.score[opponent].games >= 2
    ) {
      this.score[contestant].sets += 1;
      this.score[contestant].games = 0;
      this.score[opponent].games = 0;
    }

    if (this.score[contestant].sets === 2) {
      console.log(`Match won by ${contestant}`);
      this.matchEnded = true;
    }
  }

  getCurrentScore(): any {
    const readableScore: {
      [id: string]: { sets: number; games: number; points: string };
    } = {};
    for (const id in this.score) {
      const pts = this.score[id].points;
      const readablePts =
        pts > 3 ? (pts === 4 ? "Ad" : "??") : this.pointsMap[pts];
      readableScore[id] = {
        sets: this.score[id].sets,
        games: this.score[id].games,
        points: readablePts.toString(),
      };
    }
    return readableScore;
  }

  getResultEvents(): ResultDependentEvent<any>[] {
    return this.resultEvents;
  }

  getCurrentResult(): void {
    for (const contestant in this.score) {
      const readablePts =
        this.score[contestant].points > 3
          ? this.score[contestant].points === 4
            ? "Ad"
            : "??"
          : this.pointsMap[this.score[contestant].points];
      console.log(
        `Contestant: ${contestant} - Sets: ${this.score[contestant].sets}, Games: ${this.score[contestant].games}, Points: ${readablePts}`
      );
    }
  }

  isMatchOver(): boolean {
    return this.matchEnded;
  }

  getWinnerId(contestantAId: string, contestantBId: string): string | null {
    if (this.matchEnded) {
      return this.score[contestantAId].sets > this.score[contestantBId].sets
        ? contestantAId
        : contestantBId;
    }
    return null;
  }
}
