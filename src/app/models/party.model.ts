import { Player } from './player.model';
import { Card } from './card.model';

export class Party {
  constructor(public code:string, public numberOfPlayers:number,public cards:number[],public started:boolean,public turn:number,public players:string[],public creator:string) {}
}