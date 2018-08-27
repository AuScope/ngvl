import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';

import { UserStateService } from '../../shared';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { routerTransition } from '../../router.animations';

import { Job, Solution } from '../../shared/modules/vgl/models';
import { JobObjectComponent } from './job-object.component';
import { JobTemplateComponent } from './job-template.component';

@Component({
  selector: 'app-job-wizard',
  templateUrl: './job-wizard.component.html',
  styleUrls: ['./job-wizard.component.scss'],
  animations: [routerTransition()]
})
export class JobWizardComponent implements OnInit {

  jobIncomplete: boolean = false;
  cancelled: boolean = false;

  solutions: Solution[];
  private _solutionsSub;

  @ViewChild(JobObjectComponent)
  private jobObject: JobObjectComponent;

  @ViewChild(JobTemplateComponent)
  private jobTemplate: JobTemplateComponent;

  constructor(private userStateService: UserStateService,
              private vglService: VglService,
              private location: Location) {}

  ngOnInit() {
    this._solutionsSub = this.userStateService.selectedSolutions.subscribe(
      solutions => this.solutions = solutions
    );
  }

  ngOnDestroy() {
    // Store the current job object in the userStateService unless cancelled. Might not work with a viewchild?
    if (!this.cancelled) {
      this.stashUserState();
    }

    // Clean up subs
    this._solutionsSub.unsubscribe();
  }

  submit() {
    // Store the current user state.
    this.stashUserState();

    const job: Job = this.getJobObject();
    const template: string = this.getTemplate();

    // Submit the job to the backend
    this.vglService.submitJob(job, template, this.solutions).subscribe(resp => {
      console.log(resp);
    });

  }

  cancel() {
    this.cancelled = true;
    this.stashUserState();
    this.location.back();
  }

  getJobObject(): Job {
    return this.jobObject.getJobObject();
  }

  getTemplate(): string {
    return this.jobTemplate.template;
  }

  private stashUserState() {
    // Store the current state of the job object in the user state.
    this.userStateService.updateJob(this.getJobObject());

    // Update the current template
    this.userStateService.updateJobTemplate(this.getTemplate());
  }

}
