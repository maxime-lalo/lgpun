import { Component, OnInit, OnDestroy } from '@angular/core';
import { Party } from '../models/party.model';
import { PartyService } from '../services/party.service';
import { AuthService } from '../services/auth.service';
import { Subject, Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

import firebase from 'firebase/app';

@Component({
	selector: 'app-party',
	templateUrl: './party.component.html',
	styleUrls: ['./party.component.scss']
})
export class PartyComponent implements OnInit, OnDestroy {
	party: Party = new Party('',null,[],false,'',[],'',[],'',false);
	partySubject = new Subject<Party>();
	partySubscription:Subscription;

	loopNumber = [0,1,2];
	user:string;

	constructor(private route: ActivatedRoute, private partyService:PartyService, private router:Router,private authService:AuthService) { }

	ngOnInit(): void {
		const uid = this.authService.getCurrentUser().uid;
		this.user = uid;

		this.getParty(uid);
		this.partySubject.subscribe((party:Party) =>{
			this.party = party;
		});
		this.emitParty();
	}

	ngOnDestroy(){}

	emitParty(){
		this.partySubject.next(this.party);
  	}
  
	saveParty(){
		firebase.database().ref('/parties/' + this.party.code).set(this.party);
		this.emitParty();
	}
  
	getParty(user){
		firebase.database().ref('/users/' + user + '/party').on('value',(s => {
			if (s.exists()) {
				firebase.database().ref('/parties/' + s.val().code).on('value',(party => {
					if(party.exists()){
						this.party = party.val();
						if(this.party.started){
							this.router.navigate(['party']);
						}
						this.emitParty();
					}
				}));
			}
		}));
	}

	onPlay(targetUser:string){
		if(this.party.turn == this.user){
			let player;
			let playerId;
			for(let i = 0; i < this.party.players.length;i++){
				if (this.party.players[i].id == this.user) {
					playerId = i;
					player = this.party.players[i];
				}
			}

			let playerTarget;
			let playerTargetId;
			for(let i = 0; i < this.party.players.length;i++){
				if (this.party.players[i].id == targetUser) {
					playerTargetId = i;
					playerTarget = this.party.players[i];
				}
			}
			switch(player.card.id){
				// Doppel
				case 0:
					break;
				// Loup
				case 1:
					break;
				// Sbire
				case 2:
					break;
				// Franc-maçon
				case 3:
					break;
				// Voyante
				case 4:
					break;
				// Voleur
				case 5:
					firebase.database().ref('parties/' + this.party.code + '/players/' + playerId + '/newCard').set(playerTarget.newCard);
					firebase.database().ref('parties/' + this.party.code + '/players/' + playerTargetId + '/newCard').set(player.newCard);
					this.partyService.nextTurn(this.party.code);
					break;
				// Noiseuse
				case 6:
					break;
				// Soulard
				case 7:
					break;
				// Insomniaque
				case 8:
					break;
			}
		}else{

		}
	}
}
