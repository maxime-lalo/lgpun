import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { SignupComponent } from './auth/signup/signup.component';
import { SigninComponent } from './auth/signin/signin.component';
import { BookListComponent } from './book-list/book-list.component';
import { CardsListComponent } from './cards-list/cards-list.component';
import { SingleBookComponent } from './book-list/single-book/single-book.component';
import { BookFormComponent } from './book-list/book-form/book-form.component';
import { HeaderComponent } from './header/header.component';

import { PartyComponent } from './party/party.component';
import { PartyJoinComponent } from './party/party-join/party-join.component';
import { PartyCreateComponent } from './party/party-create/party-create.component';
import { HomeComponent } from './home/home.component';

import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [
  { path: 'auth/signup', component: SignupComponent },
  { path: 'auth/signin', component: SigninComponent },
  { path: 'books', canActivate:[AuthGuardService], component: BookListComponent },
  { path: 'cardsList', canActivate:[AuthGuardService], component: CardsListComponent },
  { path: 'party/join', canActivate:[AuthGuardService], component: PartyJoinComponent },
  { path: 'party/create', canActivate:[AuthGuardService], component: PartyCreateComponent },
  { path: 'party/:id', canActivate:[AuthGuardService], component: PartyComponent },
  { path: 'books/new', canActivate:[AuthGuardService], component: BookFormComponent },
  { path: 'books/view/:id', canActivate:[AuthGuardService], component: SingleBookComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
