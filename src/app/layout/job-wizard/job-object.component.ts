import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserStateService } from '../../shared';
import { JobsService } from '../jobs/jobs.service';
import { ComputeService, MachineImage, ComputeType, Job } from '../../shared/modules/vgl/models';


@Component({
    selector: 'app-job-object',
    templateUrl: './job-object.component.html',
    styleUrls: ['./job-object.component.scss']
})
export class JobObjectComponent implements OnInit {

    // Local copy of the UserStateService Job object
    private job: Job;
    // Use walltime flag. Display purposes only, not stored in Job
    // (but actual walltime will be if useWalltime==true)
    private useWalltime: boolean;
    // Job compute parameters loaded from server
    private computeProviders: ComputeService[] = [];
    private toolboxes: MachineImage[] = [];
    private resources: ComputeType[] = [];

    
    constructor(private userStateService: UserStateService, private jobsService: JobsService) { }


    /**
     * Retrieve the current Job object from UserStateService, and load the
     * compute options (providers, toolboxes andf resources) from the server.
     * Some options are only loaded when a previous option selection has been
     * made, so we check for this and load more options if required.
     */
    ngOnInit() {
        // Load existing Job from UserStateService
        this.userStateService.job.subscribe(
            job => {
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
                        // Load toolboxes if the user had already selected one
                        if(this.job.computeServiceId && this.job.computeServiceId !== "") {
                            this.jobsService.getMachineImages(job.computeServiceId).subscribe(
                                machineImages => {
                                    this.toolboxes = machineImages;
                                    // Load the resources if User had already selected one
                                    if(this.job.computeVmId && this.job.computeVmId !== "") {
                                        this.userStateService.job.subscribe(
                                            job => {
                                                this.jobsService.getComputeTypes(job.computeServiceId, this.job.computeVmId).subscribe(
                                                    computeTypes => {
                                                        this.resources = computeTypes;
                                                    }
                                                );
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    }
                );
            }
        );
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
     * @param event the compute provider select change event
     */
    public computeProviderChanged(cp): void {
        // Load machine images (Toolbox)
        if(cp && cp !== "") {
            this.jobsService.getMachineImages(cp).subscribe(
                machineImages => {
                    this.toolboxes = machineImages;
                }
            );
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
