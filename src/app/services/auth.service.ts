import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Conf } from '../conf';
@Injectable({
	providedIn: 'root'
})
export class AuthService {
	requestHeaders = new HttpHeaders({ 
		'Access-Control-Allow-Origin':'*'
	});

	constructor(private http:HttpClient) { }

	createNewUser(email: string, password: string) {
		return new Promise(
			(resolve, reject) => {
				firebase.auth().createUserWithEmailAndPassword(email, password).then( 
					() => {
						resolve();
					},
					(error) => {
						reject(error);
					}
				);
			}
		);
	}

	registerUserInDb(id_firebase,pseudo){
		return this.http.request('POST',Conf.apiEndpoint + '/user',{'headers':this.requestHeaders,'body':{
			id_firebase: id_firebase,
			pseudo: pseudo
		}}).subscribe();
	}

	signInUser(email: string, password: string) {
		return new Promise(
			(resolve, reject) => {
				firebase.auth().signInWithEmailAndPassword(email, password).then(
					() => {
						resolve();
					},
					(error) => {
						reject(error);
					}
				);
			}
		);
	}

	signOutUser() {
		firebase.auth().signOut();
	}

	getCurrentUser(){
		return firebase.auth().currentUser;
	}
}
