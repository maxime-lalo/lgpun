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
export class PartyLobbyComponent implements OnInit,OnDestroy {
	party;
	partySubject = new Subject<Party>();
	partySubscription:Subscription;
	user:string;

	interval;

	constructor(private route: ActivatedRoute, private partyService:PartyService, private router:Router,private authService:AuthService) { }

	ngOnInit(): void {
		const uid = this.authService.getCurrentUser().uid;
		this.user = uid;
		this.interval = setInterval(() => {
			this.partyService.getUserParty().subscribe((result) => {
				this.party = result;
				if(this.party.started){
					this.router.navigate(['/party']);
				}
			});
		},1000);
	}

	ngOnDestroy(){
		clearInterval(this.interval);
	}

	onQuitParty(){
		this.partyService.quitParty().subscribe( (result) => {
			this.router.navigate(['/party/join']);
		});
	}

	onLaunchParty(){
		this.partyService.startParty(this.party.code).subscribe( (result) => {

		});
  	}

	onDeleteParty(){
		this.partyService.deleteParty(this.party.code).subscribe((result) =>{
			if(result['success']){
				this.router.navigate(['/party/join']);
			}
		});
	}
}
