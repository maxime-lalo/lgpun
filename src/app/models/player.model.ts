import { Card } from './card.model';
export class Player {
  constructor(public id:number, public pseudo: string, public party: number,public firstCard:Card,public actualCard: Card) {
  }
}