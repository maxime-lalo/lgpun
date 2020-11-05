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
		return this.http.request('POST',Conf.apiEndpoint + "/party/quit",{'headers':this.requestHeaders,'body':{'user' : uid}});
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

	startParty(partyCode){
		return this.http.request('POST',Conf.apiEndpoint + "/party/start",{'headers':this.requestHeaders,'body':{'party' : partyCode}});
	}
}
