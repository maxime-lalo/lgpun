import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
	party: Party = new Party('',null,[],false,null,[],'');
	partySubject = new Subject<Party>();
	partySubscription:Subscription;

	user:string;

	secondes:number;

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

	emitParty(){
		this.partySubject.next(this.party);
	}

	getParty(user){
		firebase.database().ref('/users/' + user + '/party').on('value',(s => {
			if (s.exists()) {
				firebase.database().ref('/parties/' + s.val().code).on('value',(party => {
					if(party.exists()){
						this.party = party.val();
						this.emitParty();
					}
				}));
			}
		}));
	}

	ngOnDestroy(){}

	onQuitParty(){
		this.partyService.quitParty();
		this.router.navigate(['/party/join']);
	}

	onLaunchParty(){}

	onDeleteParty(){}
}
