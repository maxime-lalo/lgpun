import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class PartyJoinComponent implements OnInit, OnDestroy {
	joinPartyForm: FormGroup;
	parties: Party[];

	partiesSubscription: Subscription;

	constructor(private formBuilder: FormBuilder, private partyService: PartyService,private router: Router) { }

	initForm() {
		this.joinPartyForm = this.formBuilder.group({
			partyCode: ['', Validators.required]
		});

	}
	ngOnInit(): void {
		this.initForm();

		this.partiesSubscription = this.partyService.getParties().subscribe( (result) => {
			this.parties = result;
		});

		setInterval(() => { 
			this.partiesSubscription;
		}, 1000);
	}

	ngOnDestroy():void{
		this.partiesSubscription.unsubscribe();
	}

	onJoinParty(){
		let partyCode = this.joinPartyForm.get('partyCode').value;
		this.partyService.joinParty(partyCode);
		this.router.navigate(['/party/lobby']);
	}
}
