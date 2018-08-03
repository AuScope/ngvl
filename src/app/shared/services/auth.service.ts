import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

import { UserStateService } from './user-state.service';

@Injectable()
export class AuthService {

  constructor(private userStateService: UserStateService,
              private router: Router,
              private http: HttpClient) {}

  login(): void {
    // Navigate to the VGL login screen.
    window.location.href = '/VGL-Portal/oauth/google_login.html';
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');    
    // Hit the VGL logout endpoint, then navigate to the dashboard.
    this.http.get('/VGL-Portal/j_spring_security_logout')
      // VGL redirects from the spring logout to the old portal page, which 404's,
      // so catch that error and continue.
      .catch((err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // A client-side network error, so it's a genuine problem.
          console.error('An error occurred:', err.error.message);
        }
        else {
          // Otherwise, check the response code.
          if (err.status == 404) {
            console.log('Ignoring old redirect/not-found from VGL spring logout.');
          }
          else {
            console.error(`VGL backend returned error code ${err.status}, body was ${err.error}`);
          }
        }

        // Return an empty observable so the app can continue.
        return Observable.of<any>({});
      })
      .subscribe(resp => {
        // Trigger an update in the user state service to get the new username, then
        // navigate to the dashboard.
        this.userStateService.updateAnonymousUser();
        this.userStateService.updateBookMarks();
        this.router.navigate(['/dashboard']);
      });
  }

  onLoggedIn() {
    console.log('AuthService.onLoggedIn()');
    localStorage.setItem('isLoggedIn', 'true');

    // Trigger an update in the user state service to get the new username, then
    // navigate to the saved url. Reset the saved url so it isn't retained for
    // later logins.
    this.userStateService.updateUser();
    this.userStateService.updateBookMarks();
    const savedUrl = this.resetRedirectUrl();
    const redirect = savedUrl ? savedUrl : '/dashboard';
    this.router.navigate([redirect]);
  }

  public get isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === "true";
  }

  public get redirectUrl(): string {
    return localStorage.getItem('redirectUrl');
  }

  public set redirectUrl(url: string) {
    localStorage.setItem('redirectUrl', url);
  }

  resetRedirectUrl(): string {
    const url = localStorage.getItem('redirectUrl');
    localStorage.removeItem('redirectUrl');
    return url;
  }
}
