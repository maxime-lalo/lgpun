import { Component } from '@angular/core';
import firebase from 'firebase/app';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	title = 'LGPUN';
	constructor() {
		var firebaseConfig = {
			apiKey: "AIzaSyAaCob-IEnLQV2JoW40FxgKPPyL1FCLuOQ",
			authDomain: "lgpun-20cfa.firebaseapp.com",
			databaseURL: "https://lgpun-20cfa.firebaseio.com",
			projectId: "lgpun-20cfa",
			storageBucket: "lgpun-20cfa.appspot.com",
			messagingSenderId: "433057572227",
			appId: "1:433057572227:web:4ab8e5d8de7e0b21bdc2b6",
			measurementId: "G-RRHPED7QWT"
		};
		// Initialize Firebase
		firebase.initializeApp(firebaseConfig);
	}
}
