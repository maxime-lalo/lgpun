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
				let party = new Party(code,numberOfPlayers,cards,false,0,[{"id":uid,"pseudo":pseudo}],uid);

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
				});
			}
		});
	}
}
