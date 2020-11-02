import { Component, OnInit } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';
import { AuthService } from '../services/auth.service';
import firebase from 'firebase/app';
import 'firebase/auth';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
	isAuth: boolean = true;
	constructor(private authService: AuthService) { }

	ngOnInit(): void {
		firebase.auth().onAuthStateChanged((user) => {
			this.isAuth = user ? true:false;
		});
	}

	onSignOut(){
		this.authService.signOutUser();
	}
}
