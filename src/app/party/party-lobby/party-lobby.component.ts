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
	party: Party = new Party('',null,[],false,'',[],'',[],'',false);
	partySubject = new Subject<Party>();
	partySubscription:Subscription;
	user:string;
	constructor(private route: ActivatedRoute, private partyService:PartyService, private router:Router,private authService:AuthService) { }

	ngOnInit(): void {
		const uid = this.authService.getCurrentUser().uid;

		this.partyService.getUserParty().subscribe((result) => {
			this.party = result;
		});
	}

	ngOnDestroy(){}

	onQuitParty(){
		this.partyService.quitParty();
		this.router.navigate(['/party/join']);
	}

	onLaunchParty(){
		this.partyService.startParty();
  	}

	onDeleteParty(){
		this.partyService.deleteParty();
	}
}
