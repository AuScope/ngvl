import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

import { UserStateService, SOLUTIONS_VIEW } from '../../shared';

@Component({
  selector: 'app-solutions',
  templateUrl: './solutions.component.html',
  styleUrls: ['./solutions.component.scss'],
  animations: [routerTransition()]
})
export class SolutionsComponent implements OnInit {

  constructor(private userStateService: UserStateService) {}

  ngOnInit() {
    // Notify user state that we're using the solutions view
    this.userStateService.setView(SOLUTIONS_VIEW);
  }

}
