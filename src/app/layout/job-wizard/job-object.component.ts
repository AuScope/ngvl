import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserStateService } from '../../shared';
import { JobsService } from '../jobs/jobs.service';
import { ComputeService, MachineImage, ComputeType, Job } from '../../shared/modules/vgl/models';
import { VglService } from '../../shared/modules/vgl/vgl.service';


@Component({
    selector: 'app-job-object',
    templateUrl: './job-object.component.html',
    styleUrls: ['./job-object.component.scss']
})
export class JobObjectComponent implements OnInit {

  // Local copy of the UserStateService Job object
  job: Job;

    // Use walltime flag. Display purposes only, not stored in Job
    // (but actual walltime will be if useWalltime==true)
    useWalltime: boolean;
    // Job compute parameters loaded from server
    computeProviders: ComputeService[] = [];
    toolboxes: MachineImage[] = [];
    resources: ComputeType[] = [];


  constructor(private userStateService: UserStateService,
              private jobsService: JobsService,
              private vgl: VglService) { }


    /**
     * Load the compute options (providers, toolboxes andf resources) from the
     * server. Some options are only loaded when a previous option selection has
     * been made, so we check for this and load more options if required.
     */
  ngOnInit() {
    this.userStateService.job.subscribe(job => {
      this.job = job;

      // Assign a default name if there isn't one
      if(this.job.name === "") {
        const datePipe = new DatePipe('en-AU');
        this.job.name = "VGL Job - " + datePipe.transform(new Date(), 'medium')
      }

      // Load compute services
      this.jobsService.getComputeServices().subscribe(
        computeServices => {
          this.computeProviders = computeServices;
        }
      );

      // Load toolboxes if the user had already selected one
      this.computeProviderChanged(this.job.computeServiceId);
    });
  }

    /**
     * Make the Job available to the wizard
     */
    public getJobObject(): Job {
        // Disregard walltime value present in UI if User has chosen not to use it
        if(!this.useWalltime) {
            this.job.walltime = undefined;
        }
        return this.job;
    }


    /**
     * When compute provider is changed, load toolboxes
     *
     * @param computeServiceId the new compute provider id.
     */
    public computeProviderChanged(computeServiceId): void {
      if (computeServiceId && computeServiceId !== "") {
        // If we have a list of solutions use that, otherwise use the job id if
        // one has been assigned. If neither is available, don't load any
        // toolboxes yet.
        const solutions = this.userStateService.getSolutionsCart().map(s => s['@id']);
        this.vgl.getMachineImages(computeServiceId, solutions, this.job.id)
          .subscribe(images => this.toolboxes = images);

        // Load the resources if User had already selected one
        const computeVmId = this.job.computeVmId;
        if(computeVmId && computeVmId !== "") {
          this.jobsService.getComputeTypes(computeServiceId, computeVmId)
            .subscribe(computeTypes => this.resources = computeTypes);
        }
      }
    }

    /**
     * When toolbox is changed, load resources
     *
     * @param event the toolbox select change event
     */
    public toolboxChanged(toolbox): void {
        // Load compute types (Resources)
        if(toolbox && toolbox !== "") {
            this.userStateService.job.subscribe(
                job => {
                    this.jobsService.getComputeTypes(job.computeServiceId, toolbox).subscribe(
                        computeTypes => {
                            this.resources = computeTypes;
                        }
                    );
                }
            );
        }
    }

}
