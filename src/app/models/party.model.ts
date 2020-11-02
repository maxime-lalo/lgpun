import { Player } from './player.model';
import { Card } from './card.model';

export class Party {
  constructor(public code:string, public numberOfPlayers:number,public cards:number[], public players:any[]) {}
}