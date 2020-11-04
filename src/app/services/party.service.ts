import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { Party } from '../models/party.model';
import { AuthService } from '../services/auth.service';

import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import DataSnapshot = firebase.database.DataSnapshot;

@Injectable({
	providedIn: 'root'
})
export class PartyService {
	parties: Party[] = [];
	partiesSubject = new Subject<Party[]>();

	alreadyExists:boolean = false;

	constructor(private authService:AuthService) { 
		this.getParties();
	}

	emitParties(){
		this.partiesSubject.next(this.parties);
	}

	saveParties(){
		firebase.database().ref('/parties').set(this.parties);
	}

	getParties(){
		firebase.database().ref('/parties').on('value', (data: DataSnapshot) => {
			this.parties = data.val() ? data.val() : [];
			this.emitParties();
		});
	}

	newParty(code:string, cards:number[], numberOfPlayers:number):void{
		const uid = this.authService.getCurrentUser().uid;
		const pseudo = this.authService.getCurrentUser().displayName;
		firebase.database().ref('users/' + uid + '/party').once('value').then(s =>{
			if (!s.exists()) {
				let party = new Party(code,numberOfPlayers,cards,false,'',[{"id":uid,"pseudo":pseudo}],uid,[],'',false);

				firebase.database().ref('/parties/' + code).set(party);
				firebase.database().ref('/users/' + uid + '/party').set({
					"code":code
				});
			}
		})
	}

	joinParty(partyCode:string){
		const uid = this.authService.getCurrentUser().uid;
		const pseudo = this.authService.getCurrentUser().displayName;
		firebase.database().ref('users/' + uid + '/party').set({
			"code":partyCode,
		});

		let url = 'parties/' + partyCode + '/players';
		firebase.database().ref(url).once('value', (snapshot) => {
			if (snapshot.exists()) {
				let players = snapshot.val();
				players.push({"id":uid,"pseudo":pseudo});
				firebase.database().ref(url).set(players);
			}
		});
	}

	quitParty(){
		const uid = this.authService.getCurrentUser().uid;
		firebase.database().ref('users/' + uid + '/party').once('value', (snapshot) =>{
			if(snapshot.exists()){
				let partyCode = snapshot.val();
				let urlParty = 'parties/' + partyCode.code + '/players';
				firebase.database().ref(urlParty).once('value', (snapshot2) =>{
					let players = snapshot2.val();
					players.forEach( (player,index) =>{
						if(player.id == uid){
							players.splice(index,1);
						}
					});
					firebase.database().ref(urlParty).set(players);
					firebase.database().ref('users/' + uid).set([]);
				});
			}
		});
	}

	deleteParty(){
		const uid = this.authService.getCurrentUser().uid;
		firebase.database().ref('users/' + uid + '/party').once('value', (snapshot) =>{
			if(snapshot.exists()){
				let partyCode = snapshot.val();
				let urlParty = 'parties/' + partyCode.code + '/players';
				firebase.database().ref(urlParty).once('value', (snapshot2) =>{
					let players = snapshot2.val();
					players.forEach( (player,index) =>{
						firebase.database().ref('/users/' + player.id).set([]);
					});
					firebase.database().ref('/parties/' + partyCode.code).set([]);
				});
			}
		});
	}

	startParty(){
		const uid = this.authService.getCurrentUser().uid;
		console.log(uid);
		firebase.database().ref('users/' + uid + '/party').once('value', (snapshot) =>{
			if(snapshot.exists()){
				let partyCode = snapshot.val().code;
				this.shuffleCards(partyCode);
				this.nextTurn(partyCode);
			}
		});
		
	}

	shuffleCards(partyCode:string){
		console.log('shuffling cards');
		let party = null;
		firebase.database().ref('parties/' + partyCode).once('value',(snapshot2) =>{
			party = snapshot2.val();
			this.shuffle(party.cards);
			for(let i = 0; i < party.cards.length; i++){
				firebase.database().ref('cards/' + party.cards[i]).once('value',(snapshot3) =>{
					if(snapshot3.exists()){
						let card = snapshot3.val();
						if(i < 3){
							firebase.database().ref('/parties/' + partyCode + '/notUsedCards/' + i).set(card);
						}else{
							party.players[i-3].card = card;
							party.players[i-3].newCard = card;
							firebase.database().ref('/parties/' + partyCode + '/players/' + (i-3)).set(party.players[i-3]);
						}
					}
				});
			}

			let order = [];
			firebase.database().ref('parties/' + partyCode + '/players').once('value',(snapshot2) =>{
				let players = snapshot2.val();
				let swapped = 1;
				while(swapped == 1){
					for(let i = 0; i < (players.length - 1); i++){
						swapped = 0;
						if (players[i].card.position >= players[i+1].card.position) {
							let temp = players[i];
							players[i] = players[i+1];
							players[i+1] = players[i];
							swapped = 1;
						}
					}
				}

				for(let i = 0; i < (players.length - 1); i++){
					order[i] = players[i].id;
				}
				console.log(order);

				firebase.database().ref('parties/' + partyCode + '/order').set(order);
			});
		});
	}

	shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;
	  
		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
	  
		  // Pick a remaining element...
		  randomIndex = Math.floor(Math.random() * currentIndex);
		  currentIndex -= 1;
	  
		  // And swap it with the current element.
		  temporaryValue = array[currentIndex];
		  array[currentIndex] = array[randomIndex];
		  array[randomIndex] = temporaryValue;
		}
	  
		return array;
	}

	nextTurn(partyCode:string){
		let party = null;
	}
}
