import { Contestant } from "../Contestant";
import { Match } from "../Match";
import { Result } from "../interfaces/Result"; // Your Result Observer class
import { ScoringStrategy } from "../patternsInterface/ScoringStrategy"; // For type hint
import { Tournament, ManagedMatch } from "../Tournament"; // Import ManagedMatch
import { Phase } from "./Phase";
import { LadderPhase } from "./LadderPhase";

interface GroupStanding {
  contestantId: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  played: number;
}

export class GroupPhase implements Phase {
  private groupsData: Array<{
    name: string;
    contestants: Contestant[];
    standings: Map<string, GroupStanding>;
    phaseMatchObjects: Match[];
  }> = [];
  private teamsPerGroupToAdvance: number;
  private totalMatchesToPlayInPhase: number = 0;
  private allMatchesGenerated: boolean = false;

  constructor(private numberOfGroups: number = 1, teamsToAdvance: number = 1) {
    this.teamsPerGroupToAdvance = teamsToAdvance;
  }

  getName(): string {
    return "Group Stage";
  }

  setupPhase(contestants: Contestant[], tournamentContext: Tournament): void {
    this.groupsData = [];
    this.totalMatchesToPlayInPhase = 0;
    this.allMatchesGenerated = false;
    if (contestants.length === 0) return;

    for (let i = 0; i < this.numberOfGroups; i++) {
      this.groupsData.push({
        name: `Group ${String.fromCharCode(65 + i)}`,
        contestants: [],
        standings: new Map(),
        phaseMatchObjects: [],
      });
    }
    contestants.forEach((c, i) => {
      const group = this.groupsData[i % this.numberOfGroups];
      group.contestants.push(c);
      group.standings.set(c.getId(), {
        contestantId: c.getId(),
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        played: 0,
      });
    });
  }

  generateMatches(tournamentContext: Tournament): Match[] {
    if (this.allMatchesGenerated) return [];

    const newMatchObjects: Match[] = [];
    this.groupsData.forEach((group) => {
      for (let i = 0; i < group.contestants.length; i++) {
        for (let j = i + 1; j < group.contestants.length; j++) {
          const cA = group.contestants[i];
          const cB = group.contestants[j];
          const newMatchObserver = tournamentContext.createNewMatchObserver(); // fresh observer
          const matchObj = new Match(new Date(), cA, cB, newMatchObserver);
          newMatchObjects.push(matchObj);
          group.phaseMatchObjects.push(matchObj);
          this.totalMatchesToPlayInPhase++;
        }
      }
    });
    this.allMatchesGenerated = true;
    console.log(
      `GroupPhase: Generated ${newMatchObjects.length} match instances.`
    );
    return newMatchObjects;
  }

  processMatchResult(
    matchObject: Match,
    finalResultObserver: Result,
    tournamentContext: Tournament
  ): void {
    const cA = matchObject.getContestantA();
    const cB = matchObject.getContestantB();
    const group = this.groupsData.find(
      (g) =>
        g.contestants.some((c) => c.getId() === cA.getId()) &&
        g.contestants.some((c) => c.getId() === cB.getId())
    );
    if (!group) return;

    const standingA = group.standings.get(cA.getId())!;
    const standingB = group.standings.get(cB.getId())!;
    standingA.played++;
    standingB.played++;

    // Get current scoring strategy
    const strategy = (finalResultObserver as any).strategy as ScoringStrategy;
    const winnerId = strategy.getWinnerId(cA.getId(), cB.getId());

    if (winnerId === cA.getId()) {
      standingA.points += 3;
      standingA.wins++;
      standingB.losses++;
      tournamentContext.getContestantPanel(cA.getId())?.recordOutcome("win");
      tournamentContext.getContestantPanel(cA.getId())?.updatePoints(3);
      tournamentContext.getContestantPanel(cB.getId())?.recordOutcome("loss");
      tournamentContext.getContestantPanel(cB.getId())?.updatePoints(0);
    } else if (winnerId === cB.getId()) {
      standingB.points += 3;
      standingB.wins++;
      standingA.losses++;
      tournamentContext.getContestantPanel(cB.getId())?.recordOutcome("win");
      tournamentContext.getContestantPanel(cB.getId())?.updatePoints(3);
      tournamentContext.getContestantPanel(cA.getId())?.recordOutcome("loss");
      tournamentContext.getContestantPanel(cA.getId())?.updatePoints(0);
    } else {
      // Draw
      standingA.points += 1;
      standingA.draws++;
      standingB.points += 1;
      standingB.draws++;
      tournamentContext.getContestantPanel(cA.getId())?.recordOutcome("draw");
      tournamentContext.getContestantPanel(cA.getId())?.updatePoints(1);
      tournamentContext.getContestantPanel(cB.getId())?.recordOutcome("draw");
      tournamentContext.getContestantPanel(cB.getId())?.updatePoints(1);
    }
  }

  getPhaseStandings(): any {
    return this.groupsData.map((g) => ({
      groupName: g.name,
      standings: Array.from(g.standings.values()).sort(
        (a, b) => b.points - a.points || b.wins - a.wins
      ),
    }));
  }

  isComplete(tournamentContext: Tournament): boolean {
    if (!this.allMatchesGenerated) return false;
    if (this.totalMatchesToPlayInPhase === 0) return true;

    let playedCount = 0;
    this.groupsData.forEach((group) => {
      group.phaseMatchObjects.forEach((phaseMatchObj) => {
        const managed = tournamentContext
          .getAllManagedMatches()
          .find((mm) => mm.matchObject === phaseMatchObj);
        if (managed && managed.status === "Finished") {
          playedCount++;
        }
      });
    });
    return playedCount >= this.totalMatchesToPlayInPhase;
  }

  getAdvancingContestants(tournamentContext: Tournament): Contestant[] {
    const advancing: Contestant[] = [];
    this.groupsData.forEach((group) => {
      const sorted = Array.from(group.standings.values())
        .sort((a, b) => b.points - a.points || b.wins - a.wins)
        .slice(0, this.teamsPerGroupToAdvance);
      sorted.forEach((s) =>
        advancing.push(tournamentContext.getContestant(s.contestantId)!)
      );
    });
    return advancing;
  }

  transitionToNextPhase(tournamentContext: Tournament): Phase | null {
    const adv = this.getAdvancingContestants(tournamentContext);
    return adv.length >= 2 ? new LadderPhase() : null;
  }
}
