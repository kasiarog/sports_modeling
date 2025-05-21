import { ResultDependentEvent } from "../Event/ResultDependentEvent";

export interface ScoringStrategy {
  update<T>(subject: ResultDependentEvent<T>): void;
  getCurrentScore(): any;
  getResultEvents(): ResultDependentEvent<any>[];
  getCurrentResult(): void;
}
