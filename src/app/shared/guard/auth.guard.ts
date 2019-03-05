import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { UserStateService } from '../services';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router,
              private authService: AuthService,
              private userStateService: UserStateService) {}

  canActivate(router: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    const url: string = state.url;
    return this.checkLogin(url);
  }

  checkLogin(url: string): Observable<boolean> | boolean {
    if (this.authService.isLoggedIn) {
        // Check T&C's have been accepted
        return this.userStateService.user.map(
            user => {
                if (user.acceptedTermsConditions !== undefined && user.acceptedTermsConditions > 0) {
                    return true;
                } else {
                    this.router.navigate(['/user'], { queryParams: { notacs: 1 } });
                    return true;
                }
            }
        );
    }
    // Store the redirect url for use after logging in.
    this.authService.redirectUrl = url;

    // Navigate to the login page
    this.router.navigate(['/login']);
    return false;
  }
}
