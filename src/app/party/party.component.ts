import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Party } from '../models/party.model';
import { PartyService } from '../services/party.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-party',
	templateUrl: './party.component.html',
	styleUrls: ['./party.component.scss']
})
export class PartyComponent implements OnInit, OnDestroy {
	party: Party;
	partiesSubscription: Subscription;
	constructor(private route: ActivatedRoute, private partyService:PartyService, private router:Router) { }

	ngOnInit(): void {
		const code = this.route.snapshot.params['id'];
		this.partyService.getSinglePartyByCode(code).then( (party: Party) => {
			this.party = party;
			this.partyService.joinParty(party);
		});
		
		this.partyService.emitParties();
	}

	ngOnDestroy(){
		this.partyService.quitParty(this.party);
		this.router.navigate(['/party.join']);
	}

	onQuitParty(){
		this.partyService.quitParty(this.party);
		this.router.navigate(['/party.join']);
	}
}
