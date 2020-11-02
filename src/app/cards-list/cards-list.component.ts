import { Component, OnDestroy, OnInit } from '@angular/core';
import { CardsService } from '../services/cards.service';
import { Card } from '../models/card.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
	selector: 'app-cards-list',
	templateUrl: './cards-list.component.html',
	styleUrls: ['./cards-list.component.scss']
})
export class CardsListComponent implements OnInit, OnDestroy {
	cards: Card[];
	cardsSubscription: Subscription;

	constructor(private cardsService: CardsService, private router: Router) {}

	ngOnInit() {
		this.cardsService.getCards();
		this.cardsSubscription = this.cardsService.cardsSubject.subscribe( (cards: Card[]) => {
			this.cards = cards;
		});
		this.cardsService.emitCards();
	}

	ngOnDestroy() {
		this.cardsSubscription.unsubscribe();
	}
}
