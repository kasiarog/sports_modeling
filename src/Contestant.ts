import { Player } from "./Player";

export class Contestant {
  private id: string;
  private teamName: string;
  private players: Player[];

  constructor(id: string, teamName: string, players: Player[] = []) {
    this.id = id;
    this.teamName = teamName;
    this.players = players;
  }

  addPlayer(player: Player): void {
    if (!this.players.find(p => p.getId() === player.getId())) {
      this.players.push(player);
    }
  }

  removePlayer(playerId: number): void {
    this.players = this.players.filter(p => p.getId() !== playerId);
  }

  getPlayers(): Player[] {
    return [...this.players];
  }

  getPlayerById(playerId: number): Player | undefined {
    return this.players.find(p => p.getId() === playerId);
  }

  getId(): string {
    return this.id;
  }

  getTeamName(): string {
    return this.teamName;
  }

  toString(): string {
    const playerNames = this.players.map(p => `${p.getName()} ${p.getSurname()}`).join(", ");
    return `${this.teamName} [${this.id}]: ${playerNames}`;
  }
}
