import { Component, OnInit } from '@angular/core';

import { UserStateService } from '../../shared';
import { routerTransition } from '../../router.animations';


@Component({
  selector: 'app-job-wizard',
  templateUrl: './job-wizard.component.html',
  styleUrls: ['./job-wizard.component.scss'],
  animations: [routerTransition()]
})
export class JobWizardComponent implements OnInit {

  jobIncomplete: boolean = true;

  constructor(private userStateService: UserStateService) {}

  ngOnInit() {
  }

}
