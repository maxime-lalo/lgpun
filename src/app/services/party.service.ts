import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
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

	createNewParty(newParty: Party){
		this.parties.push(newParty);
		this.saveParties();
		this.emitParties();
	}

	partyExists(partyCode: string){
		firebase.database().ref('/parties').orderByChild('code').equalTo(partyCode).once('value').then(snapshot => {
			let exists: boolean = false;
			if (snapshot.val()) {
				if (snapshot.val()[0].code == partyCode) {
					exists = true;
				}
				if (exists) {
					return false;
				}else{
					return true;
				}
			}
			return exists;
		}).catch(error => console.log(error));
	}

	removeParty(party: Party){
		const cardIndexToRemove = this.parties.findIndex( (partyEl) => {
			if(partyEl === party){
				return true;
			}
		});
		this.parties.splice(cardIndexToRemove,1);
		this.saveParties();
		this.emitParties();
	}

	quitParty(partyToQuit: Party){
		if (this.parties) {
			this.parties.forEach((party,index) => {
				if (party.code == partyToQuit.code) {
					console.log("Party code found");
					partyToQuit.players.forEach((player, index) =>{
						if (player == this.authService.getCurrentUser().uid) {
							party.players.splice(index,1);
							if (party.players.length == 0) {
								this.removeParty(party);
							}
						}
					});
				}
			});
			this.saveParties();
			this.emitParties();
		}
	}

	joinParty(partyToJoin: Party){
		if (this.parties) {
			this.parties.forEach((party,index) => {
				if (party.code == partyToJoin.code) {
					let idUser = this.authService.getCurrentUser().uid;
					if (party.players) {
						party.players.push(idUser);
					}else{
						party.players = [idUser];
					}
				}
			});
			this.saveParties();
			this.emitParties();
		}
	}

	getSinglePartyByCode(partyCode: string){
		return new Promise( (resolve, reject) => {
			firebase.database().ref('/parties').orderByChild('code').equalTo(partyCode).once('value').then( (data:DataSnapshot) => {
				resolve(data.val()[0]);					
			},
			(error) =>{
				reject(error);
			});
		})
	}
}
