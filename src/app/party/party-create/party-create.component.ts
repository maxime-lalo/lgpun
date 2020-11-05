import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
	errorMsg:string;
	errorMsgRequest:string;

	cards: Card[];
	cardsSubscription: Subscription;

	createPartyForm: FormGroup;
	canSubmit: boolean = false;
	constructor(private formBuilder: FormBuilder, private partyService: PartyService,private router: Router, private cardsService: CardsService) { }

	initForm() {
		this.cardsSubscription = this.cardsService.getAvailableCards().subscribe( (cards: Card[]) => {
			this.cards = cards;
		});

		this.createPartyForm = this.formBuilder.group({
			partyCode: ['',[Validators.required, Validators.pattern(/[0-9a-zA-Z]{4,6}/)]],
			cardsSelected: ['', Validators.required],
			playerNbr : ['',Validators.min(3)]
		});
	}

	ngOnInit(): void {
		this.initForm();
	}

	onCreateParty(){
		const code = this.createPartyForm.get('partyCode').value;
		const cards = this.createPartyForm.get('cardsSelected').value;
		const numberOfPlayers = cards.length-3;
		
		this.partyService.newParty(code,cards,numberOfPlayers).subscribe((result) =>{
			if(result[0]){
				this.errorMsgRequest = result[1];
			}else{
				this.router.navigate(['/party/lobby']);
			}
		});
	}

	onSelect(){
		const select = this.createPartyForm.get('cardsSelected').value;
		const playerNbr = this.createPartyForm.get('playerNbr');

		let nbr:number = select.length - 3;
		if (nbr >= 3 || nbr == -3) {
			this.errorMsg = null;
		}else{
			this.errorMsg = "Sélectionnez assez de cartes pour pouvoir jouer à 3 minimum";
		}

		if (nbr <= 0) {
			playerNbr.setValue(0);
		}else{
			playerNbr.setValue(select.length-3);
		}
	}
}
