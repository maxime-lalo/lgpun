import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
	signupForm: FormGroup;
	errorMessage: string;

	constructor(private formBuilder: FormBuilder,private authService: AuthService,private router: Router) { }

	ngOnInit(): void {
		this.initForm();
	}

	initForm() {
		this.signupForm = this.formBuilder.group({
			email: ['', [Validators.required, Validators.email]],
			pseudo: ['', [Validators.required]],
			password: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)]]
		});
	}

	onSubmit(){
		const email = this.signupForm.get('email').value;
		const password = this.signupForm.get('password').value;
		const pseudo = this.signupForm.get('pseudo').value;
		
		this.authService.createNewUser(email, password).then(
			() => {
				let user = this.authService.getCurrentUser();
				this.authService.registerUserInDb(user.uid,pseudo);
				user.updateProfile({
				  displayName: pseudo
				})
				this.router.navigate(['']);
			},
			(error) =>{
				this.errorMessage = error;
			}
		);
	}
}
