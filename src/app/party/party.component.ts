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
	party:any;
	interval;
	user:string;

	constructor(private route: ActivatedRoute, private partyService:PartyService, private router:Router,private authService:AuthService) { }

	ngOnInit(): void {
		this.user = this.authService.getCurrentUser().uid;

		this.interval = setInterval(() =>{
			this.partyService.getUserParty().subscribe((party:Party) =>{
				this.party = party;
				console.log(party.notUsedCards);
			});
		},1000);
	}

	ngOnDestroy(){
		clearInterval(this.interval);
	}

	onPlay(targetUser:string){
		
	}
}
