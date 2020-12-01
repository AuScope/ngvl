import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { UserStateService } from '../../shared';
import { ComputeService, MachineImage, ComputeType, Job } from '../../shared/modules/vgl/models';
import { VglService } from '../../shared/modules/vgl/vgl.service';

@Component({
    selector: 'app-job-object',
    templateUrl: './job-object.component.html',
    styleUrls: ['./job-object.component.scss']
})
export class JobObjectComponent implements OnDestroy, OnInit {

  // Local copy of the UserStateService Job object
  job: Job;

  // Use walltime flag. Display purposes only, not stored in Job
  // (but actual walltime will be if useWalltime==true)
  useWalltime: boolean;
  // Job compute parameters loaded from server
  computeProviders: ComputeService[] = [];
  toolboxes: MachineImage[] = [];
  resources: ComputeType[] = [];

  private _jobSub;
  private _solutionsSub;

  @ViewChild('jobObjectForm', {static: true})
  form!: NgForm;

  constructor(private userStateService: UserStateService,
              private vgl: VglService) {
    // Initialise the job object so we can bind to it and copy parameters as
    // required.
    this.job = this.userStateService.createEmptyJob();
  }

  /**
   * Load the compute options (providers, toolboxes andf resources) from the
   * server. Some options are only loaded when a previous option selection has
   * been made, so we check for this and load more options if required.
   */
  ngOnInit() {
    // Update compute services list for new job.
    this._solutionsSub = this.userStateService.selectedSolutions.subscribe(solutions => {
      this.userStateService.updateJob({
        ...this.job,
        jobSolutions: solutions.map(s => s['@id'])
      });
    });

    this._jobSub = this.userStateService.job.subscribe(job => {
      Object.assign(this.job, job || {});
      if (job.walltime !== null) {
        this.useWalltime = true;
      }
      this.updateComputeServices();
    });
  }

  ngOnDestroy() {
    if (this._jobSub) {
      this._jobSub.unsubscribe();
    }

    if (this._solutionsSub) {
      this._solutionsSub.unsubscribe();
    }
  }

  updateComputeServices() {
    this.vgl.getComputeServicesForSolutions(this.job.jobSolutions).subscribe(
      computeServices => {
        this.computeProviders = computeServices;

        if (!this.computeProviders || this.computeProviders.length === 0) {
          this.job.computeVmId = null;
          this.job.computeServiceId = null;
        } else {
          //
          // Reset this.job.computeServiceId if it is no longer a valid option
          //
          if (!this.computeProviders.find(p => p.id === this.job.computeServiceId)) {
            this.job.computeVmId = null;
            this.job.computeServiceId = this.computeProviders[0].id;
          }
        }

        // Load toolboxes if the user had already selected one
        this.computeProviderChanged();
      }
    );
  }

  /**
   * Make the Job available to the wizard
   */
  public getJobObject(): Job {
    // Disregard walltime value present in UI if User has chosen not to use it
    if (!this.useWalltime) {
      this.job.walltime = undefined;
    }
    return this.job;
  }

  /**
   * When compute provider is changed, load toolboxes
   *
   * @param computeServiceId the new compute provider id.
   */
  public computeProviderChanged(): void {
    const computeServiceId: string = this.job.computeServiceId;

    if (computeServiceId && computeServiceId !== "") {
      // If we have a list of solutions use that, otherwise use the job id if
      // one has been assigned. If neither is available, don't load any
      // toolboxes yet.
      this.vgl.getMachineImages(computeServiceId, this.job.jobSolutions, null)
        .subscribe(images => {
          this.toolboxes = images;

          // Select the first image in the list by default, and update resources accordingly.
          if (this.toolboxes && this.toolboxes.length > 0) {
            // TODO: Check if existing job already has a toolbox selected
            let toolbox: MachineImage = this.toolboxes.find(it => it.imageId === this.job.computeVmId);
            if (toolbox === undefined) {
              toolbox = this.toolboxes[0];
              this.job.computeVmId = toolbox.imageId;
            }
          } else {
            this.job.computeVmId = null;
          }
          this.toolboxChanged();
        });
        if (this.isHPCProvider(computeServiceId)) {
          this.useWalltime = true;
        }
    } else {
      this.toolboxes = [];
      this.job.computeVmId = null;
      this.toolboxChanged();
    }
  }

  /**
   * Update when user selects a toolbox.
   *
   * @param event the toolbox select change event
   */
  public toolboxChanged(): void {
    let toolbox = null;
    const imageId = this.job.computeVmId;

    if (imageId) {
      toolbox = this.toolboxes.find(it => it.imageId === imageId);
    }

    if (toolbox) {
      // Set the computeVmRunCommand and any annotations on the job to match the
      // new toolbox.
      this.job.computeVmRunCommand = toolbox.runCommand;
      this.job.annotations = toolbox.annotations;

      // When toolbox is changed and we're using a cloud compute provider, reload
      // the available cloud resources.
      if (this.isCloudProvider(this.job.computeServiceId)) {
        if (imageId && imageId !== "") {
          this.vgl.getComputeTypes(this.job.computeServiceId, imageId)
            .subscribe(computeTypes => {
              this.resources = computeTypes;
            });
        }
      }
    } else {
      this.resources = [];
      this.job.computeVmRunCommand = null;
    }
  }

  public isCloudProvider(providerId: string): boolean {
    return this.vgl.isCloudProvider(providerId);
  }

  public isHPCProvider(providerId: string): boolean {
    return this.vgl.isHPCProvider(providerId);
  }

}
