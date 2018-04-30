import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'job-status-modal-content',
    templateUrl: './job-status.modal.component.html'
})

export class JobStatusModalContent {

    @Input() job: any;
    @Input() logs: any;

    /*
    // TODO: get ststaus description displaying on dialog
    statusDescriptions: {
        "Failed" : "An unexpected error has occurred. Please check the audit log for more information.",
        "Active" : "The job has successfully allocated computing resources and has begun processing the job script.",
        "Pending" : "The job has successfully allocated computing resources but is awaiting the start of the job script.",
        "Done" : "The job has finished executing the job script.",
        "Cancelled" : "The job execution has been cancelled by the user.",
        "Saved" : "The job has not yet been submitted for processing.",
        "In Queue" : "The job is in queue for submission to the cloud.",
        "ERROR" : "An unexpected error has occurred. Please check the audit log for more information.",
        "DELETED" : "The job has been deleted by the user.",
        "Provisioning" : "The job is currently trying to allocate computing resources.",
        "WALLTIME EXCEEDED" : "The job exceeded the walltime specified and has terminated."
    }
    */

    constructor(public activeModal: NgbActiveModal) { }

}
