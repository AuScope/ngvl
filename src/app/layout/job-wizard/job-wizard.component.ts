import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, ParamMap, UrlSegment } from '@angular/router';
import { MessageService } from 'primeng/api';

import { UserStateService } from '../../shared';
import { VglService } from '../../shared/modules/vgl/vgl.service';
import { routerTransition } from '../../router.animations';

import { Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Job, Solution } from '../../shared/modules/vgl/models';
import { JobObjectComponent } from './job-object.component';
import { JobSolutionsSummaryComponent } from './job-solutions-summary.component';
import { JobDatasetsComponent } from './job-datasets.component';

@Component({
  selector: 'app-job-wizard',
  templateUrl: './job-wizard.component.html',
  styleUrls: ['./job-wizard.component.scss'],
  animations: [routerTransition()]
})
export class JobWizardComponent implements OnInit, OnDestroy {

  jobIncomplete: boolean = false;
  cancelled: boolean = false;
  noSave: boolean = false;

  solutions: Solution[];
  private _solutionsSub;

  private routeSub;

  @ViewChild(JobObjectComponent)
  private jobObject: JobObjectComponent;

  @ViewChild(JobSolutionsSummaryComponent)
  private solutionsComponent: JobSolutionsSummaryComponent;

  @ViewChild(JobDatasetsComponent)
  private jobDatasetsComponent: JobDatasetsComponent;

  constructor(private userStateService: UserStateService,
              private vglService: VglService,
              private location: Location,
              private router: Router,
              private route: ActivatedRoute,
              private messageService: MessageService) {}

  ngOnInit() {
    // Check the URL and parameters to determine whether we're creating a new
    // job or loading an existing one.
    this.routeSub = combineLatest(this.route.url, this.route.paramMap).pipe(
      switchMap(([parts, params]) => {
        if (parts[0].path == 'new') {
          // Load a new, empty job object for the user to manage.
          return this.userStateService.newJob();
        }
        else if (parts[0].path == 'job' && params.has('id')) {
          // Load the specified job from the server
          const id = parseInt(params.get('id'));
          return this.userStateService.loadJob(id).pipe(
            // Notify the user of job load status as a side-effect, then pass on
            // the job object unchanged.
            map(job => {
              this.messageService.add({
                severity: 'success',
                summary: 'Load success',
                detail: `Job ${job.id} loaded successfully.`
              });
              return job;
            })
          );
        }
      })
    ).subscribe(() => {
        // Only load job downloads after job has loaded
        this.jobDatasetsComponent.loadJobInputs();
    });

    this._solutionsSub = this.userStateService.selectedSolutions.subscribe(
      solutions => this.solutions = solutions
    );
  }

  ngOnDestroy() {
    // Clean up subs
    this._solutionsSub.unsubscribe();
    this.routeSub.unsubscribe();
  }

  save() {
    this.noSave = true;
    this.messageService.clear();
    this.messageService.add({severity: 'info', summary: 'Saving job...', detail: '', sticky: true});

    this.doSave().subscribe((resp: Job) => {
      this.router.navigate(['/wizard/job', resp.id]);
    });

  }

  submit() {
    this.noSave = true;
    this.messageService.clear();
    this.messageService.add({severity: 'info', summary: 'Submitting job...', detail: '', sticky: true});

    // Save the job first, then submit it an navigate away.
    this.doSave().subscribe(savedJob => {
      this.vglService.submitJob(savedJob).subscribe(
        submitted => {
          this.messageService.add({
            severity: 'success',
            summary: 'Submitted',
            detail: `Job ${savedJob.id} submitted successfully.`,
            life: 10000
          });
          this.router.navigate(['/jobs']);
        },
        error => {
          console.log('Failed to submit job: ' + error);
        }
      );
    });
  }

  private doSave(): Observable<Job> {
    // Save the job to the backend
    return this.vglService.saveJob(this.getJobObject(),
                                   this.userStateService.getJobDownloads(),
                                   this.userStateService.getJobTemplateWithVars(),
                                   this.userStateService.getSolutionsCart());
  }

  cancel() {
    this.location.back();
  }

  getJobObject(): Job {
    return this.jobObject.getJobObject();
  }

}
