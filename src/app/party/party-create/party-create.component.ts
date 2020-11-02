import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Party } from '../../models/party.model';
import { PartyService } from '../../services/party.service';
import { CardsService } from '../../services/cards.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Card } from '../../models/card.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-party-create',
  templateUrl: './party-create.component.html',
  styleUrls: ['./party-create.component.scss']
})
export class PartyCreateComponent implements OnInit {
	cards: Card[];
	cardsSubscription: Subscription;

	createPartyForm: FormGroup;
	canSubmit: boolean = false;
	constructor(private formBuilder: FormBuilder, private partyService: PartyService,
              private router: Router, private cardsService: CardsService, private authService: AuthService) { }

	initForm() {
		this.cardsService.getAvailableCards();
		this.cardsSubscription = this.cardsService.cardsSubject.subscribe( (cards: Card[]) => {
			this.cards = cards;
		});
		this.cardsService.emitCards();

		this.createPartyForm = this.formBuilder.group({
			partyCode: ['',[Validators.required, Validators.pattern(/[0-9a-zA-Z]{4,6}/)]],
			cardsSelected: ['', Validators.required],
			playerNbr : ['']
		});
	}

	ngOnInit(): void {
		this.initForm();
	}

	onCreateParty(){
		const code = this.createPartyForm.get('partyCode').value;
		const cards = this.createPartyForm.get('cardsSelected').value;
		const numberOfPlayers = cards.length-3;

		const newParty = new Party(code,numberOfPlayers,cards,[]);

		this.partyService.createNewParty(newParty);
		this.router.navigate(['/party/' + newParty.code]);
	}

	onSelect(){
		const select = this.createPartyForm.get('cardsSelected').value;
		const playerNbr = this.createPartyForm.get('playerNbr');

		let nbr:number = select.length - 3;
		if (nbr <= 0) {
			playerNbr.setValue(0);
		}else{
			playerNbr.setValue(select.length-3);
		}
	}
}
