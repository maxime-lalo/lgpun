import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Card } from '../models/card.model';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import DataSnapshot = firebase.database.DataSnapshot;

@Injectable({
	providedIn: 'root'
})
export class CardsService {
	cards: Card[] = [];
	cardsSubject = new Subject<Card[]>();

	constructor() { 
		
	}

	emitCards(){
		this.cardsSubject.next(this.cards);
	}

	saveCards(){
		firebase.database().ref('/cards').set(this.cards);
	}

	getCards(){
		firebase.database().ref('/cards').on('value', (data: DataSnapshot) => {
			this.cards = data.val() ? data.val() : [];
			this.emitCards();
		});
	}

	getAvailableCards(){
		firebase.database().ref('/availableCards').on('value', (data: DataSnapshot) => {
			this.cards = data.val() ? data.val() : [];
			this.emitCards();
		});
	}

	getSingleCard(id: number){
		return new Promise( (resolve,reject) => {
			firebase.database().ref('/cards/' + id).once('value').then( (data : DataSnapshot) => {
				resolve(data.val());
			},
			(error) => {
				reject(error);
			});
		});
	}
}
