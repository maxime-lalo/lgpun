import { Card } from './card.model';
export class Player {
  constructor(public pseudo: string, public party: number,public firstCard:Card,public actualCard: Card) {
  }
}