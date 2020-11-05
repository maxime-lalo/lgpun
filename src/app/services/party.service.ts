import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Party } from '../models/party.model';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Conf } from '../conf';
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

	requestHeaders = new HttpHeaders({ 
		'Access-Control-Allow-Origin':'*'
	});
	constructor(private authService:AuthService,private http:HttpClient) {}

	getParties(){
		return this.http.get<Party[]>(Conf.apiEndpoint + "/parties",{'headers':this.requestHeaders});
	}

	newParty(code:string, cards:number[], numberOfPlayers:number):Observable<any>{
		const uid = this.authService.getCurrentUser().uid;
		let partyObject = {
			"code" : code,
			"cards": cards,
			"numberOfPlayers": numberOfPlayers,
			"creator": uid
		};

		return this.http.request('POST',Conf.apiEndpoint + '/parties',{'headers':this.requestHeaders,'body':partyObject});
	}

	getUserParty(){
		const uid = this.authService.getCurrentUser().uid;
		return this.http.get<Party>(Conf.apiEndpoint + "/parties/getByUser/" + uid,{'headers':this.requestHeaders});
	}
	
	joinParty(partyCode:string){
		const uid = this.authService.getCurrentUser().uid;
		let objJoin = {
			"party" : partyCode,
			"user" : uid
		};
		return this.http.request('POST',Conf.apiEndpoint + "/party/join",{'headers':this.requestHeaders,'body':objJoin});
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
