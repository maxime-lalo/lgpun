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
	party: Party = new Party('',null,[],false,'',[],'',[]);
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
}
