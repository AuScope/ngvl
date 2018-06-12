import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-logged-in',
  template: `
    <p>
      logged-in works!
    </p>
  `,
  styles: []
})
export class LoggedInComponent implements OnInit {

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Inform the auth service
    this.authService.onLoggedIn();
  }

}
