import { Component, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'record-modal-content',
    templateUrl: './record.modal.component.html'
})

export class RecordModalContent {

    @Input() record: any;

    constructor(public activeModal: NgbActiveModal) { }
}
