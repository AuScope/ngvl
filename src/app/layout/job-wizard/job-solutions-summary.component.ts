import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { UserStateService } from '../../shared';
import { Solution } from '../../shared/modules/vgl/models';

@Component({
  selector: 'app-job-solutions-summary',
  templateUrl: './job-solutions-summary.component.html',
  styleUrls: ['./job-solutions-summary.component.scss']
})
export class JobSolutionsSummaryComponent implements OnInit {

  constructor(private userStateService: UserStateService) {}

  ngOnInit() {
  }

}
