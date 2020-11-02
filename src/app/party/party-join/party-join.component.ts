import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Party } from '../../models/party.model';
import { PartyService } from '../../services/party.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
	selector: 'app-party-join',
	templateUrl: './party-join.component.html',
	styleUrls: ['./party-join.component.scss']
})
export class PartyJoinComponent implements OnInit {
	joinPartyForm: FormGroup;
	parties: Party[];
	partiesSubscription: Subscription;
	constructor(private formBuilder: FormBuilder, private partyService: PartyService,
              private router: Router) { }

	initForm() {
		this.joinPartyForm = this.formBuilder.group({
			partyCode: ['', Validators.required]
		});
	}
	ngOnInit(): void {
		this.initForm();

		this.partyService.getParties();
		this.partiesSubscription = this.partyService.partiesSubject.subscribe( (parties: Party[]) => {
			this.parties = parties;
		});
		this.partyService.emitParties();
	}

	onJoinParty(){
		let partyCode = this.joinPartyForm.get('partyCode').value;
		this.router.navigate(['/party/' + partyCode]);
	}
}
