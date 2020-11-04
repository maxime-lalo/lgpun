import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
/*
 * HttpClient
 */
import { HttpClientModule } from '@angular/common/http';
/*
 * Forms 
 */
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

/*
 *  Components  
 */
import { AppComponent } from './app.component';
import { SignupComponent } from './auth/signup/signup.component';
import { SigninComponent } from './auth/signin/signin.component';
import { BookListComponent } from './book-list/book-list.component';
import { SingleBookComponent } from './book-list/single-book/single-book.component';
import { BookFormComponent } from './book-list/book-form/book-form.component';
import { HeaderComponent } from './header/header.component';

/*
 * Services
 */
import { AuthService } from './services/auth.service';
import { BooksService } from './services/books.service';
import { AuthGuardService } from './services/auth-guard.service';
import { CardsListComponent } from './cards-list/cards-list.component';
import { PartyComponent } from './party/party.component';
import { PartyCreateComponent } from './party/party-create/party-create.component';
import { PartyJoinComponent } from './party/party-join/party-join.component';
import { HomeComponent } from './home/home.component';
import { PartyLobbyComponent } from './party/party-lobby/party-lobby.component';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    SigninComponent,
    BookListComponent,
    SingleBookComponent,
    BookFormComponent,
    HeaderComponent,
    CardsListComponent,
    PartyComponent,
    PartyCreateComponent,
    PartyJoinComponent,
    HomeComponent,
    PartyLobbyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  exports: [
    HeaderComponent
  ],
  providers: [
    AuthService,
    BooksService,
    AuthGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
