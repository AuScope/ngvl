import { Component, Input, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserStateService } from '../../../shared';
import { Job } from '../../../shared/modules/vgl/models';
import { JobBrowserComponent } from '../job-browser.component';
import { JobInputsComponent } from '../job-inputs.component';
import { TreeNode } from 'primeng/api';


@Component({
    selector: 'jobs-inputs-browser-modal-content',
    templateUrl: './job-inputs-browser.modal.component.html',
    styleUrls: ['./job-inputs-browser.modal.component.scss']
})


export class JobInputsBrowserModalContent {

    @ViewChild('jobBrowser')
    public jobBrowser: JobBrowserComponent;

    @ViewChild('jobInputs')
    public jobInputs: JobInputsComponent;

    selectedJobNode: TreeNode = null;
    selectedJob: Job = null;


    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private userStateService: UserStateService) { }


    /**
     * Copy selected inputs to the user state for use in the job being
     * defined
     */
    public copySelectionsToJob(): void {
        // TODO: Persist inputs in user state, e.g:
        // this.userStateService.persistDatasets(this.jobInputs.selectedJobDownloads, this.jobInputs.selectedCloudFiles);

        this.activeModal.close();
    }

}
