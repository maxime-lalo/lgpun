import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Party } from '../../models/party.model';
import { PartyService } from '../../services/party.service';
import { AuthService } from '../../services/auth.service';
import { Subject, Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

import firebase from 'firebase/app';
@Component({
  selector: 'app-party-lobby',
  templateUrl: './party-lobby.component.html',
  styleUrls: ['./party-lobby.component.scss']
})
export class PartyLobbyComponent implements OnInit {
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

	ngOnDestroy(){}

	onQuitParty(){
		this.partyService.quitParty();
		this.router.navigate(['/party/join']);
	}

	onLaunchParty(){
    this.party.started = true;
    this.saveParty();
  }

	onDeleteParty(){}
}
