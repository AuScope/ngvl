import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserStateService } from '../shared';

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

  constructor(private router: Router,
              private userStateService: UserStateService) {}

  ngOnInit() {
    // Trigger an update in the user state service to get the new username, then
    // navigate to the dashboard.
    this.userStateService.updateUser();
    this.router.navigate(['/dashboard']);
  }

}
