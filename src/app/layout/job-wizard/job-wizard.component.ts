import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { UserStateService } from '../../shared';
import { Solution } from '../../shared/modules/vgl/models';

@Component({
  selector: 'app-job-wizard',
  templateUrl: './job-wizard.component.html',
  styleUrls: ['./job-wizard.component.scss']
})
export class JobWizardComponent implements OnInit {

  jobIncomplete: boolean = true;

  constructor(private userStateService: UserStateService) {}

  ngOnInit() {
  }

}
