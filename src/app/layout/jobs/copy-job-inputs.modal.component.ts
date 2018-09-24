import { Component, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Job, JobDownload, CloudFileInformation } from '../../shared/modules/vgl/models';
import { JobBrowserComponent } from './job-browser.component';
import { JobInputsComponent } from './job-inputs.component';
import { TreeNode } from 'primeng/api';


@Component({
    selector: 'copy-jobs-inputs-modal-content',
    templateUrl: './copy-job-inputs.modal.component.html',
    styleUrls: ['./copy-job-inputs.modal.component.scss']
})


export class CopyJobInputsModalContent {

    @ViewChild('jobBrowser')
    public jobBrowser: JobBrowserComponent;

    @ViewChild('jobInputs')
    public jobInputs: JobInputsComponent;

    selectedJobNode: TreeNode = null;
    selectedJob: Job = null;


    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal) { }


    /**
     * Make selected job ID and selected inputs available to caller when modal closed
     */
    public copySelectionsToJob(): void {
        const jobId: number = this.jobBrowser.getSelectedJob().id;
        const selectedJobDownloads: JobDownload[] = this.jobInputs.getSelectedJobDownloads();
        const selectedJobCloudFiles: CloudFileInformation[] = this.jobInputs.getSelectedCloudFiles();
        this.activeModal.close({jobId: jobId, jobDownloads: selectedJobDownloads, jobCloudFiles: selectedJobCloudFiles});
    }

}
