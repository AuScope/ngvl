import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { Solution } from '../../shared/modules/vgl/models';

@Component({
  selector: 'app-job-solution-vars',
  templateUrl: './job-solution-vars.component.html',
  styleUrls: ['./job-solution-vars.component.scss']
})
export class JobSolutionVarsComponent implements OnInit {

  @Input() solution: Solution | null;
  @Output() solutionChange = new EventEmitter<Solution>();

  constructor() { }

  ngOnInit() {
  }

}
