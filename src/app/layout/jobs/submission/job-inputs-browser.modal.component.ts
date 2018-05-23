import { Component, Input } from '@angular/core';

import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VglService } from '../../../shared/modules/vgl/vgl.service';

import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { Job } from '../../../shared/modules/vgl/models';



@Component({
    selector: 'jobs-inputs-browser-modal-content',
    templateUrl: './job-inputs-browser.modal.component.html',
    styleUrls: ['./job-inputs-browser.modal.component.scss']
})


export class JobInputsBrowserModalContent {

    @Input() public treeJobsData: TreeNode[] = [];
    selectedJobNode: TreeNode = null;
    selectedJob: Job = null;


    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private vglService: VglService) { }


    /**
     * 
     * @param event 
     */
    public jobSelected(event): void {

    }


    /**
     * 
     */
    public copySelectionsToJob(): void {

    }

}
