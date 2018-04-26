import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CSWRecordModel } from 'portal-core-ui/model/data/cswrecord.model';

import { TreeNode } from 'primeng/api';
import { TreeTable } from 'primeng/treetable';
import { OnlineResourceModel } from 'portal-core-ui/model/data/onlineresource.model';


@Component({
    selector: 'confirm-datasets-modal-content',
    templateUrl: './confirm-datasets.modal.component.html',
    styleUrls: ['./confirm-datasets.modal.component.scss']
})

export class ConfirmDatasetsModalContent {

    @Input() public cswRecordTreeData: TreeNode[] = [];


    constructor(public activeModal: NgbActiveModal) { }


    /**
     * TODO: Do
     */
    public downloadResource(event): void {
        event.stopPropagation();
        console.log("download");
    }


    /**
     * TODO: Do
     */
    public editDownload(event): void {
        event.stopPropagation();
        console.log("edit download");
    }

}
