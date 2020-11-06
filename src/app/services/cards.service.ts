import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Card } from '../models/card.model';
import firebase from 'firebase/app';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Conf } from '../conf';

import 'firebase/database';
import 'firebase/storage';
import DataSnapshot = firebase.database.DataSnapshot;

@Injectable({
	providedIn: 'root'
})
export class CardsService {
	cards: Card[] = [];
	cardsSubject = new Subject<Card[]>();

	constructor(private http: HttpClient) { 
		
	}

	getCards(){
		return this.http.get<Card[]>(Conf.apiEndpoint + "/cards");
	}

	getAvailableCards(){
		return this.http.get<Card[]>(Conf.apiEndpoint + "/cards/playable");
	}

	getSingleCard(id: number){
		return this.http.get<Card>(Conf.apiEndpoint + "/cards/" + id);
	}
}
