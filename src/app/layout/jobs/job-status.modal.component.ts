import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'job-status-modal-content',
    templateUrl: './job-status.modal.component.html'
})

export class JobStatusModalContent {

    @Input() job: any;
    @Input() logs: any;


    constructor(public activeModal: NgbActiveModal) { }

}
