import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DownloadOptions } from '../../shared/modules/vgl/models';



@Component({
    selector: 'download-options-modal-content',
    templateUrl: './download-options.modal.component.html',
    styleUrls: ['./download-options.modal.component.scss']
})

export class DownloadOptionsModalContent {

    @Input() public downloadOptions: DownloadOptions;
    @Input() public onlineResource: any;


    constructor(public activeModal: NgbActiveModal) { }


    public saveChanges() {
        console.log("Save changes...");

        this.activeModal.close();
    }
    
}
