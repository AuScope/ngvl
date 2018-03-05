import { Component, OnInit } from '@angular/core';

import { SolutionsService } from '../solutions.service';

import { UserStateService } from '../../../shared';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-solutions-browser',
  templateUrl: './solutions-browser.component.html',
  styleUrls: ['./solutions-browser.component.scss']
})
export class SolutionsBrowserComponent implements OnInit {

  constructor(
    private solutionsService: SolutionsService,
    private userStateService: UserStateService
  ) {}

  ngOnInit() {
    environment.portalBaseUrl
  }

}
