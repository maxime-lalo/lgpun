import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
	constructor(private route: ActivatedRoute, private partyService:PartyService, private router:Router,private authService:AuthService) { }

	ngOnInit(): void {
	}

	ngOnDestroy(){}
}
