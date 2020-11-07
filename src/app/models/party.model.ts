import { Player } from './player.model';
import { Card } from './card.model';

export class Party {
  constructor(public code:string, public numberOfPlayers:number,public cards:number[],public started:boolean,public turn:string,public players:any[],public creator:string,public notUsedCards:Card[],public lastTurn:string,public cardsHidden:boolean,public turnEnd) {}
}