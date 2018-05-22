import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';

import { AuthService } from '../shared/services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {}

  doLogin() {
    this.authService.login();
  }
}
