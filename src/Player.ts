export class Player {
  private id: number;
  private name: string;
  private surname: string;

  constructor(id: number, name: string, surname: string) {
    this.id = id;
    this.name = name;
    this.surname = surname;
  }

  getId(): number {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getSurname(): string {
    return this.surname;
  }

  toString(): string {
    return `Player ${this.id}: ${this.name} ${this.surname}`;
  }
}
