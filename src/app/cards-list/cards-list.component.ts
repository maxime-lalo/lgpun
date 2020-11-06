import { Component, OnInit } from '@angular/core';
import { CardsService } from '../services/cards.service';
import { Card } from '../models/card.model';

@Component({
	selector: 'app-cards-list',
	templateUrl: './cards-list.component.html',
	styleUrls: ['./cards-list.component.scss']
})
export class CardsListComponent implements OnInit {
	cards: Card[];

	constructor(private cardsService: CardsService) {}

	ngOnInit() {
		this.cardsService.getCards().subscribe( (cards: Card[]) => {
			this.cards = cards;
		});
	}
}
