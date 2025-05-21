import { ScoringStrategy } from "../patternsInterface/ScoringStrategy";
import { ResultDependentEvent } from "../Event/ResultDependentEvent";
import { Observer } from "../patternsInterface/Observer";

export class Result implements Observer {
  private strategy: ScoringStrategy;

  constructor(private name: string, strategy: ScoringStrategy) {
    this.strategy = strategy;
  }

  update<T>(subject: ResultDependentEvent<T>): void {
    this.strategy.update(subject);
  }

  getResultEvents(): ResultDependentEvent<any>[] {
    return this.strategy.getResultEvents();
  }

  getCurrentResult(): void {
    this.strategy.getCurrentResult();
  }

  getCurrentScore(): any {
    return this.strategy.getCurrentScore();
  }
}




