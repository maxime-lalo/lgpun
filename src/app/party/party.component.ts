import { Component, OnInit, OnDestroy } from '@angular/core';
import { Party } from '../models/party.model';
import { PartyService } from '../services/party.service';
import { AuthService } from '../services/auth.service';
import { Subject, Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Howl, Howler } from 'howler';

import Swal from 'sweetalert2/dist/sweetalert2.all.js';
import 'sweetalert2/src/sweetalert2.scss'
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
	sound:Howl;
	volume: number = 0;
	swalSent: boolean = false;

	canActivateCards: boolean = false;
	canActivateNotUsedCards: boolean = false;

	counterLaunched: boolean = false;
	hiddenCardsInterval;
	hiddenCardsCounter: number = 9;

	firstCardToReveal: number = -1;
	secondCardToReveal: number = -1;

	triggerNextTurnCounter: number = 9;
	triggerNextTurnInterval;
	nextTurnCounter: boolean = false;

	noiseuseFirstCard: number = -1;

	doppelCard: number = -1;
	constructor(private route: ActivatedRoute, private partyService:PartyService, private router:Router,private authService:AuthService) { }

	ngOnInit(): void {
		this.user = this.authService.getCurrentUser().uid;

		this.getParty();
		this.interval = setInterval(() =>{
			this.getParty();
		},1000);

		this.sound = new Howl({
			src: ["http://files.eplp.fr/lgpun/musics/night_theme.mp3"],
			html5: true,
			buffer: true,
			loop: true
		  });

		this.sound.play();
		this.sound.volume(this.volume);
	}

	ngOnDestroy(){
		clearInterval(this.interval);
		this.sound.unload();
	}

	onChangeVolume(){
		this.sound.volume(this.volume);
	}
	
	sendSwal(card){
		if(!this.swalSent){
			Swal.fire({
				title: 'C\'est votre tour ! ',
				text: card.help,
				icon: 'success',
				willClose: this.play(card.id)
			});
			this.swalSent = true;
		}
	}

	onSelectCard(card,typeCard){
		let cardPlaying = this.doppelCard == -1 ? this.party.turn['beginning_card'].id:this.doppelCard;
		let playerTarget = null;
		this.party.players.forEach( (player) =>{
			if (player.id == card) {
				playerTarget = player;
			}
		})
		Swal.fire({
			title: 'Voulez vous sélectionner cette carte ?',
			showCancelButton: true,
			cancelButtonColor: '#C10000',
			confirmButtonColor: '#031b49',
			confirmButtonText: 'Valider',
			cancelButtonText: 'Annuler'
		  }).then((result) => {
			if (result.isConfirmed) {
				switch(cardPlaying){
					// Doppel
					case 1:
						this.party.players.forEach((player) =>{
							if(player.id == card){
								Swal.fire({
									title: "Vous avez copié " + player.pseudo + " ! ",
									html: player.pseudo + " est <strong>" + player['beginning_card'].name + "</strong> si c'est une action de nuit, fait là maintenant, sinon attend ton tour ou ton réveil<br><br>Voici le rôle de <strong>" + player['beginning_card'].name + "</strong> :<br>" + player['beginning_card'].help
								}); 
								this.doppelCard = player['beginning_card'].id;
								this.canActivateCards = false;
								this.canActivateNotUsedCards = false;
								this.play(player['beginning_card'].id);
							}
						})
						break;
					// LG
					case 2: case 3:
						break;
					// Francs maçons
					case 5: case 6:
						break;
					// Voyante
					case 7:
						if(this.firstCardToReveal == -1){
							if(typeCard != 'notUsed'){
								this.canActivateCards = false;
								this.canActivateNotUsedCards = false;
								this.triggerNextTurn();
							}
							this.firstCardToReveal = card;
						}else{
							this.secondCardToReveal = card;
							this.canActivateNotUsedCards = false;
							this.triggerNextTurn();
						}
						if(typeCard == 'notUsed'){
							this.canActivateCards = false;
						}
						break;
					// Voleur
					case 8:
						// API d'échange de cartes
						Swal.fire({
							title: "Vous avez volé la carte de " + playerTarget.pseudo + " ! ",
							willClose : () =>{
								this.canActivateCards = false;
								this.triggerNextTurn();
							}
						}); 
						break;
					// Noiseuse
					case 9:
						if(this.noiseuseFirstCard == -1){
							this.noiseuseFirstCard = card;
						}else{
							let secondPlayer = null;
							this.party.players.forEach( (player) => {
								this.party.players.forEach( (player) =>{
									if (player.id == this.noiseuseFirstCard) {
										secondPlayer = player;
									}
								})
							})

							// API d'échange de cartes

							Swal.fire({
								title: "Inversion !",
								html: "Tu as inversé les cartes de <strong>" + secondPlayer.pseudo + "</strong> et <strong>" + playerTarget.pseudo + "</strong> !",
								willClose : () =>{
									this.canActivateCards = false;
									this.triggerNextTurn();
								}
							}); 
							// échanger les deux cartes
						}
						break;
					// Soulard
					case 10:
						Swal.fire({
							title: "Hips !",
							html: "Tu as récupéré une carte au milieu, puisse le sort t'être favorable",
							willClose : () =>{
								this.canActivateNotUsedCards = false;
								this.triggerNextTurn();
							}
						}); 
						break;
					default:
						break;
				}
			}
		  });
	}

	play(type){
		switch(type){
			// Doppel
			case 1:
				this.canActivateCards = true;
				break;
			// LG
			case 2: case 3:
				this.canActivateNotUsedCards = true;
				break;
			// Francs maçons
			case 5: case 6:
				this.canActivateNotUsedCards = true;
				break;
			// Voyante
			case 7:
				this.canActivateCards = true;
				this.canActivateNotUsedCards = true;
				break;
			// Voleur
			case 8:
				this.canActivateCards = true;
				break;
			// Noiseuse
			case 9:
				this.canActivateCards = true;
				break;
			// Soulard
			case 10:
				this.canActivateCards = false;
				this.canActivateNotUsedCards = true;
				break;
			default:
				break;
		}
	}

	getParty(){
		this.partyService.getUserParty().subscribe((party:Party) =>{
			this.party = party;
			if(this.counterLaunched == false && party.cardsHidden == false){
				this.counterLaunched = true;
				this.launchCounterHide();
			}
			if(party.turn['id_firebase'] ==  this.user){
				this.sendSwal(party.turn['beginning_card']);
			}else{
				this.canActivateCards = false;
				this.canActivateNotUsedCards = false;
			}
		});
	}
	
	launchCounterHide(){
		this.hiddenCardsInterval = setInterval(() =>{
			this.hiddenCardsCounter--;
			if(this.hiddenCardsCounter == 0){
				this.partyService.hideCards(this.party.code);
			}
			if (this.hiddenCardsCounter < 0) {
				clearInterval(this.hiddenCardsInterval);
				this.counterLaunched = false;
			}
		},1000);
	}

	triggerNextTurn(){
		this.nextTurnCounter = true;
		this.triggerNextTurnInterval = setInterval( () => {
			this.triggerNextTurnCounter--;
			if(this.triggerNextTurnCounter == 0){
				// passer au tour suivant
			}
			if(this.triggerNextTurnCounter < 0){
				this.firstCardToReveal = -1;
				this.secondCardToReveal = -1;
				this.nextTurnCounter = false;
				clearInterval(this.triggerNextTurnInterval);
				this.triggerNextTurnCounter = 9;
			}
		},1000)
	}
}
