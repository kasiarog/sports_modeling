import { ResultDependentEvent } from "../Event/ResultDependentEvent";
import { ScoringStrategy } from "../patternsInterface/ScoringStrategy";

export class SoccerResult implements ScoringStrategy {
  private resultEvents: ResultDependentEvent<any>[] = [];
  private goals: { [contestant: string]: number } = {};
  private score: { [contestant: string]: number } = {};
  private penalties: { [contestant: string]: number } = {};
  private ownGoals: { [contestant: string]: number } = {};

  update<T>(subject: ResultDependentEvent<T>): void {
    this.resultEvents.push(subject);
    const contestant = subject.getContestant().getId();
    const opponent = subject.getOpponent().getId();
    const point = subject.getPoint();
    const description = subject.getDescription().toLowerCase();

    if (!this.score[contestant]) {
      this.goals[contestant] = 0;
      this.penalties[contestant] = 0;
      this.ownGoals[contestant] = 0;
      this.score[contestant] = 0;
    }

    if (description.includes("penalty")) {
      this.penalties[contestant] += 1;
      this.score[contestant] += point;
    } else if (description.includes("own goal")) {
      this.ownGoals[contestant] += 1;
      this.score[opponent] += 1;
    } else {
      this.goals[contestant] += point;
      this.score[contestant] += point;
    }
  }

  getCurrentScore(): any {
    return {
      goals: this.goals,
      penalties: this.penalties,
      ownGoals: this.ownGoals,
      score: this.score,
    };
  }

  getResultEvents(): ResultDependentEvent<any>[] {
    return this.resultEvents;
  }

  getCurrentResult(): void {
    var scores: number[] = []
    for (const contestant in this.score) {
      console.log(`Contestant: ${contestant}`);
      console.log(`  Goals: ${this.goals[contestant]}`);
      console.log(`  Penalties: ${this.penalties[contestant]}`);
      console.log(`  Own Goals: ${this.ownGoals[contestant]}`);
      scores.push(this.score[contestant])
    }
    console.log(`Final score: ${scores[0]}:${scores[1]}`)
  }
}
