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
import { textSpanIntersectsWithTextSpan } from 'typescript';

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
	volume: number = 0.5;
	swalSent: boolean = false;

	canActivateCards: boolean = false;
	canActivateNotUsedCards: boolean = false;

	counterLaunched: boolean = false;
	hiddenCardsInterval;
	hiddenCardsCounter: number = 9;

	firstCardToReveal: number = -1;
	secondCardToReveal: number = -1;

	triggerNextTurnCounter: number = 19;
	triggerNextTurnPercentage: number = 0;
	triggerNextTurnInterval;
	nextTurnCounter: boolean = false;

	noiseuseFirstCard: number = -1;

	doppelCard: number = -1;
	doppelReveal: number = -1;

	partyEnded: boolean = false;

	mostVoted = null;
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
			this.triggerNextTurn();
			Swal.fire({
				title: 'C\'est votre tour ! ',
				text: card.help,
				icon: 'success',
				willClose: () => {
					this.play(card.id);
				}
			});
			this.swalSent = true;
		}
	}

	onSelectCard(card,typeCard){
		if(this.partyEnded){
			Swal.fire({
				title: 'Voulez vous voter pour cette personne ?',
				showCancelButton: true,
				cancelButtonColor: '#C10000',
				confirmButtonColor: '#031b49',
				confirmButtonText: 'Valider',
				cancelButtonText: 'Annuler'
			}).then((result) => {
				let user = null;	
				this.party.players.forEach( (player) => {
					if(player.id_firebase == this.user){
						user = player.id;
					}
				})
				this.partyService.vote(user,card,this.party.code);
				Swal.fire({
					title: 'A voté !',
					html: 'Votre vote a bien été pris en compte'
				});
			  });
		}else{
			let cardPlaying = this.doppelCard == -1 ? this.party.turn['beginning_card'].id:this.doppelCard;
			let playerTarget = null;
			this.party.players.forEach( (player) =>{
				if (player.id == card) {
					playerTarget = player;
				}	
			}
		)
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
								this.doppelReveal = player.id;
								Swal.fire({
									title: "Vous avez copié " + player.pseudo + " ! ",
									html: player.pseudo + " est <strong>" + player['beginning_card'].name + "</strong> si c'est une action de nuit, fait là maintenant, sinon attend ton tour ou ton réveil<br><br>Voici le rôle de <strong>" + player['beginning_card'].name + "</strong> :<br>" + player['beginning_card'].help,
									willClose: () => {
										this.doppelCard = player['beginning_card'].id;
										this.canActivateCards = false;
										this.canActivateNotUsedCards = false;
										this.play(player['beginning_card'].id);
									}
								}); 
							}
						})
						break;
					// LG
					case 2: case 3:
						this.firstCardToReveal = card;
						this.canActivateNotUsedCards = false;
						break;
					// Francs maçons
					case 5: case 6:
						this.firstCardToReveal = card;
						this.canActivateNotUsedCards = false;
						break;
					// Voyante
					case 7:
						if(this.firstCardToReveal == -1){
							if(typeCard != 'notUsed'){
								this.canActivateCards = false;
								this.canActivateNotUsedCards = false;
							}
							this.firstCardToReveal = card;
						}else{
							this.secondCardToReveal = card;
							this.canActivateNotUsedCards = false;
						}
						if(typeCard == 'notUsed'){
							this.canActivateCards = false;
						}
						break;
					// Voleur
					case 8:
						this.partyService.swapCards(playerTarget['ending_card'].id,this.party.turn['ending_card'].id,this.party.code);
						Swal.fire({
							title: "Vous avez volé la carte de " + playerTarget.pseudo + " ! ",
							willClose : () =>{
								this.canActivateCards = false;
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
							
							this.partyService.swapCards(playerTarget['ending_card'].id,secondPlayer['ending_card'].id,this.party.code);

							Swal.fire({
								title: "Inversion !",
								html: "Tu as inversé les cartes de <strong>" + secondPlayer.pseudo + "</strong> et <strong>" + playerTarget.pseudo + "</strong> !",
								willClose : () =>{
									this.canActivateCards = false;
								}
							}); 
							// échanger les deux cartes
						}
						break;
					// Soulard
					case 10:
						this.partyService.soulardCard(this.party.turn['ending_card'].id,card,this.party.code);
						Swal.fire({
							title: "Hips !",
							html: "Tu as récupéré une carte au milieu, puisse le sort t'être favorable",
							willClose : () =>{
								this.canActivateNotUsedCards = false;
							}
						}); 
						break;
					default:
						break;
				}
			}
		  });
		}
	}

	play(type){
		switch(type){
			// Doppel
			case 1:
				if(this.party.doppelCard != null && this.party.doppelCard.id == 11){
					this.play(11);
				}else{
					this.canActivateCards = true;
				}
				break;
			// LG
			case 2: case 3:
				this.partyService.isAlone(this.party.code,'wolf').subscribe( (result:any) => {
					if(result.length > 1){
						let htmlFormatted = "";
						result.forEach( (player) => {
							if(player.id_firebase != this.user){
								htmlFormatted += player.pseudo + " est également loup garou<br>";
							}
						});
						Swal.fire({
							title: "Vous n'êtes pas seul...",
							html: htmlFormatted
						});
					}else{
						this.canActivateNotUsedCards = true;
					}
				});
				break;
			// Francs maçons
			case 5: case 6:
				this.partyService.isAlone(this.party.code,'francs').subscribe( (result:any) => {
					if(result.length > 1){
						let htmlFormatted = "";
						result.forEach( (player) => {
							if(player.id_firebase != this.user){
								htmlFormatted += player.pseudo + " est également <strong>Franc-maçon</strong><br>";
							}
						});
						Swal.fire({
							title: "Vous n'êtes pas seul...",
							html: htmlFormatted
						});
					}else{
						Swal.fire({
							title: "Vous n'êtes seul",
							html: "Vous êtes le seul loup actif de la partie, vous pouvez donc voir une des cartes au centre"
						});
						this.canActivateNotUsedCards = true;
					}
				});
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
				this.canActivateNotUsedCards = true;
				break;
			// Insomniaque
			case 11:
				if(this.doppelCard == -1){
					let cardToSee = null;
					this.party.players.forEach( (player) => {
						
						if (player.id_firebase == this.user) {
							cardToSee = player.id;
						}
					});
					this.firstCardToReveal = cardToSee;
				}else{
					let cardToSee = null;
					this.party.players.forEach( (player) => {
						if (player.id_firebase == this.user) {
							cardToSee = player.id;
						}
					});
					Swal.fire({
						title: "Vous avez copié l'insomniaque !",
						html: "Vous allez pouvoir voir votre carte avant le réveil afin de savoir dans quel camp vous vous situez"
					})
				}
				break;
			default:
				break;
		}
	}

	getParty(){
		this.partyService.getUserParty().subscribe((party:Party) =>{
			if(party.relaunch){
				this.router.navigate(['/party/lobby']);
			}
			let now = new Date();
			// Si une heure de fin de tour est définie
			if(party.turnEnd){
				let turnEnd = new Date(party.turnEnd.date);
				let diff = turnEnd.getTime() - now.getTime();
				party.turnEnd = diff;
			}
			// On attribue party à notre component
			this.party = party;

			// Si on a pas encore caché les cartes en début de partie
			if(this.counterLaunched == false && party.cardsHidden == false){
				this.counterLaunched = true;
				this.launchCounterHide();
			}

			// Si la partie vient de se terminer
			if(this.party.ended && !this.partyEnded){
				this.partyEnded = true;
				this.showEnd();
			}

			// Tant que la partie n'est pas terminée
			if(!this.party.ended){
				if(party.turn){
					if(party.turn['id_firebase'] ==  this.user){
						this.sendSwal(party.turn['beginning_card']);
					}else{
						this.canActivateCards = false;
						this.canActivateNotUsedCards = false;
					}
				}else{
					this.canActivateCards = false;
					this.canActivateNotUsedCards = false;
				}
			}else{
				// Tant que la partie est terminée
				party.votes.forEach( (vote) => {
					if(vote.user.id_firebase == this.user){
						this.canActivateCards = false;
					}
				});
				if( (party.players.length - party.votes.length) == 0){
					let maxVotes = 0;
					let userMaxVotes = null;
					party.players.forEach( (player) => {
						let voteCounter = 0;
						party.votes.forEach( (vote) => {
							if(vote.target.id == player.id){
								voteCounter++;
							}							
						});

						if(voteCounter > maxVotes){
							maxVotes = voteCounter;
							userMaxVotes = player;
						}
					});
					this.mostVoted = userMaxVotes;
					console.log(this.mostVoted);
				}
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
			this.triggerNextTurnPercentage = 100-(this.triggerNextTurnCounter+1)*5;
			if(this.triggerNextTurnCounter == 0){
				if(this.party.turn.id_firebase == this){
					this.partyService.nextTurn(this.party.code);
				}
			}
			if(this.triggerNextTurnCounter < 0){
				//this.partyService.nextTurn(this.party.code);
				clearInterval(this.triggerNextTurnInterval);
				this.firstCardToReveal = -1;
				this.secondCardToReveal = -1;
				this.doppelReveal = -1;
				this.nextTurnCounter = false;
				this.triggerNextTurnCounter = 19;
			}
		},1000)
	}

	showEnd(){
		let coq = new Howl({
			src: ["http://files.eplp.fr/lgpun/musics/coq_chant.mp3"],
			html5: true,
			buffer: true
		  });

		coq.play();
		coq.volume(this.volume);

		this.sound.stop();
		this.sound = new Howl({
			src: ["http://files.eplp.fr/lgpun/musics/day_theme.mp3"],
			html5: true,
			buffer: true,
			loop: true
		  });

		this.sound.play();
		this.sound.volume(this.volume);

		Swal.fire({
			title: "Fin de partie",
			html: "Le jour se lève sur la ville, il va falloir voter pour qui vous pensez être les loups !",
			willClose: () => {
				this.canActivateCards = true;
			}
		})
	}

	relaunchParty(){
		this.partyService.relaunch(this.party.code);
	}
}