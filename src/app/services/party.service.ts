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

	deleteParty(partyCode){
		return this.http.request('DELETE',Conf.apiEndpoint + "/parties",{'headers':this.requestHeaders,'body':{'code' : partyCode}});
	}

	startParty(partyCode){
		return this.http.request('POST',Conf.apiEndpoint + "/party/start",{'headers':this.requestHeaders,'body':{'party' : partyCode}});
	}

	hideCards(partyCode){
		this.http.request('POST',Conf.apiEndpoint + "/party/hideCards",{'headers':this.requestHeaders,'body':{'party' : partyCode}}).subscribe();
	}

	isAlone(partyCode,type){
		return this.http.request('POST',Conf.apiEndpoint + "/party/isAlone",{'headers':this.requestHeaders,'body':{'party' : partyCode,'type':type}});
	}

	nextTurn(partyCode){
		return this.http.request('POST',Conf.apiEndpoint + "/party/nextTurn",{'headers':this.requestHeaders,'body':{'party' : partyCode}}).subscribe();
	}

	swapCards(firstCard, secondCard,partyCode){
		return this.http.request('POST',Conf.apiEndpoint + "/party/invertCards",{'headers':this.requestHeaders,'body':{
			'first_card': firstCard,
			'party' : partyCode,
			'second_card': secondCard
		}}).subscribe();
	}

	soulardCard(userCard,notUsedCard,partyCode){
		return this.http.request('POST',Conf.apiEndpoint + "/party/invertNotUsed",{'headers':this.requestHeaders,'body':{
			'used_card': userCard,
			'not_used_card' : notUsedCard,
			'party': partyCode
		}}).subscribe();
	}
}
