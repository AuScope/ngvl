import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { UserStateService } from '../../shared';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { routerTransition } from '../../router.animations';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Job, Solution, JobDownload } from '../../shared/modules/vgl/models';
import { JobObjectComponent } from './job-object.component';
import { JobSolutionsSummaryComponent } from './job-solutions-summary.component';

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

  @ViewChild(JobSolutionsSummaryComponent)
  private solutionsComponent: JobSolutionsSummaryComponent;

  constructor(private userStateService: UserStateService,
              private vglService: VglService,
              private location: Location,
              private router: Router) {}

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

  save() {
    this.doSave().subscribe(resp => {
      console.log('Saved: ' + resp);
    });
  }

  submit() {
    // Save the job first, then submit it an navigate away.
    this.doSave().subscribe(savedJob => {
      this.vglService.submitJob(savedJob).subscribe(
        submitted => {
          this.router.navigate(['/jobs']);
        },
        error => {
          console.log('Failed to submit job: ' + error);
        }
      );
    });
  }

  private doSave(): Observable<Job> {
    // Store the current user state.
    this.stashUserState();

    // Save the job to the backend
    return this.vglService.saveJob(this.getJobObject(),
                                   this.userStateService.getJobDownloads(),
                                   this.getTemplate(),
                                   this.solutions);
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
    return this.solutionsComponent.template;
  }

  private stashUserState() {
    // Store the current state of the job object in the user state.
    this.userStateService.updateJob(this.getJobObject());

    // Update the current template
    this.userStateService.updateJobTemplate(this.getTemplate());
  }

}
