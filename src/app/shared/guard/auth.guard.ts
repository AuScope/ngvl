import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';

import { UserStateService } from '../services/user-state.service';
import { ANONYMOUS_USER, User } from '../modules/vgl/models';

@Injectable()
export class AuthGuard implements CanActivate {
  private currentUser: User;

  constructor(private router: Router,
              private userStateService: UserStateService) {}

  canActivate() {
    if (localStorage.getItem('isLoggedin') &&
        this.currentUser !== ANONYMOUS_USER) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
